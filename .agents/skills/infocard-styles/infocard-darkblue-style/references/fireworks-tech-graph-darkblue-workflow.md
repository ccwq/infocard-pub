# fireworks-tech-graph → Darkblue Infocard Workflow

## Context

`fireworks-tech-graph` (github.com/yizhiyanhua-ai/fireworks-tech-graph, 8,511 ★, MIT, Python) is a Claude Code Skill that converts natural language descriptions into publication-ready SVG+PNG technical diagrams.

Session 2026-07-11: user requested a darkblue infocard with specific sections. The expected `/tmp/infocard-process-fireworks.md` was missing, so the source was `/tmp/fireworks.md` (the full README.md).

## Workflow When Process File Is Missing

If `process file → doesn't exist` (e.g. `/tmp/infocard-process-<name>.md`):
1. Search for the actual README/source file — often at `/tmp/<name>.md` or `/tmp/<repo-name>.md`
2. Read it in full (may be truncated, use offset to get remaining sections)
3. Extract structured data: features list, installation, usage, comparison, troubleshooting, file structure
4. For GitHub repos: search `/tmp` for related files (`assets/`, `scripts/`, etc.) — they may not be present
5. Proceed with infocard generation using README as primary source

## Key Sections Extracted from fireworks-tech-graph README

The README contained these sections NOT named in the user's brief but discovered by reading:

### Structured SVG Validator (4 checks)
- **XML 解析完整性** — `xml.etree.ElementTree.parse()` 全文件解析
- **marker 引用完整性** — 所有 `marker-start/mid/end` 引用的 ID 必须在 `<defs>` 中有定义
- **Path 碰撞检测** — `M/L/H/V/Q/C/S/T` 路径段 bounding box 交叉测试
- **Transform 链叠加检测** — 嵌套 transform 累积后节点超出 viewBox 检测

### Visual Review Gate
- **PNG 回读** — 导出 1920px PNG 后重新读取像素数据，检查非全黑/全白
- **穿框检测** — 箭头路径是否穿过节点卡片区域
- **裁切检测** — 文本/连接器是否超出 viewBox 边界
- **标签挤压检测** — textLength/lengthAdjust 比率异常检测

### Loop Engineering Flow (3-stage)
```
Prompt → Diagram Contract → Semantic IR → Style Spec → Route Planner
                                          ↓
SVG Build ← Path Route ← Targeted Revision
    ↓
XML Gate → Collision Gate → PNG Export → PNG Review → Visual Gate → ✓ Verified
```
Design principles: (1) Evaluate not assert, (2) Deterministic checks first, (3) Perceptual validation second, (4) Targeted correction, (5) Bounded convergence (max 2 passes).

## Style Thumbnails: GitHub Raw CDN + Fallback Pattern

