# coralline：Claude Code 的零 token 珊瑚状态线

- 信息卡：`docs/20260616-coralline-darkblue.html`
- 来源：GitHub `https://github.com/Nanako0129/coralline`
- 作者：Nanako0129
- 风格：`infocard-darkblue-style`
- 发布时间：2026-06-16 07:30:21 +0800

## 取证方式

1. GitHub API 读取仓库元数据：stars、forks、license、topics、created/updated/pushed、language。
2. GitHub Contents API 读取 README、INSTALL.md、README.zh-TW.md、statusline.sh、tools/render-screenshots.py。
3. 本地化 README 图片资产：`hero.png`、`style-lean.png`、`theme-claude-coral.png`、`theme-tokyo-night.png`、`wrap-demo.png`。

## 关键事实

- 定位：Powerlevel10k-inspired statusline for Claude Code。
- 安装方式：把 INSTALL.md fetch 提示词交给 Claude Code，由 AI 采访用户后安装。
- 核心显示：dir、project、git、model、ctx、limit5h、limit7d、cost、clock、lines、style、duration、stash。
- 性能路径：本地 Bash 脚本，Claude Code 将 session JSON 从 stdin pipe 给脚本；脚本无网络/API 调用、零 token。
- 工程优化：一次 `jq` 调用抽取所有字段，一次 `git status --porcelain=v2 --branch` 取仓库状态；支持 macOS bash 3.2 与 Linux bash。
- 主题：claude-coral、catppuccin-mocha、nord、gruvbox-dark、tokyo-night、mono。

## 设计判断

该项目是 Claude Code 终端工作台组件，具备状态看板、仪表盘、主题预览、响应式布局和开发者工具属性，因此采用 darkblue 的“深蓝工作台 / 玻璃面板 / 图标化仪表盘”语言。

## 验收要求

- `npm run build && npm run verify` 通过。
- 公网详情页 HTTP 200，关键词 `coralline` / `zero token` / `Claude Code` 命中。
- `_index.yaml` 包含 slug 与 style。
- 首页搜索命中。
- 5 张本地化图片 HTTP 200。
- 390px 移动端无横向溢出，最小字号不低于规范底线。
- 同步 LLM Wiki raw + concept，并提交 Wiki 变更。
