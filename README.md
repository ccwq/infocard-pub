# infocard-pub

信息卡公开链接托管。Agent 直接 push HTML 截图到对应分类目录，GitHub Pages 自动部署。

## 目录规范

```
/{category}/{YYYYMMDD}-{keywords}.html
```

示例：
- `/news/20260524-dongyuhui.html`
- `/investigation/20260525-xxx.html`
- `/trends/20260526-xxx.html`

## 工作流

1. Agent 生成信息卡 HTML → 本地截图
2. `git push` 到 `main`
3. GitHub Pages 自动从 `main` 根目录提供访问