When generating darkblue infocards for repos with sample images (like fireworks-tech-graph's 8 style previews):

```html
<img class="style-thumb" 
     src="https://raw.githubusercontent.com/{owner}/{repo}/main/assets/samples/sample-style1-flat.png" 
     alt="Style 1 Flat Icon" 
     loading="lazy" 
     onerror="this.src='https://placehold.co/480x270/ffffff/4a78ff?text=Style+1:+Flat+Icon'">
```

Pattern:
- Use `raw.githubusercontent.com` for GitHub-hosted sample images
- Always add `onerror` fallback to a `placehold.co` placeholder with inline style-encoded text
- Placeholder color scheme should match the style's dominant colors
- This avoids broken image icons when GitHub raw access is unavailable

## Darkblue Sections for fireworks-tech-graph

Based on user's brief + README discovery, the canonical sections for this card were:

1. Hero (source_url + 8,511 Stars + Python + MIT + Claude Code Skill tag + core tagline)
2. 8 Visual Styles grid (each with thumbnail + name + bg color + font + best-for)
3. 14 UML Diagram Types table + 8 AI/Agent diagram types
4. Structured SVG Validator 4 checks (checklist format)
5. Visual Review Gate 4 checks (checklist format)
6. Loop Engineering complete flow diagram (3-row flow nodes)
7. vs Mermaid/draw.io/Excalidraw comparison table (10 criteria)
8. cairosvg install commands

## Darkblue Component Patterns Used

### Flow Diagram (Loop Engineering)
```html
<div class="flow-wrap">
  <div class="flow-diagram">
    <div class="flow-node highlight">Prompt<br><small>自然语言描述</small></div>
    <div class="flow-arrow">→</div>
    <div class="flow-node">Diagram Contract<br><small>结构化需求</small></div>
    ...
  </div>
</div>
```
CSS: `.flow-wrap{overflow-x:auto} .flow-diagram{display:flex;align-items:center;gap:0;min-width:700px} .flow-node{flex-shrink:0;padding:9px 14px;background:var(--panel);border:1px solid var(--line);border-radius:9px;font-size:12px;font-weight:750} .flow-node.highlight{border-color:rgba(88,195,255,.5);background:rgba(88,195,255,.12);color:#d8f4ff} .flow-node.green{...} .flow-arrow{flex-shrink:0;color:var(--muted);font-size:18px;padding:0 5px}`

### Style Grid
```html
<div class="style-grid">
  <div class="style-card">
    <img class="style-thumb" src="..." alt="..." loading="lazy" onerror="...">
    <div class="style-info">
      <div class="style-name">Style 1 — Flat Icon</div>
      <div class="style-desc">白底 · 彩色语义图标...</div>
      <span class="style-tag">...</span>
    </div>
  </div>
</div>
```
CSS: `.style-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px} .style-card{background:var(--panel);border:1px solid var(--line);border-radius:11px;overflow:hidden} .style-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;border-bottom:1px solid var(--line)} .style-info{padding:10px 12px}`

### Checklist
```html
<div class="checklist">
  <div class="check-item">
    <div class="check-icon ok">✓</div>
    <div><div class="check-text"><strong>XML 解析完整性</strong> — description</div>
      <div class="check-sub">sub-description</div>
    </div>
  </div>
</div>
```
CSS: `.checklist{margin-bottom:14px} .check-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)} .check-icon{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:900;flex-shrink:0} .check-icon.ok{background:rgba(45,179,106,.2);border:1px solid rgba(45,179,106,.4);color:var(--green)}`

## Meta YAML Pattern for fireworks-tech-graph

```yaml
slug: 20260711-fireworks-tech-graph
path: docs/20260711-fireworks-tech-graph.html
title: fireworks-tech-graph：自然语言秒生专业级 SVG+PNG 技术图
desc: >-
  fireworks-tech-graph 将自然语言描述转换为出版级 SVG 技术图，8 种视觉风格、14 种 UML 图类型、
  内置 AI/Agent 领域语义，配 Structured SVG Validator + Visual Review Gate 全链路验证，
  PNG 自动导出 1920px。cairosvg 安装命令、Loop Engineering 完整流程图。
tags:
  - fireworks-tech-graph
  - SVG 技术图
  - PNG 导出
  - cairosvg
  - Claude Code Skill
  - UML 图
  - AI Agent
  - Structured SVG Validator
  - Visual Review Gate
category: AI Agent
source: github
source_url: https://github.com/yizhiyanhua-ai/fireworks-tech-graph
author: yizhiyanhua-ai
style: infocard-darkblue-style
```

## Lessons Learned

1. **Process file may not exist** — always search /tmp for the README source before declaring failure
2. **README often contains richer detail than the brief** — Loop Engineering + Validator sections were in README but not in user's brief; discovered by reading full file
3. **GitHub raw CDN for thumbnails** — `raw.githubusercontent.com/{owner}/{repo}/main/assets/samples/` works for fireworks-style repos with sample image galleries
4. **Darkblue suits fireworks-tech-graph** — multi-stage validation loop, 8-style showcase, technical tooling → workbench metaphor fits darkblue well
5. **No date/updated in meta YAML** — user specified "不写date/updated，由工具链自动填充" — honor this explicitly
