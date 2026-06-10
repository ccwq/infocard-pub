# Obscura 技术分享卡复盘

## 结论
Obscura 不是桌面浏览器替代品，而是面向 AI agent 和网页抓取的轻量无头浏览器引擎。它的核心卖点是：Rust 实现、真实 JavaScript 执行、CDP / Puppeteer / Playwright 兼容、Stealth mode、MCP 暴露，以及相比 headless Chrome 更轻的体积和启动成本。

## 取材依据
- GitHub README 一句话定位：open-source headless browser for AI agents and web scraping
- 关键能力：V8、Chrome DevTools Protocol、Puppeteer、Playwright、Stealth、MCP
- README 性能对比：30 MB memory / 70 MB binary / 85 ms page load / instant startup
- 安装入口：Linux x86_64、Linux ARM64、AUR、macOS（Apple Silicon / Intel）、Windows、Docker、build from source
- Quick Start：fetch、selector、eval、scrape、proxy、timeout
- 边界表述：designed for automation at scale, not desktop browsing

## 卡片结构
1. 核心定位
2. 性能与体积
3. 安装与入口
4. Quick Start
5. 集成面：CDP / Puppeteer / Playwright / MCP
6. Stealth mode
7. 适合 / 不适合

## 风格判断
- 采用 hardblue 技术分享风
- 目标是把工具能力讲清楚，而不是做成目录页
- 首屏用 icon + architecture flow，帮助读者快速判断“是什么、能干什么、怎么接入”

## 来源链接
https://github.com/h4ckf0r0day/obscura
