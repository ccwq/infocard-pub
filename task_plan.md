# X 帖子信息卡发布与流程耗时诊断

## 目标
- 从 https://x.com/Xudong07452910/status/2094218611112263944?s=20 提取可核验事实与来源边界。
- 在主 checkout 完成一张信息卡的 `.docs` authoring、manifest promotion、视觉门禁、构建校验、提交推送和公网复核。
- 以发布过程实测与仓库流程静态分析为依据，识别过渡/冗余设计，尤其是时间消耗，并保存诊断证据。

## 阶段状态
- [ ] 读取项目记忆、记录 ambient dirty state 与运行环境。
- [ ] 浏览 X 帖子并形成 facts/research 证据。
- [ ] 选择主题并由 Author 生成 `.docs/<run-id>/<slug>/` 候选与 manifest。
- [ ] Publisher 精确 promotion 到 docs/，保留 diff/hash 证据。
- [ ] 通过 web-capture 完成桌面与 390px 移动截图、DOM grounding 和视觉审查。
- [ ] 运行 visual-gate、build、verify、taxonomy、leak 检查。
- [ ] 使用 git-up -pcP 提交推送并进行公网缓存破坏复核。
- [ ] 输出 skill-doctor 风格冲突/冗余与时间成本诊断。

## 硬约束
- 仅使用当前主 checkout，不创建/使用/清理 worktree 或 clone。
- Author 只能写 `.docs/<run-id>/<slug>/`；Publisher 才能 promotion/build/commit/push。
- 视觉证据必须经 web-capture / agent-browser（endpoint 由环境变量提供）；HTML 改动后必须重捕获。
- 不把 HTTP 200、build、DOM 或单端截图当成视觉通过。

## 错误日志
- 暂无。
