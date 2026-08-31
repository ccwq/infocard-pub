---
name: infocard-crayon-r5-guard
description: crayon R5 CSS guard. Audit/modify crayon cards. Use when reviewing or patching crayon poster-shell info cards and especially when mobile layout breaks (vertical character stacking, footer/save-row collapsed to 15% width).
version: 1.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, crayon, poster-shell, css, guard, mobile, html-structure]
    related_skills: [infocard-crayon-style, infocard-publish-sop, software-development/pkwork]
---

# infocard-crayon-r5-guard · R5/R6 规范守卫

## 触发条件

以下任一发生时，必须加载本 skill 并按规范值执行：
- 用户要求审查或修改 crayon poster-shell 主题信息卡
- 用户报告「视觉不符」「不符合主题约束 infocard-crayon-style」
- 用户报告「逐字竖排」「正文被压缩」「单字竖排」等移动端布局崩溃
- 开始任何涉及 crayon 主题 CSS 的 patch/edit/write 操作

## 最高频崩溃模式：逐字竖排 / 正文列塌缩

**症状**：Chrome 移动端（390×844）正文被压缩成极窄列，每个中文单字被迫独占一行，英文单词被从中截断。视觉像"竖排"，实为 CSS 布局完全崩溃。

**根因链路（四层叠加）**：

1. **body > main 宽度锚定缺失**：`body` → `main`（无显式宽度，default = fit-content） → `.poster-shell { width: 100% }` → 100% × fit-content main = 最窄子元素宽度 → 正文列完全塌缩。

2. **两个 `@media(max-width:720px)` 块冲突**：历史维护中在两处写了移动端 CSS，后一个块覆盖前一个。若旧块（72px 列宽）未删除，新的 R5 参数（48px）被覆盖。

3. **`@media` 闭合 `}` 后的孤儿规则**：`@media` 块内的样式被错误写到 `}` 后面，变成全局规则，以更高优先级覆盖 `@media` 内的响应式值。

4. **`grid 1fr 被内容驱动的 min-width 劫持**（本次新发现，最难调试）：
   - `.skill-card { display: grid; grid-template-columns: 48px 1fr; }`
   - `.card-body { grid-column: 2; }` ← 语法正确
   - 但当 `.card-body` 内部含长 URL 或代码时，浏览器计算"内容最小宽度"后，将 `1fr` 的可用空间压缩为"总宽度 - 内容最小宽度"
   - 在极度窄屏（390px）下，`1fr` 退化为 20–40px
   - Playwright 诊断：`.card-body` 计算出 `gridTemplateColumns: "274px"`（单列），所有子元素变成 grid items 垂直堆叠
   - 修复：`width: calc(100vw - 64px) !important` 强制正文宽度基于视口而非 1fr 计算

**诊断命令**：
```bash
# 确认只有 1 个 @media 块
grep -c '@media(max-width:720px)' docs/xxx.html   # 期待：1

# 确认 @media 闭合后没有 CSS 规则（} 后应是 </style>）
grep -n '@media\|</style>' docs/xxx.html
```

## 最高危陷阱（HTML 嵌套错误，CSS 修不动）

**症状（必须能识别的 4 个）**：
1. 移动端底部 footer/poster-note/save-row 被挤成 15% 窄列（左右大量空白）
2. 页面底部出现孤立编号（如"05""15"），编号右侧正文空白
3. save-row 按钮文字单字竖排保存为 PNG
4. "来源:Hugging Face"被拆成"来源:H/Face"

**根因**：HTML 源码里 `<div class="cards-grid">` 未被对应 `</div>` 关闭。浏览器自动重排嵌套，导致下一个 cards-grid 被吸入前一个；尾部 footer/poster-note/save-row 随之落入未关闭的 skill-card → 被网格化 → 宽度被 56px 编号列限制。

**为什么 CSS 修不动**：你改 `width:100%` 不生效，因为元素的实际父级 grid 容器宽度只有 56px。`grid-column:1/-1` 在直接父级生效，但父级的父级又是另一个 grid 56px。`position:absolute` 是错误解，会把元素移到视口顶部破坏文档流。

**唯一正确的修法**：修 HTML 源码结构，关闭未闭合的 div。

**诊断命令**：
```bash
# 用 HTMLParser 找出未闭合的 div（应该看到 0）
python3 -c "
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(self): super().__init__(); self.stk=[]
    def handle_starttag(self,t,a):
        if t=='div': self.stk.append(self.getpos())
    def handle_endtag(self,t):
        if t=='div' and self.stk: self.stk.pop()
