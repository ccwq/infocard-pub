---
name: infocard-poster-shell-rebuild
description: poster-shell 模式信息卡的重建方法论——当 CSS 问题复杂时，从零重建的正确姿势、验证流程和关键约束。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, poster-shell, rebuild, css, mobile, grid]
    related_skills: [infocard-crayon-style, infocard-pub-publisher, any2card]
---

# infocard-poster-shell-rebuild · poster-shell 重建方法论

## 触发条件

满足任一则应考虑**重建**而非补丁：

1. 同一个 CSS 类在文件中出现多次（多重规则）
2. CSS specificity 导致补丁被覆盖超过 2 轮
3. grid/flex 混用且多次补丁失败
4. 用户明确要求"重建这个信息卡"

## 正确的 poster-shell 卡片骨架

### 桌面端（核心 CSS）

```css
/* 卡片容器 */
.skill-card {
  display: grid;
  grid-template-columns: 100px 1fr;  /* 编号列 100px，正文列 1fr */
  position: relative;
  min-height: 96px;
}

/* 编号：垂直居中 */
.card-num {
  grid-column: 1;
  grid-row: 1;
  align-self: center;               /* ← 关键：垂直居中 */
  font: 400 52px/.9 Georgia, serif;
  text-align: right;
  padding-right: 28px;
}

/* 竖向时间轴：绝对定位，不参与网格 */
.card-stripe {
  position: absolute;
  left: 96px;                      /* = 编号列 100px - 4px */
  top: 18px;
  bottom: 18px;
  width: 1px;
}

/* 正文区：必须在第二列 */
.card-body {
  grid-column: 2;                  /* ← 必须显式，否则落入第1列 */
  grid-row: 1;
  padding: 14px 22px 14px 18px;
  min-width: 0;
}
```

### 移动端 720px

```css
@media (max-width: 720px) {
  .skill-card {
    grid-template-columns: 68px 1fr;  /* 编号列收窄到 68px */
  }
  .card-num {
    font-size: 38px;
    padding-right: 16px;
    align-self: center;
  }
  .card-stripe {
    left: 64px;                    /* = 68px - 4px */
    top: 14px;
    bottom: 14px;
  }
  .card-body {
    grid-column: 2;
    padding: 10px 10px 10px 14px;
    /* 注意：不需要 flex: 1，因为 grid-column: 2 已确定列宽 */
  }
}
```

### 关键设计约束

| 约束 | 桌面 | 移动 | 原因 |
|---|---|---|---|
| 编号列宽度 | 100px | 68px | 比例约 1.47 |
| card-stripe left | 96px | 64px | 编号列 - 4px |
| card-body grid-column | 2 | 2 | 必须显式防止落入第1列 |
| card-num align-self | center | center | 配合 grid 垂直居中 |
| card-body min-width | 0 | 0 | 防止长字符串撑破容器 |

## 已知的 R8 CSS 陷阱

### 陷阱 1：双重规则 + specificity 覆盖

`.poster-shell .card-body` 可能出现**两条规则**：

```css
/* 全局规则 */
.poster-shell .card-body { flex: 1; grid-column: 2; ... }

/* @media 规则 */
@media (max-width: 720px) {
  .poster-shell .card-body { grid-column: 2; ... } /* ← 没有 flex: 1！ */
}
```

- `.poster-shell .card-body` specificity = (0,2,0)
- `.card-body` 全局规则 specificity = (0,1,0)
- 全局 `.card-body { flex: 1 }` 补丁**永远被覆盖**
- 移动端变成 `display: flex` 时，flex 子项默认压缩到 0

### 陷阱 2：移动端 skill-card 的实际 display

实测确认：024eafd 基线的 `.skill-card` 在移动端是 `display: flex`（不是 grid）。当 `.card-body` 没有正确宽度分配时，flex 布局导致 body 被压缩到 padding 宽度（22px）。

### 陷阱 3：card-stripe 绝对定位干扰 grid 列分配

当 `.card-stripe` 是 `position: absolute` 时，它不参与网格布局。如果 `.card-body` 没有显式 `grid-column: 2`，它会自动落入第 1 列（编号列），宽度只有 100px。

## 验证方法

```js
// CDP Runtime.evaluate — 检查序号垂直居中
const num  = document.querySelector('.card-num').getBoundingClientRect();
const card = document.querySelector('.skill-card').getBoundingClientRect();
const body = document.querySelector('.card-body').getBoundingClientRect();
JSON.stringify({
  num_center: Math.round(num.top + num.height/2),
  card_center: Math.round(card.top + card.height/2),
  diff: Math.round(card.top + card.height/2 - (num.top + num.height/2))
});

// 检查 card-body 宽度（移动端）
const bodyStyle = getComputedStyle(document.querySelector('.card-body'));
JSON.stringify({
  width: bodyStyle.width,
  flexBasis: bodyStyle.flexBasis,
  flexGrow: bodyStyle.flexGrow,
  display: getComputedStyle(document.querySelector('.skill-card')).display
});
```

## 重建执行流程

1. **提取内容**：从旧文件提取 15 个 section 的完整文字内容（含 card-desc、table、code block）
2. **确认结构**：从旧文件读取 CSS（头部 token、全局规则、@media 规则），确认 `.skill-card` / `.card-num` / `.card-body` / `.card-stripe` 的所有出现位置
3. **写新 CSS**：用上方的"正确的 poster-shell 卡片骨架"，不继承旧 CSS
4. **写新 HTML**：保留全部 15 个 section 内容，用新类名
5. **本地验证**：preview server + cloudflared tunnel，手机访问验证
6. **发布**：meta.yaml → build → push

**npm run build 的 index 文件行为**：当存量卡没有新增 meta 字段时，`build` 可能显示 "SKIP unchanged"，`_index.yaml` 和 `index.html` 不变。判断标准：`git diff --stat _index.yaml index.html` 输出为空则索引未变，只需 commit HTML 文件。注意：只要 `updated` 字段被 sync-build-timestamps 更新了（这在每次 build 时都会做），索引文件就会变。

## worktree + force-push（大规模 HTML rewrite 专用）

**场景**：完整 rewrite 一个 15KB+ 的 HTML 文件（rebuild / 换主题 / 换布局）。

**问题**：直接在主仓库改 20KB HTML，git diff 产生大量上下文加载，fetch/rebase 摩擦大，容易污染主仓库历史。

**方案**：worktree 隔离 rewrite，完成后 force-push main。

```bash
# 1. 创建独立 worktree（基于 origin/main 最新 SHA）
BASE_SHA=$(git fetch origin main --quiet && git rev-parse origin/main)
git worktree add -b fix/<slug>-layout /tmp/infocard-<slug> $BASE_SHA

# 2. 在 worktree 内完成全部修改 + build
cd /tmp/infocard-<slug>
# write_file HTML → write_file meta.yaml → npm run build → npm run verify

# 3. commit + force-push main
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "fix: rebuild <slug> layout"
git push origin HEAD:refs/heads/main --force

# 4. 清理 worktree（防止下次同名冲突）
git worktree remove /tmp/infocard-<slug> --force
```

**为什么不用 PR**：用户偏好本地合并好再 push，不需要 review 流程。`HEAD:refs/heads/main` force-push 直接覆写 main，比开 PR 再合并更快。适用于信息卡 rebuild 这类"内容替换而非协作"的场景。

## 参考

- crayon-style poster-shell 参考：`infocard-crayon-style` SKILL.md
- grid-column-trap：`infocard-crayon-style/references/grid-column-trap.md`
- darkblue CSS token 系统：`references/darkblue-css-token-system.md`
