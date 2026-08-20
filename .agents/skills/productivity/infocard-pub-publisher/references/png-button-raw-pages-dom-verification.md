# Pretty Mermaid PNG 按钮恢复：源码 / Raw / Pages 三段式验收

## 触发信号
用户指出某张已发布信息卡“缺少下载 PNG 按钮”或“按钮没了”。

## 这次会话沉淀的关键结论
这类问题不要先怪缓存，也不要只看当前打开的浏览器页。
正确链路是把 **源码完整性**、**仓库原始文件可见性**、**Pages 部署可见性** 三层拆开检查。

## 推荐验收顺序
1. **本地源码契约检查**
   必查 5 个标记是否同时存在：
   - `save-btn`
   - `saveCard()`
   - `html2canvas`
   - `保存 PNG`
   - 最终导出文件名（如 `pretty-mermaid-skills.png`）

   若本地源码这 5 项缺失，优先判定为**页面源码不完整**，不是缓存问题。

2. **push 后先查 raw GitHub**
   用 `raw.githubusercontent.com/<repo>/<branch>/<path>` 检查同样的 5 个标记。
   - raw 已出现 = 源码已经进仓库
   - raw 未出现 = push / rebase / 提交链路仍有问题

   这一层是“仓库事实”，通常比 Pages 更快更新。

3. **再查 GitHub Pages**
   用带时间戳 query 的 Pages URL 轮询，直到页面源码里也出现同样的 5 个标记。
   - Pages 200 但标记还没出现，说明**部署延迟**，不是修复失败
   - 只有 Pages 也出现这些标记，才算公网 HTML 部署完成

4. **最后做浏览器 DOM / 视觉复验**
   - fresh navigate 到带 cache-busting 的新 URL
   - 确认快照里出现 `button "💾 保存 PNG"`
   - 再做一次视觉检查，确认按钮没遮挡正文

## 这次会话暴露的常见误判
- **误判 1：** 看到公网旧页面，就以为 patch 没生效。实际可能是 Pages 还没更新，但 raw 已经更新。
- **误判 2：** 继续使用旧浏览器 tab / 旧快照做判断。固定按钮尤其容易被旧会话误导；发布后应 fresh navigate。
- **误判 3：** 只验证按钮文案出现，不验证导出脚本和文件名。按钮可见但脚本缺失仍算失败。

## 最小恢复块
恢复 PNG 按钮时，至少要一起补齐：
- `html2canvas` script include
- fixed `.save-btn` 样式
- `saveCard()` 函数
- `<button id="save-btn">💾 保存 PNG</button>`
- safe-area padding（避免移动端遮挡正文）

## 会话标识
- 目标页：`docs/20260604-pretty-mermaid-skills.html`
- 现象：源码里整块缺少 PNG 按钮相关能力，不是单纯缓存
- 验证特征：raw 先更新，Pages 稍后跟上，最后浏览器 DOM 显示按钮