p=P(); p.feed(open('docs/xxx.html').read())
print('unclosed divs:', len(p.stk))
for pos in p.stk: print(pos)
"

# Playwright 看 .footer / .poster-note / .save-row 的真实父元素
node -e '
const{chromium}=require("playwright");
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage();
  await p.goto("https://ccwq.github.io/infocard-pub/docs/xxx.html");
  const r=await p.evaluate(()=>{
    return [".footer",".poster-note",".save-row"].map(s=>{
      const e=document.querySelector(s);
      if(!e)return{s,missing:true};
      const parents=[]; let x=e;
      while(x&&x.tagName!=="HTML"){
        parents.push(x.tagName+"."+(x.className?.split(" ")[0]||""));
        x=x.parentElement;
      }
      return{s,parents:parents.slice(0,3)};
    });
  });
  console.log(JSON.stringify(r,null,2));
  await b.close();
})();'
```

期望输出：每个元素的 parents 链应是 `MAIN > DIV.poster-shell` 或 `MAIN > DIV.cards-grid`（如果是卡片内）。**绝不能是** `MAIN > DIV.cards-grid > DIV.skill-card > ...`。

**修复算法**：在 HTML 源码中，按缩进级别逐行匹配 `<div class="cards-grid">` 和 `</div>`。每当遇到相同缩进的新 cards-grid 而前一个未关闭时，插入一个 `</div>`。

**自动修复脚本**（粘贴到 Python 运行）：
```python
import re
with open('docs/xxx.html') as f:
    html = f.read()
body_start = html.find('<body>')
body_end = html.rfind('</body>')
body = html[body_start + len('<body>'):body_end]

lines = body.split('\n')
stack = []  # (line_num, indent, class_string)
output = []
inserted = 0

for i, line in enumerate(lines, 1):
    s = line.rstrip()
    raw_indent = len(line) - len(line.lstrip())
    stripped = s.strip()

    if stripped.startswith('<div') and not stripped.endswith('/>'):
        m = re.search(r'class="([^"]*)"', stripped)
        cls = m.group(1) if m else ''
        # Detect nested cards-grid at same indent
        if 'cards-grid' in cls:
            for item in reversed(stack):
                ln, ind, item_cls = item
                if 'cards-grid' in item_cls and ind == raw_indent:
                    output.append('  </div>')
                    inserted += 1
                    while stack and stack[-1][0] >= ln:
                        stack.pop()
                    break
        stack.append((i, raw_indent, cls))

    if stripped == '</div>' and stack:
        stack.pop()
    output.append(line)

