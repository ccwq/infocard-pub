---
name: infocard-creation-preview-standards
description: Use when creating or revising infocard HTML so preview entrypoints and creation-time responsive constraints stay consistent across themes.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, preview, responsive, live-server]
    related_skills: [infocard-mobile-verifier, infocard-publish-sop]
---

# Infocard Creation & Preview Standards

## Overview

This skill defines the **style-agnostic base rules** for infocard creation and preview.

It exists to keep four things stable across all infocard themes:

1. the local preview entrypoint
2. the preview URL shape
3. responsive authoring constraints that must be handled during writing/building, not only during QA
4. the specific rule for wide tables on phone-width layouts

This skill is not a theme skill. It does not control colors, typography personality, or visual language. It controls the cross-theme creation and preview contract.

## Verification Evidence Discipline

- Treat static validation and visual preview as separate gates: HTML parsing, YAML parsing, forbidden-term checks, and CSS/viewport inspection do not substitute for a real browser screenshot.
- Before claiming visual verification, confirm that the preview server actually serves the target file (HTTP status and non-empty response). If a port is occupied, inspect or choose another available port rather than assuming the existing process is healthy.
- If browser navigation is redirected to an unrelated page or the local server returns an empty response, report visual preview as incomplete; do not present static checks as screenshot evidence.
- Keep the deliverable usable even when preview infrastructure is unavailable: complete the HTML, run deterministic static checks, and clearly separate verified facts from unverified visual claims.

## When to Use

Use this skill when:
- creating a new infocard
- rebuilding an infocard from scratch
- revising layout, structure, responsive behavior, or table presentation
- previewing a card before publish
- checking whether a layout rule belongs to creation-time standards rather than one specific theme

### 重建 vs 补丁（关键区分）

**触发"重建"（从零骨架重写）的信号**：
- 用户明确说"重建"
- 用户说"样式存在问题"且非单点小修复
- HTML 文件已有多次补丁累积，结构出现裂缝（标签错位、重复闭合、空 div 残留）
- 换主题（如从 main-style 换到 hardblue）

**重建标准操作**：
1. 读取 `theme/<theme-name>.html` 完整 CSS 骨架（不是参考 HTML 片段）
2. 从零写 HTML，用 theme 的正式 CSS class（`.hero` / `.section` / `.section-no` / `.card` / `.risk` 等）
3. **禁止**用 inline style 补丁代替结构重建；禁止保留旧卡换色
4. 写完后用 Python HTMLParser 验证闭合标签
5. 更新 `meta.yaml` 的 `date` + `updated` 为当前 Asia/Shanghai 时间戳

**触发"补丁"（精准替换）的信号**：
- 已知 HTML 结构完好，只需换文案、增删一行内容
- meta.yaml 时间戳或字段修正
- 关键词增删

**禁止**：对结构已有裂缝的 HTML 打补丁。裂缝只能通过重建修复。

## Core Standards

### 0) Rule placement discipline

本 skill 只负责创建阶段的通用预览面和响应式约束。真实移动端验收、截图、DOM 诊断与修复统一交给 `infocard-mobile-verifier`；发布级门禁由 `infocard-publish-sop` 和 `visual-verification-gate` 负责。不要在这里复制下游验收或发布 SOP。


### 1) Standard local preview surface

All infocard local preview, including **PC preview and mobile preview**, should use the same LAN surface:

- server: `live-server`
- host: `0.0.0.0`
- port: `5588`
- preferred LAN IP: `10.6.8.14`
- URL shape: `http://10.6.8.14:5588/docs/<slug>.html`

