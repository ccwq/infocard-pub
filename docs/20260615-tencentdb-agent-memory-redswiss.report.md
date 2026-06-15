# TencentDB Agent Memory 信息卡发布报告

- 源仓库：<https://github.com/TencentCloud/TencentDB-Agent-Memory>
- 信息卡文件：`docs/20260615-tencentdb-agent-memory-redswiss.html`
- 风格：`infocard-redswiss-style`
- 发布时间：2026-06-15T22:24:56+08:00

## 采集与核查

本卡片基于以下公开来源整理：

1. GitHub API 仓库元数据：stars、forks、issues、default branch、language、topics、created/updated/pushed 时间。
2. Raw README / README_CN：项目定位、benchmark、核心技术、Quick Start、配置参数、Roadmap。
3. Raw package.json：npm 包名、版本 0.3.6、Node >=22.16.0、CLI bin、license 与关键词。
4. Git tree recursive：源码目录结构、`src/`、`scripts/`、`hermes-plugin/`、`docker/`、`assets/images/` 文件分布。
5. README 引用图片已本地化：logo、memory-pyramid、flowchart1.cn、star-helper。

## 内容提炼

卡片将 TencentDB Agent Memory 定位为“证据可恢复的 Agent Memory 插件”，而不是普通向量库记忆：

- 符号化短期记忆：工具日志卸载到 `refs/*.md`，上下文保留 Mermaid 任务画布，按 `node_id` / `result_ref` 下钻。
- 分层式长期记忆：L0 Conversation → L1 Atom → L2 Scenario → L3 Persona。
- 工程形态：OpenClaw 插件、Hermes Gateway、本地 SQLite / sqlite-vec、TCVDB 迁移脚本。
- 配置面：capture、extraction、pipeline、recall、persona、embedding。
- 边界：README benchmark 是项目自述口径，迁移到具体 Agent 工作负载仍需本地复测。

## 视觉与结构

采用红黑瑞士风：红黑 diagonal hero、右侧三行 meta pills、高密度 stats、黑头 section、红色强调、纯红黑无蓝黄绿辅助色。图片作为正文解释资产嵌入，不热链外部资源。

## 本地验收计划

发布前执行：

- `npm run build`
- `npm run verify`
- 本地 HTTP 200 / 关键词 grep / `_index.yaml` 收录 / 本地图片 HTTP 200
- 浏览器 390px 移动端横向溢出检查，图片自然尺寸检查

## 公网验收计划

推送后执行：

- 公网详情页 HTTP 200
- 公网 `_index.yaml` 包含 slug 与 style
- 公网图片资源 HTTP 200
- 首页搜索 `TencentDB Agent Memory` 或 `memory-tencentdb` 命中卡片
- 390px 公网移动端无横向溢出
- 同步 LLM Wiki raw + concept + index/log 并提交