print(f"Inserted {inserted} </div>")
new_body = '\n'.join(output)
open('docs/xxx.html', 'w').write(html[:body_start + len('<body>')] + new_body + html[body_end:])
```

## 自审铁律（最重要）

**绝不在发布前依赖"git push 成功 = 修复完成"。**

- ❌ 错：patch 完 CSS → push → 发截图给用户 → 等用户反馈
- ✅ 对：patch 完 CSS → push → 自己 vision_analyze 所有屏 → 发现问题立即修 → 全部通过再发截图

**自审清单（每屏必查 4 项）**：
1. 正文是否横向正常排版，无单字竖排
2. 编号列与正文比例正常
3. 是否有内容溢出/截断/孤立空白
4. 是否有元素重叠

**当用户已经反馈"还有问题"后**：立刻停止发帖说自己"修复了"。先 vision_analyze 自己刚发的截图 → 列出问题清单 → 一次性修完 → 再次 vision_analyze → 通过后再发。

**PKWork 循环不可压缩**：每个 round 必须包含 自审 → 截图 → 自审 通过才算 round 完成。

## DOM 真相原则

`getComputedStyle().gridTemplateColumns` **可能误导**。它显示的是当前实际网格，但实际"网格"可能是浏览器重排嵌套的错误结构。

**真正可靠**：`element.getBoundingClientRect()` + `element.parentElement` 链。检查元素的 `width` 和 `parentClass` 是否符合预期（例如 footer 应是 poster-shell 的直接子元素，宽 100%）。

## 修完后必跑的 4 步验收

```bash
1. git push 后 sleep 50-60 等 CDN 同步
2. Playwright 截图 4-5 屏（含 h-844 真正底部）
3. vision_analyze 每张截图，自查清单 4 项
4. 全部通过 → 发截图给用户 + commit hash
```

如果任何一项失败：回到 patch 阶段，不要 push。

## 相关引用

- `references/poster-shell-mobile-recipe.md` — 2026-07 Qwable-v1 案例完整复盘，含时间线教训、HTMLParser 诊断、自审脚本

**完整修复模板**（直接复制到 CSS 开头）：
```css
/* 全链路宽度锚定（必须加到 CSS 顶层） */
*,*::before,*::after{box-sizing:border-box}
html,body{min-width:100vw;width:100%;margin:0;padding:0;overflow-x:hidden}
body>main,body>.page,.page,main{width:100%;min-width:100%}

/* 移动端响应式必须属性 */
code,pre,table{max-width:100%;overflow:auto}
.poster-shell,.poster-shell main,.poster-shell .cards-grid,
.poster-shell .skill-card,.poster-shell .card-body{max-width:100%;min-width:0}

/* poster-shell 桌面 */
.poster-shell{width:100%;max-width:760px;min-height:100vh;
  box-sizing:border-box;margin:0 auto;background:var(--crayon-bg);
  padding:28px 34px 22px}

