# body/paper 背景一致性修复记录

## 事件

2026-06-27，用户反馈"边上会出现多余的空白"，截图分析后确认：卡片右侧灰色背景（`body`）在 `.page` 白色区域外露出，视觉上像"预期外的多余空白"。

## 根因

`theme/main.html` 长期使用 `background:#f5f2ec`（暖米色），但实际 swiss 风格卡片（通过 inline CSS）使用 `--swiss-bg:#F2F2F2`（灰色）。当卡片以独立页面（而非 iframe 嵌入）访问时，body 灰色背景与 `.page` 白色区域之间出现预期外的色差边缘。

## 修复

**文件：** `infocard-pub/theme/main.html`

```diff
- body{background:#f5f2ec}
+ body{background:#F2F2F2}
- .page{width:100%;max-width:720px;margin:0 auto;padding:14px 12px 80px}
+ .page{width:100%;max-width:720px;margin:0 auto;padding:14px 12px 80px;background:#fff;min-height:100vh}
```

**推送 commit：** `610b170`

## 验证

本地截图确认：灰色 `#F2F2F2` body 背景 + 白色 `.page` 内容区居中，色差边缘消失。

## 经验固化

已在 `infocard-style-man-skill/SKILL.md` Anti-patterns 部分新增 `body/paper 背景一致性` 规则（高优先级）。经验：新建任何 swiss/card-style 主题时，必须检查 body 背景色与实际卡背景色是否一致；`.page` 必须显式声明 `background:#fff`。
