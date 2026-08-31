# Knowledge Work Plugins 绿色开源工具卡发布模式（2026-06-03）

## 适用场景

GitHub 仓库不是单一 CLI / SDK，而是**插件市场、技能注册表、模板集合或工作流分发层**，用户要求发布为绿色开源工具信息卡。

典型例子：`anthropics/knowledge-work-plugins`。

## 核心提取顺序

1. **README 定位**：先写清它到底是什么——Claude Cowork / Claude Code 的知识工作插件集合，不是单个应用。
2. **Marketplace / manifest**：检查 `.claude-plugin/marketplace.json` 与每个 `.claude-plugin/plugin.json`，统计插件数量、名称、版本、作者、描述。
3. **组件目录统计**：统计 `skills/**/SKILL.md`、`.mcp.json`、`CONNECTORS.md`、`commands/*.md`、`agents/*.md`，用来证明它是“文件化工作流分发层”。
4. **安装命令**：必须放在首屏后的 Quick Start 区：
   ```bash
   claude plugin marketplace add anthropics/knowledge-work-plugins
   claude plugin install sales@knowledge-work-plugins
   ```
5. **README 口径 vs 当前树口径**：README 可能说 open-sourcing 11 plugins，但当前代码树可扫描到更多 `plugin.json`（本次为 22）。卡片里要显式标注这是“README 口径”和“当前代码树核查口径”的差异，避免看起来像矛盾。
6. **风险边界**：插件不是权限系统；MCP 连接器仍依赖外部 server、身份权限、审批和审计。

## 推荐卡片结构

- Hero：仓库名 + “Claude 知识工作插件市场 / 角色插件分发层”
- Stats：插件数、技能数、stars、license
- 一句话结论：可复制样板库，而不是单个工具
- 文件结构流：Manifest → MCP Tool Wiring → Behavior Layer
- 插件清单：通用知识工作 / 职能岗位 / Partner-built
- Quick Start：marketplace add + plugin install
- 能力矩阵：技能包、MCP、命令、子代理、公司定制、低基础设施
- 适合 / 不适合
- 风险与核查边界
- 首装推荐路径

## 绿色风格移动端验收要点

- 绿色主题不要只换 header；stats、pill、section number、button 都要切到 teal/emerald 系。
- 390px 下如果 stats 单列显得像桌面表格压缩，可改为 2×2 圆角 mini card；这比“数字 + 文案横排表格”更像移动端组件。
- 保存 PNG FAB 在移动端可放右上角 icon-only，避免右下角压住正文；但需要给 kicker/header 留右侧安全空间。
- 用 headless Chrome 截 390×844 公网截图，配合 vision 验证：可读、无横向裁切、绿色风格明显、按钮不遮挡正文。

## 发布闭环

- 新建 `docs/YYYYMMDD-knowledge-work-plugins/index.html` 与 `index.html.meta.yaml`。
- `date` / `updated` 用 Asia/Shanghai 本次发布墙钟时间。
- 运行 `python3 scripts/rebuild_index.py && python3 scripts/verify_index.py`。
- 若 rebase 冲突在 `_index.yaml`，重新 rebuild index 后 `GIT_EDITOR=true git rebase --continue`。
- 验证：详情页 200、`/_index.yaml` 含 slug/title/date、首页/list 收录、git 工作区干净。