/* R5 移动端（只有一个 @media(max-width:720px) 块） */
@media(max-width:720px){
  html,body,main,.page,.poster-shell,.cards-grid,.skill-card,.card-body
    {width:100% !important;min-width:0 !important;max-width:100% !important;box-sizing:border-box !important}
  .poster-shell{padding:22px 18px !important}
  .skill-card{grid-template-columns:48px 1fr !important;min-height:96px}
  .card-stripe{left:40px !important;top:14px;bottom:14px;width:2px;opacity:.38}
  .card-stripe::before{top:50%;left:-3px;transform:translateY(-50%);width:8px;height:8px;border:2px solid var(--crayon-bg);z-index:1}
  .card-num{display:grid !important;grid-column:1 !important;grid-row:1 !important;
    font:400 49px/.95 Georgia,"Times New Roman",serif;letter-spacing:-.07em;
    text-align:right;align-self:center;width:auto}
  /* 关键：.card-body 必须 display:grid + grid-column:2，禁止 display:block */
  .card-body{display:grid !important;grid-column:2 !important;grid-row:1 !important;
    min-width:0 !important;max-width:100% !important;
    padding:14px 10px 14px 22px;width:100% !important;box-sizing:border-box !important}
  .card-title{font-size:15px;line-height:1.25;margin:0 0 4px;min-width:0}
  .card-desc{min-width:0;overflow-wrap:anywhere;word-break:normal;font-size:12.5px;line-height:1.55}
  .stat-row{display:grid;grid-template-columns:1fr;gap:12px;padding-bottom:14px}
  .stat-item,.stat-item:nth-child(n){min-width:0;width:100%;padding:0 0 10px;
    border-right:0 !important;border-bottom:1px dashed var(--crayon-dash) !important}
  .footer{flex-direction:column}
  .poster-kicker{font-size:9px;letter-spacing:.13em;white-space:nowrap;
    max-width:100%;overflow:hidden;text-overflow:clip}
}
```

**staticCheck 必须通过才能 commit**：
```bash
node -e "const{staticCheck}=require('./scripts/verify-mobile-batch');..."
# 期待：{ok:true, errors:[]}
# RESPONSIVE_CODE 错误 → 加 code,pre,table{max-width:100%;overflow:auto}
```

**验收标准**（移动端 390×844 截图全部通过）：
- ✅ 正文横向正常排版（无逐字竖排）
- ✅ 编号列（48px）与正文列（1fr）两栏并列
- ✅ 时间轴虚线（left:40px）与圆点对齐
- ✅ poster-kicker 单行截断
- ✅ max-width:760px 生效（左右有边距，右侧无异常空白）
- ✅ stat-row 单列堆叠
- ✅ footer / save-row 按钮可见

---

## Agent-authored references

- `references/crayon-r6-mobile-fix-20260727.md` — **移动端布局修复（2026-07-27）**
  三层根因链路 + 完整修复模板 + staticCheck 流程 + 验收标准。
  触发：用户反馈「逐字竖排」「正文被压缩」「不符合约束 infocard-crayon-style」时使用。

---

## R5 规范精确值（桌面端）
## R5 规范精确值（桌面端，flex 布局）

> ⚠️ 2026-07-28 修订：序号垂直居中必须用 flex。grid 的 `align-self:center` 在 track 高度由内容撑满时失效。

```css
.poster-shell .skill-card {
  display: flex;
  flex-direction: row;
  align-items: center;              /* ← 关键：用 flex 而非 grid */
  border-bottom: 1px dashed var(--line);
  padding: 14px 0;
}
.poster-shell .card-num {
  width: 88px;
  flex-shrink: 0;                  /* ← 禁止被压缩 */
  text-align: right;
  padding-right: 25px;
  font: 700 58px/.9 Georgia, "Noto Serif SC", serif;
  color: var(--accent);
}
.poster-shell .card-stripe {
  left: 74px;                      /* ← flex 模式下序号宽88+右padding25=113，stripe在113处 */
  top: 0; bottom: 0;
  width: 3px; opacity: .8;
}
.poster-shell .card-body {
  flex: 1;                         /* ← 占据剩余空间 */
  min-width: 0;
  padding: 4px 0 4px 22px;
}
.poster-shell .card-title {
  font: 700 19px/1.35 Georgia, "Noto Serif SC", serif;
  margin: 0 0 8px;
}
.poster-shell .card-desc {
  font: 14px/1.72 Georgia, "Noto Serif SC", serif;
  color: var(--crayon-muted, #514a40);
  max-width: none;
}
```

## R5 规范精确值（移动端 @media(max-width:720px)，flex 继承）

```css
.poster-shell { padding: 22px 18px; }
.poster-shell .skill-card { padding: 14px 0; }
/* display:flex 继承自桌面，不需要重新声明 */
.poster-shell .card-num { width: 72px; font-size: 43px; padding-right: 18px; }
.poster-shell .card-stripe { left: 62px; }
.poster-shell .card-body { padding: 3px 0 3px 14px; }
.poster-shell .card-title { font-size: 16px; }
.poster-shell .card-desc { font-size: 14px; line-height: 1.65; }
```

## 致命陷阱：移动端 display:block

把 `.skill-card` 移动端设为 `display:block` 会摧毁 flex 布局，使 `.card-body` 失去 flex:1 的宽度分配，导致正文列异常窄。正确做法：**保留 `display:flex` 从桌面继承到移动端**，只调整 `width` / `padding` / `font-size`。
**正确做法：始终保留 `grid-template-columns`，只改列宽（桌面 56px → 移动 48px）**。

## poster-shell 序号垂直居中：flex 优先，grid 次之

**教训（2026-07-28）**：当 `.card-body` 内容高度大于 `.card-num` 时，grid track 高度由内容撑满，`align-self:center` 无多余空间可分配，等于失效。正确方案是 flex。

**poster-shell .skill-card 规范布局（flex，2026-07-28 修订）**：

```css
/* ✅ 正确：flex + align-items:center */
.skill-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;   /* ← 序号和正文同轴垂直居中 */
  min-width: 0;
  border-bottom: 1px dashed var(--line);
  padding: 14px 0;
}

/* 序号：显式宽度 + flex-shrink:0 */
.card-num {
  width: 88px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 25px;
  font: 700 58px/.9 Georgia, "Noto Serif SC", serif;
  color: var(--accent);
}

