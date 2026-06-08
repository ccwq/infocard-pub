# BrowserAct Skills 发布报告

## 结论

`browser-act/skills` 不是一个普通的浏览器脚本集合，而是一套面向 AI Agent 的浏览器能力分发层。它把 entry skill、`get-skills` 运行时、反爬破墙、人工接管、并发隔离和多账户身份管理收敛到同一套工作流里。

## 关键判断

- **定位**：给 AI Agent 用的浏览器运行层，不是通用搜索框架。
- **核心机制**：entry skill 负责触发识别，`get-skills` 负责按会话加载实时规则。
- **能力重点**：三层破墙（环境/执行/人类接管）+ 三种浏览器模式（chrome / stealth privacy / stealth fixed identity）。
- **边界**：敏感操作仍需用户确认；历史授权不自动继承。
- **适用场景**：自动化、信息抓取、账号运营、人工续接、多会话并发。

## 发布内容

- 信息卡 HTML：`docs/20260609-browser-act-skills.html`
- 元数据：`docs/20260609-browser-act-skills.html.meta.yaml`
- 报告：`docs/20260609-browser-act-skills/report.md`
- 本地配图：`docs/20260609-browser-act-skills-banner.png`

## 来源

- 仓库：<https://github.com/browser-act/skills>
- README：<https://raw.githubusercontent.com/browser-act/skills/main/README.md>
- Skills 文档：<https://raw.githubusercontent.com/browser-act/skills/main/docs/skills.md>
