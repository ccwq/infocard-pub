# 双语关键词可复制区块模式

> 适用于信息卡中的“术语池 / 关键词池 / 标签池 / 关键词列表”区块。
> 该区块不应只显示英文 chip；如果这些词是用户后续要拿去拼 prompt / 写作 / 检索的，就必须提供中英双语和复制能力。

## 何时使用

当区块承担以下任一职责时，使用本模式：
- 核心术语池（如 snapshot aesthetic / candid photography）
- 标签关键词池（如 realistic skin texture / natural lighting）
- 可复用的 prompt 词根列表
- 面向用户“拿走就能用”的术语集合

## 结构规范

推荐使用行式结构，而不是纯 chip：

```html
<div class="keyword-list">
  <div class="keyword-row">
    <div class="keyword-en">snapshot aesthetic</div>
    <div class="keyword-cn">随手拍风格</div>
    <button class="keyword-copy-btn" data-copy="snapshot aesthetic / 随手拍风格" onclick="copyKeyword(this)">复制</button>
  </div>
</div>
```

### 设计要点

- **英文必须显式出现**：不要只用中文说明，不要只做标签视觉。
- **中文必须同屏出现**：帮助用户快速理解和二次组合。
- **复制按钮必须就近**：每个关键词行或每组关键词块右侧都应有复制按钮。
- **复制内容应是干净字符串**：推荐把 `英文 / 中文` 作为 `data-copy`，避免用户复制到多余装饰。
- **不要只在脚本里留英文**：如果界面上看不到英文，用户会认为“没有英语”；英文必须在 DOM 中直接可见。

## 推荐 CSS

```css
.keyword-list{display:grid;gap:8px;margin-bottom:10px}
.keyword-row{
  display:grid;
  grid-template-columns:1fr auto auto;
  gap:8px;
  align-items:center;
  border:2px solid var(--border);
  border-radius:10px;
  background:#fff;
  padding:8px 10px;
}
.keyword-en{font-family:SFMono-Regular,Consolas,Menlo,Monaco,monospace;font-size:11.5px;font-weight:700;line-height:1.45}
.keyword-cn{font-size:12px;font-weight:700;color:#444}
.keyword-copy-btn{
  padding:5px 10px;border:1.5px solid var(--border);border-radius:18px;
  background:var(--yellow);color:var(--ink);font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;
}
.keyword-copy-btn.copied{background:var(--green)}
```

## 推荐 JS

```javascript
function copyKeyword(btn) {
  var text = btn.getAttribute('data-copy');
  if (!text) return;
  var origText = btn.textContent;
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '✅ 已复制';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = origText;
      btn.classList.remove('copied');
    }, 1800);
  }).catch(function() {
    btn.textContent = '❌ 失败';
    setTimeout(function() {
      btn.textContent = origText;
    }, 1800);
  });
}
```

## 验收清单

- [ ] 关键词区块可见英文
- [ ] 关键词区块可见中文
- [ ] 每行/每组有复制按钮
- [ ] 390px 视口不横溢出
- [ ] 复制后有明确成功反馈
- [ ] 没有把关键词退化成纯展示 chip