/* 正文：flex:1 填满 */
.card-body {
  flex: 1;
  min-width: 0;
  padding: 4px 0 4px 22px;
}

/* 竖线：相对 skill-card 定位 */
.card-stripe {
  position: absolute;
  left: 74px;           /* = card-num width(88) + card-num padding-right(25) - stripe_width(3) - gap */
  top: 0; bottom: 0;
  width: 3px; opacity: .8;
}
```

**移动端（720px）同样继承 flex，不要切回 grid**：

```css
@media (max-width: 720px) {
  .skill-card { padding: 14px 0; }
  .card-num { width: 72px; font-size: 43px; padding-right: 18px; }
  .card-stripe { left: 62px; }
  .card-body { padding: 3px 0 3px 14px; }
}
```

**验证方法（console）**：

```js
JSON.stringify({
  num_center: Math.round(document.querySelector('.card-num').getBoundingClientRect().top +
    document.querySelector('.card-num').getBoundingClientRect().height / 2),
  card_center: Math.round((document.querySelector('.skill-card').getBoundingClientRect().top +
    document.querySelector('.skill-card').getBoundingClientRect().bottom) / 2),
  diff: Math.round(
    (document.querySelector('.card-num').getBoundingClientRect().top +
     document.querySelector('.card-num').getBoundingClientRect().height / 2) -
    (document.querySelector('.skill-card').getBoundingClientRect().top +
     document.querySelector('.skill-card').getBoundingClientRect().bottom) / 2
  )
})
// 桌面端完美对齐：diff ≤ 2px
```

**grid 方案为何失效**：`.card-body` 内容更高 → grid track 高度 = body 高度 = 内容高度 → `align-self:center` 在已填满高度的 track 内无多余空白 → 等于 `start`。

## 常见失败模式

| 问题 | 根因 | 修复 |
|---|---|---|
| 正文只有 56px 宽 | `.card-body` 无 `grid-column: 2`（grid 模式下） | 加 `grid-column: 2` 或改用 flex |
| 序号在格内顶部对齐而非垂直居中 | grid + `align-self:center` 当 track 高度=内容高度时失效 | 改用 flex + `align-items:center` |
| 彩色纵线穿过标题 | `left: 72px` 或 `96px` | `left: 74px`（桌面 flex）/ `62px`（移动） |
| 移动端卡片崩塌 | 移动端用 `display:block` | 保留 flex 继承，`align-items:center` 继续生效 |

| 问题 | 根因 | 修复 |
|---|---|---|
| 正文只有 56px 宽 | `.card-body` 无 `grid-column: 2` | 加 `grid-column: 2` |
| 彩色纵线穿过标题 | `left: 72px` 或 `96px` | `left: 48px`（桌面）/ `40px`（移动） |
| 移动端卡片崩塌 | 移动端用 `display:block` | 保留 `grid-template-columns: 48px 1fr` |
| 移动端编号与正文错位 | `.card-num` 设为 `text-align:left` | 保持 `text-align:right` |
| 主题不符合约束 | CSS 值来自不存在的「R6」 | 加载本 skill → 读 spec → 对比实际值 |

## pkwork 双智能体评审流程

用户说「pkwork 使用两个智能体。去评审和开发。」时：

1. 主线程加载 `infocard-crayon-style`（读 R5 spec）
2. 启动 2 个并行 leaf 子智能体：
   - **Critic**：对标 R5 spec，审计 CSS 差异，输出 fix list
   - **Developer**：应用全部修复，运行 `staticCheck` + `npm run build` 验证
3. 等待结果汇入 → 主线程 commit + push

## R6 污染教训（2026-07-26）

某次会话中引入了「R6」CSS 值（100px 编号列、52px 字、96px stripe left、18px top/bottom 等），
这些值从未出现在 crayon-style 规范中，导致用户多次反馈「视觉不符」。
防止再次发生：每次修改 crayon CSS 前，引用本 skill 规范值，不要凭记忆或「看起来差不多」修改。
