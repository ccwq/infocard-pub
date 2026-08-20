# awesome-design-md 卡片模式（2026-07-08 Session）

> 本文件记录 2026-07-08 为 VoltAgent/awesome-design-md 创建 redswiss 卡片时的版式创新，供后续同类型顶流开源项目卡参考。

## 卡片背景

- **项目**：VoltAgent/awesome-design-md
- **Stars**：97,595（顶流）
- **主题**：单个开源项目，不是工具集合

## 验证成功的版式组件

### 1. src-grid（品牌分类网格）

用于展示 73 个 DESIGN.md 按类别分组。RedSwiss 标准 cli-grid 只支持 4 列，这里用 `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` 实现更宽的响应式网格。

```css
.src-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.src-card {
  border: 1.5px solid var(--line);
  background: var(--paper);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}
.src-card .cat {
  font: 900 10px/1 ui-monospace, monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink);
  opacity: .5;
  margin-bottom: 2px;
}
.src-card .brands {
  font-size: 12.5px;
  font-weight: 850;
  line-height: 1.5;
}
```

### 2. use-flow（三步流程）

用于展示"Copy → Tell AI → Auto-Generate"这样的线性操作流。三个 `.use-step` 用 → 连接。

```css
.use-flow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.use-step {
  border: 2px solid var(--line);
  background: var(--paper);
  padding: 10px 12px;
  display: grid;
  gap: 5px;
  position: relative;
}
.use-step::after {
  content: "→";
  position: absolute;
  right: -18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
  opacity: .3;
}
.use-step:last-child::after { display: none; }
.use-step .n {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--red);
  color: #fff;
  font: 950 13px/1 ui-monospace, monospace;
  border-radius: 50%;
}
```

### 3. compare（左右对比）

用于展示"传统方式 vs DESIGN.md+AI"。`.compare-box.new` 用红色边框和浅红背景。

```css
.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.compare-box {
  border: 2px solid var(--line);
  padding: 14px;
  display: grid;
  gap: 8px;
}
.compare-box.old { background: var(--soft-ink); }
.compare-box.new { background: var(--soft-red); border-color: var(--red); }
.compare-box h4 { font-size: 15px; font-weight: 950; margin: 0; }
.compare-box.old h4 { opacity: .5; }
.compare-box.new h4 { color: var(--red); }
.compare-box ul { margin: 0; padding-left: 14px; display: grid; gap: 4px; }
.compare-box li { font-size: 12.5px; line-height: 1.6; }
.compare-box.new ul li::marker { color: var(--green); }
```

## anti-pattern 修正（2026-07-08）

**原 skill 描述**：redswiss "无蓝/绿/黄辅助色"

**实际情况**：redswiss 模板定义了 `--blue`、`--green`、`--purple`、`--orange` 这四个 CSS 变量（用于 badge pill 颜色变体），发布时可以使用它们。

**修正后的规则**：
- ✅ 可以使用 `--blue`、`--green`、`--purple`、`--orange` 变量作为 badge/tag 颜色
- ❌ 不得引入这些变量以外的蓝/绿/黄/橙色（如 `color: #1e90ff`）
- ❌ 不得将蓝色用于 card/panel 背景色（保留给 `.badge.blue` pill）
- ✅ 所有自定义色值必须源自 `:root` 中定义的 CSS 变量

## 原始文件

- 卡片：`docs/20260708-awesome-design-md.html`（相对于 active repository root）
- 类型：redswiss，单开源项目顶流卡
