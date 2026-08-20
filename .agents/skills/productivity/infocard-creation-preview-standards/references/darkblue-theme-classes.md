# darkblue 主题 CSS 类速查（架构 / 系统 / AI 技术类）

## 设计定位
深蓝渐变 + 玻璃面板 + 图标化模块，夜间工作台感。适合 AI / Agent / 架构 / 系统类信息卡。

## 调色板（CSS 变量）
| 变量 | 值 | 用途 |
|------|----|------|
| `--bg` | `#0c1020` | 页面背景 |
| `--bg-2` | `#11162a` | 次级背景 |
| `--panel` | `#171c2b` | 卡片/面板背景 |
| `--panel-2` | `#0f1424` | 深层面板 |
| `--ink` | `#eef4ff` | 主文字 |
| `--muted` | `#a8b7df` | 次文字 |
| `--line` | `rgba(255,255,255,.12)` | 分割线 |
| `--cyan` | `#58c3ff` | 主强调色（青蓝） |
| `--blue` | `#4a78ff` | 次强调色（蓝） |
| `--green` | `#2db36a` | 成功/正面色 |
| `--yellow` | `#f4c84c` | 警示/排名色 |
| `--purple` | `#8459ff` | 高亮/特色色 |
| `--shadow` | `0 18px 42px rgba(0,0,0,.34)` | 卡片阴影 |

## 字体大小约束
- 最小字号：`11.2px`（所有可读文本必须 ≥ 11.2px）
- 断点：720px 移动端单列；1080px 两列

## 核心布局 class

### Hero 区块
```html
<section class="hero">
  <div class="hero-copy">   <!-- 左列：文案 -->
  <aside class="hero-visual"> <!-- 右列：视觉数据卡 -->
</section>
```
- `hero` = `display:grid; grid-template-columns: minmax(0,1.08fr) minmax(280px,.92fr)`
- 移动端（720px）自动变为单列

### 数字徽章 pill
```html
<span class="pill">基础灰</span>
<span class="pill cyan">青蓝强调</span>
<span class="pill green">绿色正面</span>
<span class="pill yellow">黄色警示</span>
<span class="pill purple">紫色高亮</span>
```
- `pill` = `border-radius:999px; font-size:12px`；实际内容用 `11.2px` 保持最小值

### 通用卡片
```html
<div class="card">通用面板</div>
<div class="card red">红色警示卡</div>
<div class="card green">绿色成功卡</div>
```
- 背景：`--panel`，圆角 `18px`，border `1.5px solid rgba(255,255,255,.08)`
- `card.red` 加 `rgba(232,64,64,.30)` 边框 + 渐变
- `card.green` 加 `rgba(45,179,106,.30)` 边框 + 渐变

### 图标圆
```html
<div class="icon">图标</div>           <!-- feature-row 中使用 -->
<div class="feat-icon cyan">图标</div>  <!-- 自定义 feature-card 中 -->
```
- `icon` = 28×28px 圆形；`feat-icon` = 34×34px
- 可加 `cyan/green/yellow/purple` 变体

### 小型数据卡（hero-visual 内）
```html
<article class="mini-card">
  <div class="mini-icon cyan">SVG图标</div>
  <div class="label">标签</div>
  <div class="value">数值</div>
  <div class="desc">描述</div>
</article>
```

### 分区标签
```html
<div class="section-label">📋 文字</div>
```
- pill 样式：`border-radius:999px`，字号 `11px` monospace uppercase

### 多列 grid
- `features` = `grid-template-columns: repeat(4, minmax(0,1fr))` → 移动端 2 列
- `data-wall` = `repeat(3, minmax(0,1fr))` → 移动端单列
- `audience-grid` = `repeat(3, minmax(0,1fr))` → 移动端单列
- `source-row` = `repeat(3, minmax(0,1fr))` → 移动端单列
- `visual-grid` = `repeat(2, minmax(0,1fr))` → 移动端单列

### 底部 Footer
```html
<section class="footer">内容</section>
```

## SVG 简图制作规范
- viewBox 宽度 ≥ 800（适配桌面宽屏）
- 三个节点：Reference（cyan）→ Sliding Window（purple）→ Output（green）
- 用虚线箭头 `stroke-dasharray="6,3"` + `marker-end` 连接节点
- 每节点底部两行小字说明
- 底部居中一行 R-SWA 全称标注

## 字体 family
```css
font-family: Inter, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", Arial, sans-serif
```

## iframe 高度上报脚本（必须保留）
```html
<script>
(function(){
  function send(){
    var h=document.body.scrollHeight;
    window.parent.postMessage({type:'theme-height',slug:'darkblue',height:h},'*');
  }
  if(document.readyState==='complete'){send()}else{window.addEventListener('load',send)}
  setTimeout(send,500);
})();
</script>
```

## 参考源文件
- 完整 CSS 骨架：`/tmp/infocard-unlimited-ocr/theme/darkblue.html`
- 实际信息卡示例：`/tmp/infocard-unlimited-ocr/docs/20260722-unlimited-ocr-rswa.html`
