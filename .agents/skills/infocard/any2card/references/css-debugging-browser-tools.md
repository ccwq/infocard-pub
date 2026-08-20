# CSS 调试经验（浏览器工具篇）

本文档记录在 any2card 信息卡生成过程中，用 Hermes 浏览器工具排查 CSS 渲染问题的经验。

---

## 1. 用 CDP getComputedStyle() 代替截图验证

**问题**：截图慢，视觉判断主观，有时看不清细节。

**做法**：
```javascript
const s = getComputedStyle(document.querySelector('.target'));
s.backgroundColor   // → "rgb(230, 0, 18)"
s.color            // → "rgb(255, 255, 255)"
s.border           // → "2px solid rgb(0, 0, 0)"
```

**适用**：边框颜色、背景透明度、文字颜色、字体大小等所有计算后样式。

**注意**：
- 浏览器每次只保持一个 CDP target 的活跃会话
- 跨 target 的 CDP 调用互不影响，但同一 target 内是顺序执行
- 返回值是**计算后的实际值**（不是 CSS 源码里的写法）

---

## 2. 透明度陷阱：rgba() 低于 0.1 时白字会消失

**问题**：CSS 写了 `background: rgba(36,87,214, 0.04)` + `color: #fff`，结果白色文字在浅色背景上完全看不见。

**原因**：0.04 透明度 = 4%，浅蓝色背景几乎等于白色，白字对比度 ≈ 0。

**安全阈值**：
| 场景 | 最小不透明度 |
|------|------------|
| 浅色背景（白/米白/浅灰）| ≥ 0.15 |
| 中性背景（灰白/象牙）| ≥ 0.10 |
| 深色背景（深灰/近黑）| ≥ 0.05 即可 |

**修复**：把 `rgba(36,87,214, .04)` 改为 `rgba(36,87,214, .18)` 或 `.22`，并显式写文字颜色。

---

## 3. CSS 特异性竞争：nth-child 会覆盖 class 背景

**问题**：
```css
.tbl tr:nth-child(even) td { background: #f8f9fc; }  /* 特异性: 0,1,1,2 = 12 */
.tbl .h-col { background: rgba(36,87,214,.22); }       /* 特异性: 0,1,0,1 = 11 */
```
结果 `.h-col` 被偶数行背景覆盖。

**修复方案**：

方案 A：排除 class（推荐）
```css
.tbl tr:nth-child(even) td:not(.h-col):not(.a-col) { background: #f8f9fc; }
```

方案 B：提升特异性
```css
.tbl td.h-col, .tbl th.h-col { background: rgba(36,87,214,.22) !important; }
```

**经验规则**：
- `!important` 慎用，容易变成霰弹式修复
- 优先用更具体的选择器（`td.h-col` > `.h-col`）
- 父子奇偶选择器（`:nth-child`）和 class 背景竞争时，显式排除

---

## 4. GitHub Pages CDN 缓存延迟导致修复不生效

**问题**：改了 HTML/CSS，push 成功，但浏览器打开还是旧版本。

**排查步骤**：
1. `curl -sS https://ccwq.github.io/infocard-pub/docs/xxx.html | grep '样式关键字'` — 直接查 CDN 返回内容
2. 如果 CDN 仍返回旧内容，等 2-5 分钟再试
3. 如果 CDN 已更新但浏览器 DevTools 缓存仍显示旧内容 → 硬刷新（Ctrl+Shift+R）

**预防**：先在本地用 `file://` 路径验证修改正确，再 push 到 GitHub。

---

## 5. 背景合成规则（background-blend vs. stacking）

**规则**：
- `border-collapse: separate` 的 table，单元格背景是独立层，不相互覆盖
- `background` 在 CSS 层叠中没有"谁覆盖谁"的绝对规则，而是按特异性叠加
- 偶数行背景写在 `.h-col` 之后，会在视觉上覆盖（不是因为 specificity，而是渲染顺序）

**实际建议**：在 table 中，避免用 `:nth-child` 大面积改背景，改用明确的 class 标记每行样式。

---

## 6. 调试流程模板

```
1. browser_cdp → Target.createTarget(url="about:blank")     // 新鲜 target
2. browser_cdp → Target.attachToTarget(flatten=true, ...)
3. browser_cdp → Page.enable                               // 激活 Page domain
4. browser_cdp → Page.navigate(url="...")
5. Runtime.evaluate → getComputedStyle()                  // 读计算样式
6. 对比预期值 vs 实际值
7. patch HTML → git add/commit/push
8. 重走步骤 1-5 验证修复
```

**为什么不能复用旧 target**：长会话后旧 target 的 renderer 可能已僵死（chrome CDP 协议层 timeout），新建 target 可以完全绕过。

---

## 7. 移动端横向溢出（Horizontal Overflow）

**典型症状**：窄屏手机上右侧边框消失、文字被截断、整体可横向滚动。

**根因**：`.banner`、`.footer` 默认 padding 设置过大（如 `2.8rem`），移动端未覆盖减小。

**正确做法（移动端优先原则）：**
```css
/* 默认（移动端）：小边距 */
.banner { background: var(--black); padding: .85rem 1rem; }
.footer { background: #f4f4f4; padding: .85rem 1rem; }

/* 大屏：增大边距 */
@media (min-width: 760px) {
  .banner { padding: .85rem 2.8rem; }
  .footer { padding: .85rem 2.8rem; }
}
```

**关键防御组合（信息卡必备）：**
```css
* { box-sizing: border-box; word-break: break-word; }
body { margin: 0; overflow-x: hidden; }
```

**`overflow-x: auto` vs `hidden`**：
- `auto`：内容溢出时出现滚动条，内容仍可访问（如 `.arch-flow pre` 流程图）
- `hidden`：内容被裁剪，永不出现滚动条

**CSS 文件损坏时的安全恢复**：多个 patch 导致 CSS 语法断裂时，从 git 恢复干净版本（`git show <hash>:<file> > local-copy.html`），再从干净副本重新应用修复。不要"再 patch 一次修复"——只会累积更多损坏。

---

## 8. 常见失败模式速查

| 现象 | 可能原因 | 解决方案 |
|------|---------|---------|
| 文字看不见 | `color: #fff` + 透明背景 | 显式设文字颜色或提高背景不透明度 |
| 边框颜色不对 | `border` 简写在特定元素上不生效 | 用 `border: 2px solid #000` 完整写法 |
| 样式改了不生效 | GitHub Pages CDN 缓存 | 等待或强制刷新；本地先验证 |
| nth-child 覆盖 class | 选择器特异性不足 | `td:not(.h-col)` 排除 或 提升特异性 |
| `!important` 不生效 | 选择器特异性更高 | 检查是哪个规则赢了，针对性替换 |
| browser_navigate 超时 | 旧 target 僵死 | 新建 target（见第 6 节） |
| 移动端右侧溢出 | 默认 padding 大，移动端未覆盖 | 移动端优先设小 padding，大屏再覆盖增大 |