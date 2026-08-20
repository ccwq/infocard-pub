# darkblue 卡片 shell CSS 修复（2026-06-26）

## 问题症状

用户反馈："边上周围一圈看起来很丑"。视觉分析：深蓝色内容区在白色浏览器背景上漂浮一块，边界无约束，看起来像裸 HTML。

## 根因

`darkblue` 主题的 `.shell` CSS 类无 `max-width` / `border` / `box-shadow` 属性。深蓝色卡没有自己的边界，在白色页面上漂浮一块深色矩形，视觉上像"未装好 CSS"。

## 修复方案

在每张 darkblue 卡的 HTML 内联 `<style>` 开头加 shell 约束，**不依赖外部 `../assets/themes/darkblue.css`**（该文件在 docs/ 下不存在，href 会 404）：

```html
<style>
  /* ─── SHELL: self-contained dark card on white page ─── */
  body { background: #ffffff; margin: 0; }
  .shell {
    max-width: 760px;
    margin: 20px auto;
    border: 1.5px solid #1a3a6a;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  }
  /* ─── HERO ─── */
  /* ... 原有 hero CSS ... */
</style>
```

## 适用主题

- `darkblue` — 必须加（本次修复对象）
- `darkgreen` — 若卡在白色背景上展示，需要同等处理
- 其他深色主题若悬浮于白色页面背景，原则相同

## 验收

```bash
google-chrome --headless=new --disable-gpu \
  --screenshot=/tmp/shot.png --window-size=900,800 \
  --virtual-time-budget=6000 "https://<pub-url>/docs/<slug>.html"
```

视觉检查：深蓝卡有清晰圆角边框 + 投影悬浮于白色背景，边界整洁。

## 不要做的事

- 不要依赖 `<link rel="stylesheet" href="../assets/themes/darkblue.css">` — 该路径在 `docs/` 下不存在，会 404
- 不要只修一张卡然后跳过同主题其他卡 — darkblue 主题的所有卡都可能受影响
