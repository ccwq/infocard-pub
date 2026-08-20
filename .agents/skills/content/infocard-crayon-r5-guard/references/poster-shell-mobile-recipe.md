# poster-shell 移动端底部挤压 修复案例

**会话**：2026-07-26~27 Qwable-v1 信息卡
**症状**：footer/poster-note/save-row 被挤成 15% 窄列
**错误**：连续 5 轮只改 CSS，无效
**真正根因**：HTML 源码 `<div class="cards-grid">` 缺 6 个 `</div>`

## 时间线教训

| 轮 | 操作 | 结果 |
|---|---|---|
| 1 | `width:100%` on footer | 仍 56px |
| 2 | `grid-column:1/-1` | 仍 56px（父级 grid 是 skill-card） |
| 3 | `position:absolute` | 破坏文档流，footer 跑到视口顶部 |
| 4 | 改 hero-tags gap | 无关问题 |
| 5 | 改 card-num align-self | 无关问题 |
| **6** | **Playwright 检测 parent chain** | **发现 .footer 在 .skill-card 内** |
| **7** | **Python 状态机修复 HTML 嵌套** | **修复 6 处 `</div>` 缺失** |

## 修复后正确结构（Playwright 检测）

```js
// 期望
{ s: ".footer", parents: ["FOOTER.footer", "MAIN.main"] }
{ s: ".poster-note", parents: ["DIV.poster-note", "MAIN.main"] }
{ s: ".save-row", parents: ["DIV.save-row", "MAIN.main"] }
{ s: ".risk-shell", parents: ["DIV.risk-shell", "MAIN.main"] }
```

实际错误状态（修复前）：
```js
{ s: ".footer", parents: ["FOOTER.footer", "DIV.cards-grid", "DIV.skill-card", ...] }
```

## 关键观察

1. **CSS 修复不能跨多层父级 grid**：`width:100%` 和 `grid-column:1/-1` 只在直接父级生效。
2. **`getComputedStyle().gridTemplateColumns` 误导**：显示的是浏览器重排后的实际网格，不是预期网格。
3. **唯一真相**：`element.parentElement` 链 + `getBoundingClientRect().width`。
4. **HTMLParser 是诊断黄金标准**：跑完整个文件后看 `len(stack)` 是否为 0。

## 自审脚本（每次发布前必跑）

```javascript
// /tmp/qwable-footer-check.js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const mp = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await mp.goto('https://ccwq.github.io/infocard-pub/docs/20260726-qwable-local-deploy.html', { waitUntil: 'networkidle' });

  const widths = await mp.evaluate(() => {
    return ['.footer', '.poster-note', '.save-row', '.save-png'].map(s => {
      const el = document.querySelector(s);
      if (!el) return { s, missing: true };
      const r = el.getBoundingClientRect();
      return { s, x: Math.round(r.x), w: Math.round(r.width) };
    });
  });
  console.log(JSON.stringify(widths, null, 2));

  // 期望：所有 w=390（full viewport width）
  const allFullWidth = widths.every(w => w.w === 390 || w.missing);
  console.log(allFullWidth ? '✅ all footer/note elements full width' : '❌ COLLAPSED — check HTML structure');

  await browser.close();
})();
```

## 给用户的反向承诺

**绝不再发未经 self-vision-analyze 的截图。**

发布完成的定义 = git push + CDN 同步 + 4-5 屏自审通过 + 用户收到截图前我自己已检查过。