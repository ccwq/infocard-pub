---
name: infocard-q-style
description: |
  纸感书页主题信息卡技能 — 暖米纸背景、厚黑边框、圆角卡片、彩色accent与贴纸式标签。
  触发条件：用户提到"纸感"、"Q风"、"harness那个风格"、"彩色badge"、"框架对比"、"方法论总览"。
  视觉DNA：paper=#f8efd9 / ink=#1d1b16 / 4色accent(绿#9bdc77/蓝#7cc8ff/橙#ffc45c/粉#ffb3c6) / hard border 3px / 圆角12px / 纸盒阴影。
  比例建议：portrait。
---

# infocard-q-style · Q版纸感主题

## 视觉DNA

| token | 值 | 用途 |
|---|---|---|
| `--paper` | `#f8efd9` | 页面背景，暖米纸质感 |
| `--card` | `#fffdf9` | 卡片背景，象牙白 |
| `--ink` | `#1d1b16` | 主文字，深棕墨色 |
| `--border` | `#111` | 厚黑边框（3px） |
| `--accent-green` | `#9bdc77` | 绿色chip |
| `--accent-blue` | `#7cc8ff` | 蓝色chip |
| `--accent-yellow` | `#ffc45c` | 黄色chip/标签 |
| `--accent-pink` | `#ffb3c6` | 粉色chip |
| `--shadow` | `5px 5px 0 rgba(16,16,16,.13)` | 纸盒阴影右下 |
| `--radius` | `12px` | 卡片圆角 |

## 字体

- **标题/正文**：系统无衬线，`font-weight: 700`，深棕墨色
- **数据/标签**：JetBrains Mono 或系统等宽

## 布局骨架

```
body (--paper米纸背景)
.page (max-width: 720px, padding: 16px 14px 80px)
  .card (border:3px solid --border, border-radius:12px, background:--card, box-shadow:右下纸盒, margin-bottom:10px)
    .card-title (18px, font-weight:700, letter-spacing:-.02em)
    .card-body (13px, line-height:1.65, color:--ink)
  .chips (flex wrap, gap:6px)
    .chip (border:2px solid --border, border-radius:20px, 11px font-weight:700, padding:4px 10px)
    .chip.blue / .chip.yellow / .chip.pink / .chip.gray
  .tag (border:2px solid --border, border-radius:6px, 10px font-weight:700, padding:3px 8px)
  .grid (grid-template-columns:repeat(3,1fr), gap:8px)
    .grid-cell (border:2px solid --border, border-radius:8px, background:#fff, padding:8px)
  .btn (border:2px solid --border, border-radius:8px, background:--ink, color:#fff, 12px font-weight:700)
  .btn.alt (background:--accent-yellow, color:--ink, border-radius:20px)
  .note (border:2px solid --border, border-radius:8px, padding:10px 12px, background:#fff)
  .emoji (font-size:22px, vertical-align:middle)
```

## CSS Token

```css
:root {
  --paper: #f8efd9;
  --card: #fffdf9;
  --ink: #1d1b16;
  --border: #111;
  --accent-green: #9bdc77;
  --accent-blue: #7cc8ff;
  --accent-yellow: #ffc45c;
  --accent-pink: #ffb3c6;
  --shadow: 5px 5px 0 rgba(16,16,16,.13);
  --radius: 12px;
}
```

## 组件代码片段

### 卡片
```css
.card {
  border: 3px solid var(--border);
  border-radius: 12px;
  padding: 14px 14px 12px;
  background: var(--card);
  margin-bottom: 10px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: -.02em;
}
.card-body {
  font-size: 13px;
  line-height: 1.65;
  color: var(--ink);
}
```

### Chips（彩色胶囊）
```css
.chip {
  padding: 4px 10px;
  border: 2px solid var(--border);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: var(--accent-green);
}
.chip.blue  { background: var(--accent-blue); }
.chip.yellow{ background: var(--accent-yellow); }
.chip.pink  { background: var(--accent-pink); }
.chip.gray  { background: #e0d9cc; color: #555; }
```

### 纸盒阴影按钮
```css
.btn {
  display: inline-block;
  padding: 7px 14px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
.btn.alt {
  background: var(--accent-yellow);
  color: var(--ink);
  border-radius: 20px;
}
```

### 3列Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.grid-cell {
  border: 2px solid var(--border);
  border-radius: 8px;
  background: #fff;
  padding: 8px 8px 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}
.grid-cell strong { display: block; font-size: 15px; }
```

## 与其他主题的本质区别

| 维度 | Q版纸感 | 瑞士红黑 | 黑头调查风 |
|---|---|---|---|
| 背景 | `#f8efd9` 暖米纸 | `#0a0a0a` 深黑 | 顶部黑/底部白 |
| 边框 | 3px 纯黑硬边框 | 2px 黑/红线条 | 2px 硬黑边框 |
| 圆角 | `12px` 中等圆角 | 无圆角 | 少圆角 |
| 强调色 | 4色accent badge | 红色线条+数字 | 红色结论 |
| 阴影 | 右下纸盒投影 | 无 | 无 |
| 气质 | 温和、手作、贴纸感 | 冷峻、高压、冲击 | 严肃、调查、论证 |
| 适用场景 | 方法论、框架对比、工具总览 | 技术手册、Agent说明 | 调查、舆情、拆解 |

## 布局节奏建议

- **首屏**：chips行 + 标题card + stats-grid（三格数字）
- **中段**：2-3张内容卡片，每张带chips标签
- **收尾**：note注释框 + 按钮组
- **整体**：拼贴感、看板感，不追求严丝合缝

## 响应式策略

- 720px断点：grid 3列→2列→1列
- 390px：全单列，padding收紧，font-size微调
- 按钮在小屏时考虑堆叠

## 验收标准

1. 米纸背景可见，无其他主题残留色
2. 卡片有3px黑边框 + 12px圆角 + 右下纸盒阴影
3. chips有4色accent变体
4. 720px/390px均无横向溢出
5. 保存按钮为右下角固定悬浮，红色渐变
6. 移动端单列回退正确
7. 无旧模板结构（`.banner/.section/.footer`）残留