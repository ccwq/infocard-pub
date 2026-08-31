# OmniRoute vs CLIProxyAPI 信息卡移动端修复要点（2026-05-30）

## 场景
用户指出该信息卡在手机端存在两类连续问题：
1. 页面虽然已上线响应式 CSS，但手机上仍像桌面版整体缩小。
2. 进入移动布局后，白底黑边框的对比卡片仍有“边框贴正文、分隔线压文字”的紧迫感。

## 核心经验

### 1. 不要把“CSS 已发布”误判成“移动端已生效”
本次实际根因之一是页面缺少 viewport meta。即使媒体查询和移动样式已经在线上，手机浏览器仍可能按桌面宽度缩小渲染，看起来像“完全没修”。

应先核对：
- GitHub Pages 返回的 HTML 是否包含：
  - `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
- 再核对媒体查询是否真的进入移动布局
- 最后才做视觉判断

### 2. 手机端“已能看”不等于“通过验收”
本次在补 viewport 和响应式规则后，页面已进入移动布局，但用户仍通过真机截图指出：
- 白底黑边框卡片里标题和正文离边框太近
- 分隔线与上下文字缺少呼吸感

这类问题不是功能错误，而是移动端视觉失败，必须继续微调。

### 3. 高密度对比卡片的优先调参顺序
对于手机端表格改卡片后的高密度区块，优先调：
1. 条目容器左右 padding
2. 条目容器上下 padding
3. 正文 line-height
4. 标题与正文之间的下间距

优先改条目容器的整体 padding，而不是零散给单个文本节点补 margin。

## 本次有效的移动端表格微调示例
在手机媒体查询里，对 `.feat-table` 系列样式进行如下方向的调整：

- `.feat-table { padding: 6px 0; }`
- `.feat-table tr { padding: 14px 14px 12px; }`
- `.feat-table td { padding: 7px 0; line-height: 1.68; }`
- `.feat-table td:first-child { padding-bottom: 10px; }`

这些修改对“边框贴正文”和“分隔线压文字”有直接改善。

## 验收流程要点
- 用户若提供真机截图，截图应成为主要证据
- 修改后至少做一轮本地 390px 视口视觉复核
- 本地通过后再推送线上，并用 cache-busting URL 复核 HTML 源码与视觉结果
- 结论要区分：
  - 线上源码已更新
  - 移动布局已命中
  - 视觉验收已通过

这三者必须分别确认，不能混报
