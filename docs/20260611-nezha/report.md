# Nezha · 发布报告

## 来源
- 仓库：hanshuaikang/nezha
- 网址：https://github.com/hanshuaikang/nezha
- 主页定位：Agent-First IDE for Vibe Coding

## 结论
Nezha 不是传统 IDE 的简单重绘，而是把 **Claude Code、Codex、Git、终端、代码编辑和任务管理** 组织成一个面向并行 AI 编程的桌面工作台。

## 选题理由
- 典型的 open-source-tool / desktop app / AI workflow 产品卡
- 界面信息密度高，适合 hardblue 风格
- README 中给出的结构非常明确：workspace / tasks / terminal / code / git / analytics

## 结构映射
1. Hero：标题、定位、中文副标题、关键能力标签
2. 工作区：多项目切换与项目树
3. AI 任务：Claude Code / Codex 并行运行
4. 任务状态：running / waiting / done 生命周期
5. 终端 + 编辑器 + Git 变更：工作闭环
6. 功能区 + 下载按钮 + footer：卖点收口

## 关键信号
- README 明确写了：Claude Code + Codex, Git, editing, and task management, all in one place.
- 核心卖点是并行，而不是单任务编辑
- 7MB 安装包、会话自动发现、任务状态追踪、Usage Analytics 都是产品差异点

## 发布说明
- HTML + meta 已同步到 `docs/`
- 已设置 `style: hardblue`
- 后续将通过 `npm run build` 生成索引并发布到 Pages
