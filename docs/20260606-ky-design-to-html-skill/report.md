# KY Design to HTML Skill：技术分享信息卡报告

## 结论

`ky-design-to-html` 不是普通的前端 skill，也不是 UI 生图 skill。它真正解决的是**设计截图/Mockup → HTML/CSS 还原**过程中的误差控制问题：先拆页面地图，再做资产分离，再设定画布与 viewport，最后通过浏览器截图反复校准。

## 关键信息

- **定位**：面向已有视觉参考的 HTML/CSS 还原 skill。
- **核心方法**：`page map → asset split → canvas fit → render → screenshot compare → fix`。
- **主要价值**：把“直接生成页面”改造成“可迭代修正的工作流”。
- **安装路径**：`~/.codex/skills/ky-design-to-html` 与 `~/.claude/skills/ky-design-to-html`。
- **源码结构**：`SKILL.md`、`references/asset-handling.md`、`references/visual-error-taxonomy.md`、`scripts/screenshot_page.py`。

## 适用边界

- 适合：UI 截图还原、SaaS 页面、后台页面、空状态、landing page mockup。
- 不适合：没有视觉参考的纯文本需求、普通前端功能开发、通用设计生成。

## 来源

- GitHub 仓库：<https://github.com/KyrieCheungYep/ky-design-to-html-skill>
- README：<https://raw.githubusercontent.com/KyrieCheungYep/ky-design-to-html-skill/main/README.md>
