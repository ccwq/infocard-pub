# darkblue / darkgreen 主题卡 Shell CSS 修复模式（2026-06-26）

## 问题根因

当 `.shell` 无 `max-width` / `border` / `box-shadow` 时，深蓝色内容区在白色浏览器背景上漂浮一块，边界漏白，看起来像裸 HTML。

用户反馈（dots-tts 卡）："边上周围一圈看起来很丑"。

## 适用范围

- `darkblue` 主题卡
- `darkgreen` 主题卡（若在白色背景页面上展示）
- 任何深色主题的信息卡若无明确背景约束

## 修复模式

在 HTML `<style>` 内联区块顶部加入：

```css
/* ─── SHELL: self-contained dark card on white page ─── */
body { background: #ffffff; margin: 0; }
.shell {
  max-width: 760px;
  margin: 20px auto;
  border: 1.5px solid #1a3a6a;       /* darkblue 用 #1a3a6a */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.35);
}
```

darkgreen 主题改 `border` 颜色为 `#1a3a2a` 或 `#0d3020`。

## 验证步骤

1. `google-chrome --headless=new --disable-gpu --screenshot=/tmp/shot.png --window-size=900,780 <URL>` 截图
2. `vision_analyze` 描述：卡片外框是否清晰、深蓝卡是否在白色背景上悬浮、边界是否整洁
3. 公网验收：`curl -s "https://<user>.github.io/<repo>/docs/<slug>.html" | grep -o "max-width.*760px\|border.*1\.5px\|border-radius.*12px"`

## 已验证卡片

- `docs/20260626-dots-tts.html` — darkblue，修复前截图 vs 修复后截图对比通过
- `docs/20260626-gstack-collaboration-workflow.html` — darkblue，截图通过

## 坑点

- 不要把 `.shell { border }` 写在外部 CSS 文件里（darkblue 主题没有独立的 CSS 文件，`theme/darkblue.html` 是模板不是 CSS），必须内联进每张 HTML 的 `<style>` 区块顶部
- `border-radius: 12px` 需与内容区的圆角一致，否则内层圆角和外层圆角视觉上会冲突
