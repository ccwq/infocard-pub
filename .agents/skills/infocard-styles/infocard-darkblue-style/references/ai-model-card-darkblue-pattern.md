# AI 模型/开源项目信息卡 darkblue 写法（非 IDE 产品类）

## 适用场景
GitHub 开源项目 / HuggingFace 模型 / AI 技术创新，**不需要 IDE 工作台 metaphor**，但需要展示：
- 数据指标（Stars / 下载量 / 榜单排名）
- 技术原理简图
- 核心特性
- 适合人群

典型案例：Unlimited OCR（20260722）

## 完整结构（自上而下）

```
1. Hero
   ├─ kicker-row: 项目标签（熊厂出品 · 端到端 OCR）
   ├─ title: 项目名（如 "Unlimited OCR"）
   ├─ subtitle: 主句（如 "R-SWA 机制解决长文档 OCR 困境"）
   ├─ pill-row: 4个数字/属性徽章
   │   例：30亿参数 / 224万下载 / 完全免费可本地运行 / Yann LeCun 转发
   └─ hero-note: 核心价值主张（1-2句）

2. Hero Visual 侧
   ├─ visual-top: orb 图标 + 项目元数据
   ├─ yann-badge: Yann LeCun 转推背书徽章（可选，有背书时必加）
   └─ 2列 mini-card：GitHub Stars / HuggingFace 下载

3. 问题 vs 方案
   ├─ section-label: "📋 问题 vs 方案"
   ├─ card.red: 传统 OCR 痛点（3项）
   └─ card.green: Unlimited OCR 方案（3项）

4. R-SWA 技术原理 SVG 简图
   ├─ section-label: "⚙️ R-SWA 技术原理简图"
   └─ SVG viewBox="0 0 800 180"，三节点架构

5. 核心特性（Feature Card ×4）
   ├─ section-label: "✨ 核心特性"
   └─ features grid: feat-icon + feat-num + feat-name + feat-desc

6. 数据墙（Data Wall ×3）
   ├─ section-label: "📊 数据表现"
   └─ data-wall grid: num + label + sub + 标签

7. 适合人群（Audience Grid ×3）
   ├─ section-label: "🎯 适合人群"
   └─ audience-grid: who + why + pill

8. 参考来源（Sources ×3）
   ├─ section-label: "🔗 参考来源"
   └─ source-row: platform + url + note

9. Footer
```

## SVG 原理简图规范

### viewBox 800×180（桌面宽屏友好）
```svg
<svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg">
```

### 三节点布局（x 坐标）
| 节点 | x | width | 主题色 |
|------|---|-------|--------|
| Reference（原始文档） | 10 | 200 | cyan `#58c3ff` |
| Sliding Window（工作记忆） | 285 | 200 | purple `#8459ff` |
| Output（端到端结果） | 555 | 235 | green `#2db36a` |

### 连接箭头
```svg
<!-- 用 stroke-dasharray + marker-end 表示选择性引用 -->
<path d="M215 90 C250 90, 265 90, 280 90"
      stroke="#58c3ff" stroke-width="1.5"
      stroke-dasharray="6,3" fill="none"
      marker-end="url(#arrow)"/>
```

### 每节点底部两行说明
```svg
<text x="110" y="148" font-size="10.5" fill="#a8b7df" text-anchor="middle">始终被 Attention 引用</text>
<text x="110" y="162" font-size="10.5" fill="#7a8bc4" text-anchor="middle">KV Cache 不爆炸</text>
```

### 底部居中 R-SWA 全称
```svg
<text x="400" y="175" font-size="9.5" fill="#7a8bc4" text-anchor="middle">
  R-SWA = Reference Sliding Window Attention
</text>
```

## Hero Visual 侧 Yann LeCun 背书徽章
```html
<div class="yann-badge">
  <div class="yann-avatar">Y</div>
  <div class="yann-info">
    <div class="yann-name">Yann LeCun 转推背书</div>
    <div class="yann-title">深度学习三巨头之一 · Meta 首席 AI 科学家</div>
    <div class="yann-quote">"突破性工作，让本地长文档 OCR 成为可能。"</div>
  </div>
</div>
```
样式：
```css
.yann-badge{
  display:flex; align-items:flex-start; gap:10px;
  background:rgba(132,89,255,.10);
  border:1.5px solid rgba(132,89,255,.30);
  border-radius:14px; padding:10px 12px;
}
.yann-avatar{width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,#8459ff,#4a78ff);
  display:grid;place-items:center;font-size:16px;font-weight:950;flex-shrink:0;}
.yann-name{font-size:12px;font-weight:900;color:#ede3ff}
.yann-title{font-size:11px;color:#a8b7df;line-height:1.4}
.yann-quote{font-size:11.2px;color:#d8c8ff;line-height:1.55;margin-top:3px;font-style:italic}
```

## Feature Card 结构
```html
<div class="feature-card">
  <div class="feat-icon cyan" aria-hidden="true"><!-- SVG icon --></div>
  <div class="feat-num">Feature 01</div>
  <div class="feat-name">不分页连续解析</div>
  <div class="feat-desc">100页 PDF 一次端到端处理，保持全局上下文关联</div>
</div>
```
feat-icon 变体：`cyan / green / yellow / purple`

## Data Wall 结构
```html
<div class="data-card">
  <div class="num cyan">1.65万+</div>
  <div class="label">GitHub Stars</div>
  <div class="sub">发布首月横扫 GitHub 榜单第一</div>
  <div><span class="tag top">🔥 热门模型</span></div>
</div>
```
num 变体：`cyan / green / yellow`

## 待核实项处理
URL 不确定的内容（如 repo 完整路径待确认），在 card 中用中文注明：
```html
<div class="source-item">
  <div class="platform">HuggingFace</div>
  <div class="url">huggingface.co/spaces/…</div>
  <div class="note">224万+ 下载 · 待核实完整路径</div>
</div>
```

## 参考源
- 完整实现：`/tmp/infocard-unlimited-ocr/docs/20260722-unlimited-ocr-rswa.html`
- darkblue CSS 骨架：`/tmp/infocard-unlimited-ocr/theme/darkblue.html`
- 最小字号约束：所有文本 ≥ `11.2px`
- 移动端断点：`720px`，所有 grid → 单列；features → 2列
