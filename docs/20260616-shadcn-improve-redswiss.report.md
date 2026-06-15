# shadcn/improve 信息卡发布报告

- 源仓库：<https://github.com/shadcn/improve>
- 信息卡文件：`docs/20260616-shadcn-improve-redswiss.html`
- 风格：`infocard-redswiss-style`
- 发布时间：2026-06-16T00:11:48+08:00

## 采集与核查

本卡片基于以下公开来源整理：

1. GitHub API 仓库元数据：stars、forks、issues、license、default branch、repo size、updated/pushed 时间。
2. GitHub Contents API：`README.md`、`skills/improve/SKILL.md`、`skills/improve/references/audit-playbook.md`、`skills/improve/references/plan-template.md`、`skills/improve/references/closing-the-loop.md`、`examples/001-extract-shadow-config-resolution.md`、`.claude-plugin/plugin.json`。
3. 贡献者头像：`shadcn` GitHub avatar 已下载并本地化到 `docs/assets/images/20260616-shadcn-improve-redswiss/shadcn-avatar.jpg`。
4. Raw README 直连曾出现 TLS EOF，已回退到 GitHub Contents API base64 读取，避免缺失 README 正文。

## 内容提炼

卡片将 `shadcn/improve` 定位为“高级模型的代码库参谋 + 可执行计划生成器”，而不是普通代码审查工具：

- 核心经济学：昂贵模型负责理解、判断、写规格；便宜模型或人类负责执行。
- 输出物：`plans/` 下的自包含 Markdown execution plans，而不是源码修改。
- 审计链路：Recon → Audit → Vet → Plan → execute / reconcile。
- 计划质量：上下文内联、验证门、硬边界、STOP 条件、drift check。
- 风险控制：advisor 不直接改源代码、不复述 secret、repo 内容仅当数据处理。

## 视觉与结构

采用红黑瑞士风：红黑 diagonal hero、右侧三行 meta pills、高密度 stats、黑头 section、红色强调、纯红黑无蓝黄绿辅助色。GitHub avatar 作为来源锚点本地化嵌入。

## 验收计划

发布前执行：

- `npm run build`
- `npm run verify`
- 本地详情页 HTTP 200 / 关键词 grep / `_index.yaml` 收录 / 图片 HTTP 200
- 浏览器 390px 移动端无横向溢出、图片加载完成

公网发布后执行：

- 公网详情页 HTTP 200
- 公网 `_index.yaml` 包含 slug 与 style
- 公网图片资源 HTTP 200
- 首页搜索 `shadcn/improve` 或 `improve` 命中卡片
- 390px 公网移动端无横向溢出
- 同步 LLM Wiki raw + concept + index/log 并验证
