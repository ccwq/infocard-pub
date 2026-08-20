# Darkblue Style: CSS-Only Visual Approach

> 当 darkblue 风格信息卡的内容是**纯技术/工程框架**（不需要真实产品截图）时，可以完全依赖 CSS 视觉元素构建，无需下载外部图片。
> 经验来源：open-gsd/gsd-core (2026-06-12) 技术卡 — 全程无外部图片，CSS 构建所有视觉元素。

## 何时用纯 CSS vs 外部图片

| 情况 | 推荐方式 |
|---|---|
| 内容是纯技术框架/工程产品，无现成产品图 | ✅ 纯 CSS 视觉元素 |
| 仓库有现成的 README hero 图/产品界面图 | ✅ 下载并本地化 |
| 需要真实人物头像 | ✅ 从 GitHub API 取 avatar 并下载 |

## 可用的 CSS-only 视觉组件

### 1. 渐变 Orb（替代 logo）
```html
<div class="orb">GSD</div>
```
```css
.orb {
  width: 66px; height: 66px; border-radius: 22px;
  background:
    radial-gradient(circle at 30% 28%, rgba(255,255,255,.36) 0 10%, transparent 11%),
    linear-gradient(135deg, var(--cyan) 0%, var(--blue) 34%, var(--purple) 68%, var(--green) 100%);
  box-shadow: 0 10px 26px rgba(88,195,255,.24), inset 0 1px 0 rgba(255,255,255,.18);
  display: grid; place-items: center;
  color: #fff; font-size: 26px; font-weight: 950; letter-spacing: -.08em;
}
```

### 2. 渐变 Strip（替代分隔线/进度条）
```css
.visual-strip {
  height: 12px; border-radius: 999px;
  background: linear-gradient(90deg,
    var(--cyan) 0%, #53a3ff 22%, var(--purple) 54%, var(--green) 80%, var(--yellow) 100%);
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 10px 24px rgba(88,195,255,.16);
}
```

### 3. SVG Icons（替代 emoji）
```html
<div class="mini-icon cyan">
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
</div>
```
```css
.mini-icon {
  width: 36px; height: 36px; border-radius: 12px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
  border: 1px solid rgba(255,255,255,.1);
  color: #fff; /* 按状态染色: cyan/green/yellow/purple */
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.mini-icon svg { width: 19px; height: 19px; stroke: currentColor; fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
```

### 4. Glass Panel
```css
.hero-visual {
  min-width: 0; background: rgba(10,12,22,.5);
  border: 1.5px solid rgba(255,255,255,.12);
  border-radius: 22px; box-shadow: 0 18px 42px rgba(0,0,0,.34);
  padding: 14px; display: grid; gap: 12px; align-content: start;
}
.mini-card {
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border: 1.5px solid rgba(255,255,255,.09);
  border-radius: 16px; padding: 10px 10px 9px;
  box-shadow: 0 12px 26px rgba(0,0,0,.2);
}
```

### 5. 状态进度条
```html
<div class="bar-row">
  <div class="bar-label">Claude Code</div>
  <div class="bar-track">
    <div class="bar-fill" style="width:100%;background:var(--cyan)"></div>
  </div>
</div>
```
```css
.bar-track { flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; }
```

### 6. Phase Flow Strip
用 N 个 phase 面板并排 + 不同颜色编号，替代手绘流程图：
```css
.phase:nth-child(1) .n { color: var(--cyan) }
.phase:nth-child(2) .n { color: var(--blue) }
.phase:nth-child(3) .n { color: var(--green) }
.phase:nth-child(4) .n { color: var(--yellow) }
.phase:nth-child(5) .n { color: var(--purple) }
```

## 完整 darkblue 骨架要点清单

从 `theme/darkblue.html` 直接复制结构，不要凭感觉写：

- [ ] `:root` token 完整（--bg, --panel, --ink, --cyan, --blue, --green, --yellow, --purple）
- [ ] body 渐变背景（4 个 radial-gradient + 1 个 linear-gradient）
- [ ] hero: `grid-template-columns: minmax(0,1.08fr) minmax(280px,.92fr)`
- [ ] `body::before` 等效 mask 层（细线网格遮罩）
- [ ] pill/chip: `backdrop-filter: blur(10px)` 玻璃感
- [ ] `box-shadow: 0 18px 42px rgba(0,0,0,.34)` 标准面板阴影
- [ ] `@media(max-width:720px)`: hero 单列化、shell 隐藏
- [ ] `.save` 按钮: 蓝紫渐变 + `box-shadow: 0 12px 28px rgba(74,120,255,.3)`
- [ ] `html2canvas` 背景色传递 `'#0c1020'`

## 反例

- ❌ 大面积红色填充（red 只适合作为对比差，不是主状态色）
- ❌ 暖纸纹理（darkblue 里禁止米纸/纸张噪点）
- ❌ emoji 作为主图标（用 SVG linear icon）
- ❌ 把 darkblue 当成深色 hardblue/redswiss
- ❌ 没有 radial-gradient 渐变背景（那就不是 darkblue）
