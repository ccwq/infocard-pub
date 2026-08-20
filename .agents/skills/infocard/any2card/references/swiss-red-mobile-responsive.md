# Swiss Red 主题信息卡 — 移动端响应式标准

> 适用于 infocard-pub 仓库所有瑞士红黑主题 HTML 卡片。
> 每次生成新卡片前，从本文件复制 CSS 基础结构，确保移动端合规。

## 基础模板（移动端优先写法）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>标题</title>
  <style>
    :root {
      --bg: #eef2f8;
      --card: #ffffff;
      --ink: #0f172a;
      --muted: #5b6475;
      --line: #d9e1ee;
      --soft: #f8f8f8;
      --red: #e60012;
      --black: #000000;
    }
    * { box-sizing: border-box; word-break: break-word; }
    html { font-size: 16px; background: var(--bg); }
    body { margin: 0; overflow-x: hidden; font-family: ...; ... }

    .page { max-width: 780px; margin: 0 auto; padding: .75rem .7rem 4.8rem; }
    .card { background: var(--card); overflow: hidden; }

    /* ===== 默认（移动端）：小 padding ===== */
    .banner { background: var(--black); padding: .85rem 1rem; }
    .footer { background: #f4f4f4; padding: .85rem 1rem; ... }

    /* ===== 大屏（760px+）：增大边距 ===== */
    @media (min-width: 760px) {
      .banner, .footer { padding-left: 2.8rem; padding-right: 2.8rem; }
    }

    /* ===== 中小屏（≤720px）：单列布局 ===== */
    @media (max-width: 720px) {
      .card-grid, .timeline, .tool-list { grid-template-columns: 1fr; }
      .stats { grid-template-columns: repeat(2, 1fr); max-width: 100%; }
    }

    /* ===== 超窄屏（≤400px）：进一步压缩 ===== */
    @media (max-width: 400px) {
      .page { padding: .75rem .4rem 4.8rem; }
      .stat { padding: .4rem .2rem; }
      .stat-num { font-size: 1.1rem; }
      .banner-title { font-size: 1.4rem; }
    }
  </style>
</head>
```

## 关键数值速查

| 元素 | 移动端值 | 大屏值（760px+） | 超窄屏（400px-） |
|------|-----------|-------------------|------------------|
| 横幅（banner/footer）左右 padding | `1rem` | `2.8rem` | `1rem` |
| 页面（.page）左右 padding | `.7rem` | `.7rem` | `.4rem` |
| 统计格（.stat）内边距 | `.5rem` | `.45rem .3rem` | `.4rem .2rem` |
| 统计数字（.stat-num）字号 | `1.35rem` | `1.4rem` | `1.1rem` |
| 横幅标题（.banner-title）字号 | `clamp(1.8rem,5.2vw,3.2rem)` | 同上 | `1.4rem` 固定 |
| 网格（grid）布局 | `1fr` | `1fr 1fr` | `1fr` |
| 统计网格布局 | `repeat(2,1fr)` | `repeat(4,1fr)` | `repeat(2,1fr)` |

## 移动端溢出快速自检

每次生成或修改 HTML 后，检查以下 5 项：

1. ✅ `body { overflow-x: hidden }` — 防止整体横向滚动
2. ✅ `* { word-break: break-word }` — 防止长 URL/代码撑破容器
3. ✅ `* { box-sizing: border-box }` — 确保 padding 计入 width
4. ✅ 横幅/页脚默认 padding ≤ `1rem`（大屏再用媒体查询覆盖增大）
5. ✅ 超小屏（≤400px）有额外断点压缩边距和字号

## 常见错误模式

### ❌ 错误：默认设大 padding，移动端再覆盖
```css
.banner { padding: .85rem 2.8rem; }  /* 大屏值写在默认位置 */
@media (max-width: 720px) {
  .banner { padding: .85rem 1rem; }  /* 移动端覆盖 ← 容易遗漏 */
}
```

### ✅ 正确：移动端优先
```css
.banner { padding: .85rem 1rem; }      /* 默认：小 padding */
@media (min-width: 760px) {
  .banner { padding: .85rem 2.8rem; }  /* 大屏覆盖增大 */
}
```

### ❌ 错误：预格式化文本隐藏横向滚动
```css
.arch-flow pre { overflow-x: hidden; }  /* 流程图无法滚动 */
```

### ✅ 正确：允许横向滚动
```css
.arch-flow pre { overflow-x: auto; }
```

## 已知受影响的卡片文件

| 文件 | 问题 | 修复状态 |
|------|------|----------|
| `docs/20260528-hermes-android.html` | banner/footer padding 过大，超小屏字号过大 | ✅ 已修复（commit 2a80519）|
| `docs/20260528-hermes-version-report.html` | 同上 | ✅ 已修复（commit 167df9f）|
| 其他 info cards | 待自查 | ⏳ 建议统一自检 |

## Claude Sub-Agents Golden Sample / 技术手册红黑补充

当卡片属于技术手册、Agent/API/CLI、架构说明、权限矩阵、操作流程类内容时，优先使用 `references/claude-subagents-golden-system.md` 的“技术手册红黑”范式。它是 `20260529-claude-subagents.html` 的固化版本，已作为 golden sample。

### 技术手册红黑的响应式硬规则

```css
body{width:min(780px,100vw);margin:0 auto;overflow-x:hidden}
.card{width:100%;max-width:100vw;border:3px solid var(--red)}
@media (max-width:760px){
  body{width:100vw}
  .header{grid-template-columns:1fr;align-items:start}
  .meta{text-align:left}
  .stats{grid-template-columns:repeat(2,1fr)}
  .grid2,.grid3,.children,.footer,.flow{grid-template-columns:1fr}
  .footer{text-align:left}
  .right,.center{text-align:left}
}
```

验收必须同时跑 390px 与 780px：
- 390px：`scrollWidth <= 390`；header 单列；stats 2×2；grid/children/footer/flow 全部单列。
- 780px：header 三栏；stats 四列；grid2 两列；grid3 三列；无横向溢出。

## 调试技巧

### 验证线上 CSS
```bash
curl -s "https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/<filename>.html" | grep -E "(overflow|padding|max-width|word-break)"
```

### 快速恢复损坏的 CSS
```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
git show HEAD~1:docs/<filename>.html > /tmp/clean.html
# 重新从干净版本应用修复
```
