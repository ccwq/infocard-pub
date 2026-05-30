# SkillsGate 调查报告

**调查对象**：skillsgate/skillsgate  
**调查时间**：2026-05-30  
**结论一句话**：SkillsGate 不是单纯的“技能下载器”，而是一个面向 AI agents 的可视化技能市场与管理器；它公开支持 **20+ agents**、**91,000+ skills** 的检索/安装/管理，并提供本地编辑、远程服务器同步、收藏和设置同步等能力。

## 一、核心判断

- SkillsGate 的定位更接近 **AI skills marketplace / skill manager**。
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
  - Remote servers
  - Private skills
  - Favorites
  - Settings sync
- README 的功能描述还写明：
  - browse and search the full catalog
  - install a skill to specific agents or all of them at once
  - view rendered skill content or edit raw source

### 2) npm registry

- `skillsgate` npm 包 latest：**1.1.1**
- description：**Visual AI skill manager for all agents**
- license：MIT
- keywords：`ai`, `agent`, `skills`, `tui`, `visual`, `manager`, `claude`, `cursor`, `copilot`

### 3) 官方网站

- 官网标题：**SkillsGate — The open marketplace for AI agent skills**
- 官网 meta description：**Discover, publish, and install skills that extend AI coding assistants like Claude Code, Cursor, and Windsurf. The npm for AI skills.**

### 4) 最新公开发布

- GitHub Releases latest：`desktop-v0.5.1`
- published_at：`2026-05-16T04:47:32Z`

## 三、产品能力拆解

### 1) 发现与安装

- 统一搜索技能
- 按 agent 安装
- 支持一次分发到多个 agent
- 更适合维护跨模型 / 跨助手的共用技能栈

### 2) 编辑与维护

- 内置编辑器可看渲染结果，也可改原始源文件
- 保存到磁盘后即时生效
- 更像一个本地技能工作台，而不是单次下载器

### 3) 组织与协作

- Favorites 方便收藏高频技能
- Remote servers 支持连接其他机器同步技能
- Private skills 适合保留本地私有能力

### 4) 产品形态

- Desktop App：适合图形化浏览和管理
- TUI：适合键盘驱动工作流
- CLI：`npx skillsgate` 可直接上手

## 四、调查结论

- **它是什么**：AI agent skills 的开放市场与管理器。
- **它不是什么**：不是通用推理引擎，也不是模型服务。
- **它的价值**：把“发现—安装—编辑—同步—分发”做成闭环。
- **一句话定位**：它更像 **“AI 技能版 npm / marketplace”**。

## 五、使用建议

- 如果你有多 agent 技能管理需求，适合用 SkillsGate 做统一入口。
- 如果只是临时找一个 skill，直接搜与装就够了，不必引入复杂流程。
- 如果你在团队里共享技能：Remote servers + Private skills 组合更有价值。

## 六、来源链接

- GitHub：`https://github.com/skillsgate/skillsgate`
- 官网：`https://skillsgate.ai`
- npm：`https://www.npmjs.com/package/skillsgate`
- GitHub Releases：`https://github.com/skillsgate/skillsgate/releases/latest`
- README：`https://raw.githubusercontent.com/skillsgate/skillsgate/main/README.md`

## 七、备注

- 公开资料中未见单独的价格页或商业订阅说明。
- 如果后续需要，我可以继续补一版“SkillsGate 与各 AI agent skill 管理方案的横向对比卡”。
