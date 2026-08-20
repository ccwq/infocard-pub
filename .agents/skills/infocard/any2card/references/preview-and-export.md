# any2card preview/export lessons

## html2canvas PNG 导出的正确实现（必读）

### 三类错误写法（都是坑）

**错误 1：内联 onclick**
```html
<button onclick="saveCard()">保存 PNG</button>
```
→ 问题：CSP/iframe 环境不触发，函数须全局暴露。\
→ 修复：改用 `addEventListener`：
```html
<button id="save-btn" class="save-btn">保存 PNG</button>
<script>
  document.getElementById('save-btn').addEventListener('click', saveCard);
</script>
```

**错误 2：`scrollY` 旧 API**
```js
html2canvas(el, { scrollY: -window.scrollY })   // 已废弃，截不到顶部
```
→ 修复：先滚动到顶部，再等渲染稳定：
```js
window.scrollTo(0, 0);
await new Promise(r => setTimeout(r, 80));
const canvas = await html2canvas(el, { scale: 2, ... });
```

**错误 3：`backgroundColor: '#060606'` 硬编码深色**
→ 导出的 PNG 底色是黑的，而不是透明/继承页面。\
→ 修复：用 `null`：
```js
html2canvas(el, {
  scale: 2,
  backgroundColor: null,   // 透明/继承页面背景
  useCORS: true,
  logging: false,
  windowWidth: document.body.scrollWidth,
  windowHeight: document.body.scrollHeight
});
```

### 正确完整的导出函数模板
```js
<button id="save-btn" class="save-btn">保存 PNG</button>

<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script>
  document.getElementById('save-btn').addEventListener('click', saveCard);

  async function saveCard() {
    const btn = document.getElementById('save-btn');
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = '生成中…';
    try {
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 80));
      const canvas = await html2canvas(document.querySelector('.page'), {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight
      });
      const a = document.createElement('a');
      a.download = '[slug].png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error(err);
      alert('保存失败，请重试');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  }
</script>
```

### 发布前必须验收的三件事
1. **点击按钮后真的下载了 `.png` 文件**（不是只弹出打印面板）
2. **导出的 PNG 背景是白色/米白，不是深色**
3. **PNG 内容包含页面顶部，不缺失**

---

## What changed after a real browser preview
- Long hero titles can still be acceptable, but they should stay within the first screen and stop before they dominate the entire page.
- Mobile preview should be checked visually, not just by reading the HTML.
- Save buttons that are intended for export flows should not appear in the final screenshot/export image.
- If the first preview feels too airy, tighten outer margins before redesigning the theme.

## Practical fixes that worked
- Reduce page padding first (`.page` outer spacing), then shorten the title if needed.
- If the save button is fixed-position and enters the screenshot, convert it to a normal flow element or hide it during capture.
- For dense investigation cards, prefer `portrait` and a technical/report tone unless the user explicitly wants more drama.

## Verification checklist
- First-screen title readable and not overwhelming.
- No visible export button in the final share image.
- Side gutters feel compact on phone-width viewports.
- The card still reads as a single coherent block after tightening.