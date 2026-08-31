# Hardblue CSS 变量速查（2026-07-10 压缩版）

> 本文件从 `infocard-hardblue-style` SKILL.md 中提取，供未来 agent 快速复制使用，无需每次读取完整 SKILL.md。

## CSS 变量

```css
:root {
  --bg:      #f6f4ef;   /* 暖灰网格背景 */
  --paper:   #fffdf8;   /* 卡片背景 */
  --ink:     #111111;   /* 主文字 */
  --muted:   #5f5950;   /* 次要文字 */
  --line:    #111111;   /* 边框 */
  --red:     #d80018;   /* 红色强调 */
  --blue:    #1f63ff;   /* 蓝色强调 */
  --soft-red:#fde9eb;   /* 浅红背景 */
  --soft-blue:#e8f1ff;  /* 浅蓝背景 */
  --soft-ink:#f7f6f2;   /* 浅灰背景 */
  --shadow:  5px 5px 0 rgba(0,0,0,.18);
  --dim:     #d8d4cc;
}
```

## Hero 参数（压缩版）

| 元素 | 压缩值 |
|------|--------|
| hero padding | 16px |
| hero gap | 14px |
| h1.demo-title | clamp(22px,3.8vw,42px) |
| subtitle | 12.5px / 1.55 |
| kicker | padding 5px 9px, font-size 11.5px |
| badge min-height | 28px |
| badge padding | 5px 9px |
| badge.ink | background:#111;color:#fff;font-size:11px;min-height:24px;padding:4px 8px |
| alert border | 2px |
| alert padding | 10px 12px |

## 章节组件参数

| 元素 | 值 |
|------|-----|
| section-no | 52×52px，3px border，font-size 22px（不是 96px，96px 是旧版）|
| card padding | 14px |
| grid-3/grid-4 gap | 12px |
| matrix gap | 12px |

## 响应式断点

- `1080px`：hero 单栏，grid-4/matrix → 2列
- `720px`：全单栏，section-head → 堆叠

## Mobile save button

```css
.save{
  display:block;width:fit-content;
  position:static;margin:14px 0 0 auto;
  z-index:1;border:0;border-radius:10px;
  padding:11px 14px;
  background:linear-gradient(135deg,#0036a3,#002a7a);
  color:#fff;font:900 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.06em;box-shadow:0 10px 24px rgba(0,0,0,.35);cursor:pointer
}
```

## Badge color CSS

```css
.badge.blue{background:var(--soft-blue);color:var(--blue)}
.badge.dark{background:#111;color:#fff}
.badge.ink{background:#111;color:#fff;font-size:11px;min-height:24px;padding:4px 8px}
.badge.red{background:var(--soft-red);color:var(--red)}
```

## 已废止元素（不要用）

- `.stats` / `.stat` — 已删除，改用 `.badge.ink` 内联
- `theme/hardblue.html` — 文件不存在，CSS 需从 SKILL.md 或本文件获取
