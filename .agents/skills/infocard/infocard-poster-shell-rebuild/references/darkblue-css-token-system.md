# darkblue CSS 系统（完整 token + 骨架）

## 源文件
`theme/darkblue.html`（相对于当前 active repository root）

## CSS 变量

```css
:root {
  --bg:    #09101f;   /* 深邃藏蓝 */
  --bg2:   #101b35;   /* 次级蓝 */
  --panel: rgba(20,31,59,.82);   /* 玻璃面板 */
  --panel2:rgba(11,19,38,.94);   /* 深层面板 */
  --ink:   #f1f6ff;   /* 主文字 */
  --muted: #afbee5;   /* 次要文字 */
  --line:  rgba(190,210,255,.16); /* 边框线 */
  --cyan:  #63d2ff;   /* 青色强调 */
  --blue:  #5483ff;   /* 蓝色强调 */
  --purple:#9b78ff;   /* 紫色强调 */
  --green: #55db9a;   /* 绿色信号 */
  --yellow:#ffd36d;   /* 黄色警告 */
  --red:   #ff8796;   /* 红色错误 */
  --shadow:0 18px 44px rgba(0,0,0,.35);
}
```

**关键特征**：darkblue 用 `rgba` 透明度实现玻璃感；hardblue 用纯 `#` 值。两者 token 系统不兼容。

## 骨架 CSS

### 全局

```css
body {
  background:
    radial-gradient(circle at 8% 4%,  rgba(99,210,255,.16),  transparent 23rem),
    radial-gradient(circle at 90% 6%, rgba(155,120,255,.17),  transparent 24rem),
    linear-gradient(165deg, #07101f 0%, #101b35 50%, #09101f 100%);
}
body::before {
  content:"";
  position:fixed; inset:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(151,186,255,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(151,186,255,.045) 1px, transparent 1px);
  background-size:42px 42px;
  mask-image:linear-gradient(#000,transparent 85%);
}
```

### Hero（左右双栏）

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0,1.25fr) minmax(290px,.75fr);
  gap: 18px; align-items: stretch;
}
.hero-copy {
  border-radius: 24px; padding: 28px;
  background: linear-gradient(135deg,rgba(25,43,84,.88),rgba(12,21,44,.86));
}
.hero-side {
  border-radius: 24px; padding: 18px;
  background: linear-gradient(160deg,rgba(80,110,255,.24),rgba(14,24,49,.91) 45%,rgba(121,85,230,.20));
}
```

### Section

```css
.section {
  margin-top: 16px; padding: 22px;
  border-radius: 22px;
  background: linear-gradient(180deg,rgba(22,35,68,.83),rgba(10,18,37,.88));
}
.section-head {
  display: grid;
  grid-template-columns: 58px 1fr; gap: 14px; align-items: start;
}
.section-no {
  height: 58px; border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(135deg,var(--cyan),var(--blue),var(--purple));
  font: 900 19px ui-monospace,monospace;
  box-shadow: 0 8px 23px rgba(84,131,255,.26);
}
```

### 状态面板

```css
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* ← 桌面双列 */
  gap: 10px;
}
.status {
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(5,12,28,.35);
  border-radius: 14px; padding: 12px;
}
.status .l {
  font: 700 10px/1.2 ui-monospace,monospace;
  letter-spacing: .09em; color: #aabce8;
}
```

### Alert / Codebox / Solution

```css
.alert {
  display: grid;
  grid-template-columns: 36px 1fr; gap: 11px;
  margin: 14px 0; padding: 13px;
  border-radius: 15px; border: 1px solid var(--line);
  background: rgba(5,12,28,.35);
}
.codebox {
  margin: 12px 0;
  border: 1px solid rgba(99,210,255,.24);
  border-radius: 14px; overflow: hidden; background: #07101f;
}
.solution-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr)); /* 桌面4列 */
  gap: 12px;
}
```

## 移动端响应式（520px 断点）

```css
@media(max-width: 820px) {
  .hero { grid-template-columns: 1fr; }
  .solution-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .model-grid { grid-template-columns: 1fr; }
  .conclusion-grid { grid-template-columns: 1fr; }
}

@media(max-width: 520px) {
  .page { width: min(100% - 20px, 1160px); padding-top: 16px; }
  /* Hero 面板收窄 */
  .hero-side { padding: 14px; }
  /* 状态面板：双列→单列 ← 关键修复 */
  .status-grid { grid-template-columns: 1fr; gap: 8px; }
  .status { padding: 10px 11px; }
  .status strong { font-size: 13px; }
  /* V2 badge 缩小 */
  .side-head { align-items: flex-start; }
  .side-head .orbit { width: 46px; height: 46px; border-radius: 15px; font-size: 17px; }
  /* 各 grid 全部单列 */
  .model-grid, .solution-grid, .conclusion-grid { grid-template-columns: 1fr; }
  .verdict { grid-template-columns: 1fr; }
  .alert { grid-template-columns: 30px 1fr; gap: 9px; }
  .alert .icon { width: 30px; height: 30px; }
  .footer { display: grid; }
}
```

## 常见坑

| 坑 | 根因 | 修复 |
|---|---|---|
| 移动端 status 子卡片被挤压 | `status-grid` 保持 `1fr 1fr` | `@media(520px)` 加 `grid-template-columns: 1fr` |
| darkblue/hardblue token 混用 | 两个主题 token 值不同 | darkblue 用 rgba 透明度；hardblue 用纯色 |
| Hero 双栏在小屏断裂 | 无 `@media(820px)` 回退 | 必须加 `grid-template-columns: 1fr` 回退 |
| Solution 4列在小屏溢出 | 无响应式规则 | `@media(820px)` 降为 `repeat(2,1fr)` |
