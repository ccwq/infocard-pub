# OpenMontage：把 AI 编码助手变成完整视频工作室的开源生产系统

- 标题：OpenMontage：把 AI 编码助手变成完整视频工作室的开源生产系统
- slug：`20260626-openmontage`
- 风格：`darkblue`
- 日期：`2026-06-26 11:26:19`（Asia/Shanghai）
- 来源：<https://github.com/calesthio/OpenMontage>

## 一句话结论

OpenMontage 不是“再来一个 AI 视频生成项目”，而是把视频生产团队的分工逻辑显式写成 pipeline、tool registry、skill、quality gate 和 budget governance 的开源 production system。

## 关键信息

- 12 条视频生产 pipeline
- 52 个生产工具
- 400+ agent skills（仓库描述口径写 500+，README 正文写 400+）
- 支持 Claude Code、Cursor、Copilot、Windsurf、Codex
- 支持真实素材 documentary montage 路径
- 支持零 key 免费路径：Piper TTS + Archive.org / NASA / Wikimedia + Remotion / HyperFrames

## 这张卡重点强调什么

1. 它不是单 clip 生成器，而是端到端生产链
2. 它不是只有图片转视频，还强调真实 motion footage 的 retrieval-first 路径
3. 它不是黑盒 orchestration，而是 agent-first workflow：AI coding assistant 自己读 manifest、读 skill、调工具、自审并 checkpoint
4. 它把预算封顶、自审、ffprobe、delivery promise 等治理环节做成了一等公民

## 风格选择理由

选 `darkblue`，因为 OpenMontage 更像一个视频生产工作台 / production studio / orchestration console，而不是一般的功能清单或营销海报。darkblue 更适合强调它的系统性、工具层和控制面叙事。
