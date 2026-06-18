# Awesome Claude.md 调研记录

- 源仓库：<https://github.com/josix/awesome-claude-md>
- 页面：<https://josix.github.io/awesome-claude-md/>
- 主题：`redswiss-style`

## 直接证据

### README.md
- 定位：高质量 `CLAUDE.md` 样例精选库
- 目标：帮助开发者为复杂代码库写出更有效的 AI onboarding 文档
- 结构：Top Picks、按技术栈浏览、按用途浏览、All Categories、Tools & Ecosystem、Quality Standards、Search GitHub
- 说明了 6 类主分类 + 多个高质量例子

### CLAUDE.md
- 给 Claude Code 的项目维护说明
- 写清了仓库结构、类别规则、质量标准、GitHub Pages、自动发现系统、开发命令
- 强调：
  - 不复制原始 `CLAUDE.md`
  - 必须链接源仓库并保留 attribution / license
  - 内容质量优先于星标

### AGENTS.md
- 更压缩的项目知识底图
- 给出 89+ 例子、6 大分类、where-to-look、命令、CI 和 anti-patterns
- 特别指出：Jekyll 站点从 root build，不是 docs/

### AUTOMATED_DISCOVERY.md
- 自动发现系统每周一运行一次
- 搜索 `filename:CLAUDE.md`
- 打分后自动开 GitHub issue 供社区审核
- 100 分内容优先评分体系 + 60+ 收录门槛

### 仓库目录
- `scenarios/`：样例主体
- `scripts/`：发现与处理脚本
- `tests/`：测试
- `.claude/`：agent 配置
- `docs/`：GitHub Pages 站点（astro / tailwind）

## 卡片取舍
- 这张卡没有只讲“这是个样例库”，而是突出四层价值：
  1. 样例索引库
  2. 质量评分模型
  3. 自动发现系统
  4. GitHub Pages 浏览站点
- redswiss 适合这种高密度工具图鉴 / 生态卡

## 没有过度声称的部分
- 没把它说成官方 Anthropic 资源，它只是社区 curated collection
- 没把 89+ 样例说成固定精确长期值，而是按当前 AGENTS.md/README 可见口径表述
- 没声称它复制原文，反而强调 link-only / attribution 伦理边界
