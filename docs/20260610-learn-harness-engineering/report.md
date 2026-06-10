# learn-harness-engineering 发布复盘

## 结论
这个仓库的核心不是“写 harness 文档”，而是把 AI coding agent 的 harness 工程化：用技能形式把 instructions、state、verification、scope、lifecycle 五个子系统打包，方便复制到别的仓库中。

## 事实依据
- skills/README.md 说明这是可复用的 agent skills 集合。
- harness-creator 是核心 skill，专注于创建、评估和改进 agent harness。
- README 明确列出五个子系统：Instructions / State / Verification / Scope / Lifecycle。
- README 给出 install / use 路径：`npx skills add ...`、`create-harness.mjs`、`validate-harness.mjs`、`run-benchmark.mjs`。
- README 明确支持多语言文档与常见技术栈检测。
- harness-creator 只使用 Node.js built-in modules，便于跨仓库复制。
- validate-harness.mjs 产出结构评分，但 README 也明确提醒它不等于真实 agent session 效果。

## 卡片结构
1. 核心定位
2. 安装与使用
3. 五个子系统
4. 验证与审查
5. 适合 / 不适合
6. 生命周期与交接

## 风格判断
- 采用 mcp-forge 风格：暖底 + 深色控制台 + 协议彩色节点 + 生命周期流程
- 把 harness engineering 讲成一个“控制平面”，不是一份杂乱说明文档
- 适合做成横向架构海报，但保留移动端单列可读性

## 来源
- https://github.com/walkinglabs/learn-harness-engineering
- /tmp/learn-harness-engineering/skills/README.md
- /tmp/learn-harness-engineering/skills/harness-creator/README.md
- /tmp/learn-harness-engineering/skills/harness-creator/SKILL.md
