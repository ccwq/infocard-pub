# 子智能体 completed 但卡质量不足（2026-07-09）

## 识别信号

子智能体状态 `completed`（非超时），HTTP 200 已上线，但内容缺标准功能：

- ❌ 缺少保存 PNG 按钮（`html2canvas` 未引入，`grep "html2canvas" docs/<slug>.html` 结果 = 0）
- ❌ `style` 字段填写错误（如 `main-style` 而非 `redswiss`）
- ❌ 页面源码含 `window.print()` 而非真实 html2canvas 导出
- ❌ 保存按钮文案不是"保存 PNG"或等价中文

**根因**：子智能体写卡时遗漏了标准脚手架（save button + CDN），不是超时，而是任务范围漏项。与 ghost-completion 不同——文件已存在且已上线，只是缺标准功能。

## 主线程补修流程

```bash
# 1. 确认只缺保存按钮（不要重写整卡）
grep -c "html2canvas" docs/<slug>.html
# 结果 = 0 → 需要补

# 2. 在 HTML </div> 结束后 </body> 前插入保存按钮 + CDN：
# <button id="save-btn">📥 保存 PNG</button>
# <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
# <script>
#   document.getElementById('save-btn').addEventListener('click', async function () {
#     const btn = this;
#     btn.disabled = true;
#     btn.textContent = '导出中…';
#     try {
#       const canvas = await html2canvas(document.body, {
#         backgroundColor: '#f5f2ec',
#         scale: 2,
#         useCORS: true,
#         scrollY: -window.scrollY,
#         windowWidth: document.documentElement.scrollWidth,
#         windowHeight: document.documentElement.scrollHeight
#       });
#       const a = document.createElement('a');
#       a.download = '<slug>.png';
#       a.href = canvas.toDataURL('image/png');
#       a.click();
#     } finally {
#       btn.disabled = false;
#       btn.textContent = '📥 保存 PNG';
#     }
#   });
# </script>

# 3. 在 CSS 最后插入按钮样式：
# #save-btn{position:fixed;bottom:20px;right:20px;z-index:9999;background:var(--red);color:#fff;border:2px solid var(--ink);padding:10px 16px;font:800 13px Inter,sans-serif;cursor:pointer;box-shadow:4px 4px 0 rgba(10,10,10,.15)}
# #save-btn:disabled{background:#888;cursor:not-allowed}

# 4. 修复 style 字段（patch meta.yaml）：
# style: main-style → style: redswiss

# 5. build + commit + push
npm run build
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "fix: add save PNG button to <slug> infocard + update style to redswiss"
git push
```

## 预防（子智能体 prompt 约束）

派发调研子智能体时，context 里必须写：
```
交付标准：
1. HTML 文件：docs/<slug>.html
2. meta.yaml：含 slug/path/date/updated/category/title/desc/tags/style（style 填 redswiss）
3. 保存按钮：必须包含 html2canvas CDN + #save-btn 按钮（红底白字固定右下角）+ export logic
4. style 字段：根据内容类型选择 redswiss / hardblue / main-style（见 style-selection-by-content-type.md）
```

**注意**：本场景与 ghost-completion 的区别：
- ghost-completion：文件不存在或 404，子智能体声称完成但无文件
- completed-lowquality：文件已存在且 HTTP 200，只是缺 save button/style 字段标准项
