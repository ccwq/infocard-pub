# SkillsGate 调查报告

**调查对象**：skillsgate/skillsgate  
**调查时间**：2026-05-30  
**结论一句话**：SkillsGate 不是单纯的“技能下载器”，而是一个面向 AI agents 的可视化技能市场与管理器，覆盖 **桌面 App + TUI + 云端目录/服务** 三条路径；官方公开信息明确支持 **20+ agents**、**91,000+ skills** 的检索/安装/管理，并提供本地编辑、远程服务器同步、收藏和设置同步等能力。

## 一、核心判断

- SkillsGate 的定位更接近 **AI skills marketplace / skill manager**，而不是一个只负责拷贝 Markdown 的工具。
- 官方站点主页直接写明：**“The open marketplace for AI agent skills”**。
- GitHub README 写明它支持 **desktop app** 和 **terminal UI**，并可在一个界面里浏览、安装、管理技能。
- README 还写明支持 **20+ agents**，包括 Claude Code、Cursor、Windsurf、GitHub Copilot、Cline、Continue、Codex CLI、Zed 等。

## 二、公开证据

### 1) GitHub 仓库

仓库：`https://github.com/skillsgate/skillsgate`

- README 明确定位：**Visual skill manager for AI agents. Desktop app and TUI.**
- 项目提供：
  - Desktop App
  - TUI（Terminal UI）
  - 远程服务器连接
  - 私有技能管理
  - 收藏（Favorites）
  - 设置同步（Settings sync）
- README 的功能描述还写明：
  - browse and search the full catalog
  - install a skill to specific agents or all of them at once
  - view rendered skill content or edit raw source

### 2) npm registry

- `skillsgate` npm 包 latest：**1.1.1**
- description：**Visual AI skill manager for all agents**
- license：MIT
- keywords：`ai`, `agent`, `skills`, `tui`, `visual`, `manager`, `claude`, `cursor`, `copilot`

这说明 npm 发布包与 GitHub 仓库的定位一致：它不是单纯的 CLI，而是面向多代理生态的技能管理产品。

### 3) 官方网站

- 官网标题：**SkillsGate — The open marketplace for AI agent skills**
- 官网 meta description：**Discover, publish, and install skills that extend AI coding assistants like Claude Code, Cursor, and Windsurf. The npm for AI skills.**

这进一步确认它在产品层面的叙事是“市场 + 发布 + 安装”，而不是单点本地工具。

### 4) 最新公开发布

- GitHub Releases latest：`desktop-v0.5.1`
- published_at：`2026-05-16T04:47:32Z`

说明桌面端仍在持续迭代，且桌面版是产品主线之一。

## 三、产品能力拆解

### 1) 发现与安装

SkillsGate 的核心场景是：

- 先搜索技能
- 再安装到一个或多个 agent
- 支持不同 agent 的差异化管理
- 允许把技能从某个 agent 删除而不影响其他 agent

### 2) 编辑与维护

- 内置编辑器可查看渲染后的技能内容
- 也可直接编辑原始 source
- 保存到磁盘即时生效

### 3) 组织与协作

- Favorites：星标常用技能
- Remote servers：连接其他机器同步技能
- Private skills：保持本地私有技能
- Settings sync：桌面端与 TUI 共享本地 SQLite 配置

### 4) 产品形态

- Desktop App：适合图形化浏览与管理
- TUI：适合键盘驱动工作流
- CLI entry：`npx skillsgate` 或全局安装后直接用

## 四、调查结论

- **它是什么**：AI agent skills 的可视化管理与分发平台。
- **它不是什么**：不是仅能“下载几个 prompt 文件”的轻量脚本。
- **它的价值**：把“技能发现、安装、编辑、同步、收藏、跨 agent 分发”整合成一个闭环。
- **一句话定位**：它更像 **“AI 技能版 npm / marketplace”**，而不只是本地技能文件管理器。

## 五、使用建议

- 如果只是临时找一个 skill：直接用 TUI/网页浏览即可。
- 如果要维护多个 agent 的技能体系：适合用 SkillsGate 做统一入口。
- 如果你在团队里共享技能：Remote servers + Private skills 组合更有价值。

## 六、来源链接

- GitHub：`https://github.com/skillsgate/skillsgate`
- 官网：`https://skillsgate.ai`
- npm：`https://www.npmjs.com/package/skillsgate`
- GitHub Releases：`https://github.com/skillsgate/skillsgate/releases/latest`
- README：`https://raw.githubusercontent.com/skillsgate/skillsgate/main/README.md`

## 七、备注

- 公开资料中未见单独的价格页或商业订阅说明，当前更像开源产品 + 公开目录服务的组合。
- 如果后续需要，我可以继续补一版“SkillsGate 与各 AI agent skill 管理方案的横向对比卡”。