Canonical command:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$REPO_ROOT"
live-server --host=0.0.0.0 --port=5588 --no-browser .
```

Rules:
- do not switch preview conventions between PC and mobile
- do not use old 4173/4174 preview habits unless 5588 is unavailable and that exception is stated explicitly
- do not substitute `python http.server` for the standard infocard preview workflow

### 2) Preview is not mobile-only

The same preview surface is used for:
- PC layout review
- mobile layout review
- screenshot verification
- visual debugging before publish

This avoids split-brain workflows where desktop is checked in one environment and mobile in another.

### 3) Responsive constraints belong in creation, not only acceptance

If a layout problem is predictable during authoring, it must be handled **while creating the card**, not postponed until the final mobile QA pass.

This especially applies to:
- wide tables
- multi-column blocks
- code blocks
- image galleries
- dense stat grids

Do not rely on final QA to discover a structural issue that should have been designed out earlier.

### 3.1) Author-stage trigger declaration

Before authoring, the release bundle declares `visual_review.required` and its triggers. The Author must preserve that declaration and design the responsive behavior for every listed trigger; it cannot downgrade the card to static-only review. If the card introduces a new trigger-bearing element not listed in the bundle, report it to the main thread before handoff so the bundle/evidence plan can be updated. The handoff must identify the responsive treatment for each trigger (for example: multi-column → stack, table/code → dedicated local horizontal scrolling, fixed control → normal flow or safe area on mobile).

## Wide Table Rule

### 4) Wide tables are a creation-time constraint

If a table is likely to exceed phone width, design it from the beginning with a dedicated horizontal scrolling container.

The correct strategy is:
- keep readable column widths
- preserve the rightmost columns
- allow horizontal scrolling inside the table region

The wrong strategies are:
- shrinking the entire page to force the table to fit
- scaling/zooming the viewport to fake a pass
- compressing columns until the text becomes unreadable
- clipping the rightmost columns
- replacing a structurally needed table with a broken pseudo-stack that loses comparison value

### 5) Wide-table acceptance condition on mobile

On a phone-width viewport, the table passes only if:
- the user can horizontally reach the rightmost column
- the text remains readable
- the table does not force the whole page into unusable overflow
- the rest of the page layout remains stable

This rule is **style-agnostic**. It applies across infocard themes.

### 6) Desktop readability rule for manual tables

Do not treat horizontal scrolling as the default desktop outcome for a core reference table.

If the desktop page width can reasonably accommodate the table, prefer:
- giving the table a full-width section
- moving auxiliary explanation below or above the table
- reserving split-column layouts for supporting notes rather than the main parameter matrix

Avoid putting the primary parameter/options table inside a left-right split that makes desktop users scroll sideways for information that should fit in one reading pass.

Mobile may still use an independent horizontal-scroll container when needed, but desktop should first try to preserve one-screen legibility for the main manual table.

## Creation-stage checklist

1. 在主 checkout 的 `.docs/<run-id>/<slug>/` 创建或修订候选稿。
2. 使用统一的 `live-server` 预览面检查桌面布局。
3. 对宽表、代码块、多列块、图片和固定控件预先设计窄屏处理，并在交给 `infocard-mobile-verifier` 前记录处理意图。
4. 需要移动端证据时，转交 `infocard-mobile-verifier`；本 skill 不执行移动截图或发布门禁。

## Common Pitfalls

1. **Treating preview as a mobile-only rule.**
   Wrong. The live-server + LAN URL rule is for both PC and mobile preview.

2. **Putting wide-table logic only into QA skills.**
   Wrong. Wide tables are an authoring-time responsibility first, QA responsibility second.

3. **Passing by shrinking the whole page.**
   Wrong. A readable table with local horizontal scroll beats a globally shrunken page.

4. **Theme leakage.**
   Wrong. These rules belong to cross-theme creation/preview standards, not one specific style skill.

5. **Using a different local server ad hoc.**
   Wrong. Standard infocard preview should converge on `live-server` at `10.6.8.14:5588` unless an explicit exception is documented.

## References

- `references/manual-table-desktop-vs-mobile.md` — when a manual/parameter table should become full-width on desktop while preserving local horizontal scroll on mobile.
- `references/rule-placement-and-table-scope-2026-06-18.md` — why cross-theme preview rules and style-agnostic wide-table constraints belong in this umbrella skill first.
- `references/darkblue-theme-classes.md` — darkblue 主题 CSS class 速查（调色板、hero、card、pill、grid 布局、SVG 简图规范），含完整参考源文件路径。

## Handoff checklist

- [ ] Local preview uses `live-server`
- [ ] Preview URL uses `http://10.6.8.14:5588/docs/<slug>.html`
- [ ] 桌面预览已在统一 preview surface 完成
- [ ] Responsive constraints were handled during creation, not deferred blindly to final QA
- [ ] 宽表使用局部滚动容器或已设计移动 card/list 表达
- [ ] Rule application is theme-agnostic

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-quality-gate`。它不得再独立宣布视觉通过或重复启动完整浏览器验收。
