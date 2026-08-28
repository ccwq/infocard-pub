# 三张信息卡重建计划

## 目标
重建并验证：
- docs/20260827-ai-reads-books.html
- docs/20260827-openwiki.html
- docs/20260828-stitch-google.html

## 阶段状态
- [x] 读取现状与环境，记录 ambient dirty state。
- [x] 三个子智能体并行产出各自 .docs 候选稿、sidecar、主题决策与 manifest。
- [x] Publisher 按声明的 HTML/sidecar 目标提升到正式 docs 路径；未提升 process 文件、索引或 assets。
- [ ] 经 web-capture 完成桌面/390px 移动截图与视觉审查。
- [ ] 运行 npm run verify:visual-gate、build、verify、taxonomy、leak 检查。

## 已完成输出
- .docs/rebuild-20260828-ai-reads-books/
- .docs/rebuild-20260828-openwiki/
- .docs/rebuild-20260828-stitch-google/
- docs/20260827-ai-reads-books.html 与 sidecar
- docs/20260827-openwiki.html 与 sidecar
- docs/20260828-stitch-google.html 与 sidecar

## 硬约束
- 未使用 worktree、clone、detached HEAD、force push。
- Author 只写 .docs；正式 docs 由本轮 Publisher 提升。
- 视觉证据必须来自 web-capture / agent-browser --cdp 9222；HTML/CSS/content 改动后需重捕获。

## 阻塞
- DSH 的 pwsh 执行器连续返回 node.exe ENOENT，因此无法执行 npm、promote-infocard.js、agent-browser/web-capture 或 git-up；不能伪造视觉/构建通过状态。
