# 内联 SVG 流程图模式 (Inline SVG Flowchart Pattern)

适用于多步骤/多角色技术工作流的信息卡。SVG 直接嵌入 HTML，无需外部依赖。

## 结构模板

```svg
<svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg"
     style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#e74c3c"/>
    </marker>
    <marker id="arrow-g" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#888"/>
    </marker>
  </defs>
  <!-- 背景 -->
  <rect width="720" height="380" fill="#1a1a1a" rx="6"/>
  <!-- 标题 -->
  <text x="360" y="28" fill="#e74c3c" font-size="11"
        font-weight="700" text-anchor="middle" letter-spacing="2">
    WORKFLOW TITLE
  </text>
  <!-- ... 节点和连线 ... -->
</svg>
```

## 节点类型

| 类型 | SVG 元素 | 填充 | 描边 | 用途 |
|------|----------|------|------|------|
| 起始/结束 | `<rect rx="4">` | `#c0392b` | `#e74c3c` | PR 提交、Review 完成 |
| 标准步骤 | `<rect rx="4">` | `#333` | `#e74c3c` | Synthesize 等中间步骤 |
| 模型节点 | `<rect rx="4">` | `#333` | 按角色着色 | 多模型并行 Review |
| 人工决策 | `<polygon points="...">` | `#333` | `#e67e22` | Human Gate |

## 颜色映射（模型/角色）

- GPT / Codex — `#6c5ce7` (紫) / `#2563eb` (蓝)
- Claude / Composer — `#d97706` (橙)
- DeepSeek — `#059669` (绿)
- 人工步骤 — `#e67e22` (琥珀)
- 完成节点 — `#c0392b` (红)

## 布局规则

1. 720px 画布宽度，黑底 `#1a1a1a`，圆角 `rx="6"`
2. 标题居中，红色 `#e74c3c`
3. 流程自上而下，Y 坐标递增
4. 多模型并行时同一行水平排列（Y 相同），下方线条汇合到下一行
5. 箭头使用 `<line>` + `marker-end`
6. 每个节点附带文本 `<text>` 居中显示
7. 标注性小字置于节点上方或流程线旁，字号 `9`~`10`，颜色 `#888`~`#aaa`
8. 行间距：节点高 32px，间距 15~20px

## 完整案例（来自 AI Code Review 卡）

见本技能生成的 `docs/20260601-ai-code-review/index.html`，其中包含一个 7 步 3 模型并行工作流的 SVG 流程图。

## 嵌入到 HTML

流程图容器通常放在 stats 行之后、正文之前，作为结构总览：

```html
<div class="flowchart-wrap">
  <svg viewBox="0 0 720 380" ...>...</svg>
</div>
```

```css
.flowchart-wrap {
  background: var(--black);
  padding: .8rem;
}
.flowchart-wrap svg {
  width: 100%;
  height: auto;
  display: block;
}
```
