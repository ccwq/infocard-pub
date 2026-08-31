# html2canvas 本地导出验收：先 HTTP，再 file:// 失败排查

## 适用场景
信息卡页面带“保存 PNG”按钮，导出依赖 `html2canvas`。

## 关键经验
- **不要只在 `file://` 预览里验收导出按钮。**
  - `file://` 预览下，引用本地图片或跨源资源时，`html2canvas` 容易出现 **tainted canvas**，最终在 `toDataURL('image/png')` 处失败。
- **先用本地 HTTP 服务验收。**
  - 推荐：`python3 -m http.server <port> --directory <repo_root>`
  - 再打开 `http://127.0.0.1:<port>/docs/<slug>.html` 进行点击验收。
- **验收顺序**
  1. 先在本地 HTTP 页面上点击保存 PNG。
  2. 确认下载到默认目录，文件名为 `.png`。
  3. 再检查图片是否完整、无裁切。
- **若控制台报 `SecurityError: Failed to execute 'toDataURL'... Tainted canvases may not be exported`**
  - 优先判断是否是 `file://` 预览导致，而不是先改页面结构。
  - 重新切到 HTTP 预览后再测一次，只有 HTTP 预览也失败才进入页面级排查。

## 备注
- 这条规则适合所有依赖 `html2canvas` 的信息卡发布验收。
- 如果保存按钮要导出整卡，优先以“页面可访问 + 按钮可点 + 实际下载成功”作为通过标准。