---
name: infocard-theme-assignment
description: "Use when choosing an infocard theme before authoring."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, theme, style, assignment, hardblue, darkblue, redswiss]
    related_skills: [infocard-publish-sop, infocard-style-man-skill, infocard-authoring-workflow, any2card]
---

# infocard-theme-assignment · 信息卡主题分配

## When to use

- 写卡前需要选 `style` / theme
- 用户问“主题分配标准是什么 / 有多少主题 / 为什么全是 hardblue”
- batch 发布出现同主题塌缩
- 用户未指定主题，需要自动选型并保留依据

不要用本 skill 替代具体 `infocard-*-style` 的 token/组件规范；选完主题后仍必须 load 对应 style skill 并读 `theme/<name>.html`。

## Discovery that created this skill (2026-08-03)

Last 24h cards were all hardblue. Root cause was **execution collapse**, not a one-theme inventory:

- technical / open-source / tool was over-mapped to hardblue
- light-route shortlist + single-tool default overrode multi-theme governance
- batch publish did not force per-card content-shape reclassification

## Inventory baseline

- `_themes.yaml` registered: **20** themes
- `theme/*.html` templates: **21** (`codex-notebook` exists as template outside the registered 20)
- Historical usage is multi-theme; hardblue is frequent, not exclusive

Registered family (normalized):
`q`, `green`, `black-head`, `main`, `blue-technical-manual`, `darkblue`, `hardblue`, `redswiss`, `color-material`, `wood`, `handline`, `darkgreen`, `bigwhite`, `white-purple`, `graph-paper`, `pixelstack`, `scrapbook`, `archive-green`, `sage-swiss`, `crayon`

## Hard rules

1. `meta.yaml.style` is **declaration only**, never proof of theme application.
2. Only use registered themes. Do not invent a one-off visual system for a single card.
3. Before HTML: classify content shape → choose primary+fallback → load style skill → read theme demo → rebuild from that skeleton.
4. Never treat “tool” in the title as automatic hardblue or redswiss.

## Content-shape → theme matrix

| Content shape | Primary | Fallback | Do NOT default to |
|---|---|---|---|
| Single technical tool / CLI / implementation manual / agent workflow | hardblue | redswiss | redswiss just because title contains “tool” |
| Multi-tool catalog / CLI ecosystem map / comparison gallery | redswiss | main | hardblue for multi-tool catalogs |
| AI architecture / agent methodology / paradigm shift / system design | darkblue | wood | hardblue just because technical |
| UI component / React library with live demo as core value | darkblue | hardblue | redswiss just because "tool" in name |
| X-origin agent framework / harness / control-plane separation / benchmark report | darkblue | hardblue | hardblue when the card is a plain tool manual; darkblue when the story is about state separation, audit loops, or multi-stage workbench design. |
| Code architecture / dependency graph / knowledge network | graph-paper | darkblue | hardblue |
| Security / hardening / monitoring / zero-trust | darkgreen | hardblue | darkblue by habit |
| Investigation / public-opinion / conclusion-first deconstruction | black-head | hardblue | q / crayon |
| Tutorial / note-style methodology | white-purple or blue-technical-manual | main | hardblue by default |
| Reading / blog interpretation / longform analysis | paper-warm or bigwhite | wood | hardblue |
| Hand-drawn process / parallel scheduling sketch | handline | crayon | hardblue |
| Pixel / retro / game stacking | pixelstack | crayon | hardblue |
| Light overview / sticker-like comparison | q / crayon / scrapbook | main | black-head |
| Simon-Willison-like agentic engineering prose | wood | darkblue | redswiss |
| Brand-green platform product | green | main | hardblue |
| Unknown / mixed / low-confidence | main | hardblue | invent unregistered theme |

## Pre-authoring gate (mandatory)

Emit these four lines into run evidence before writing HTML:

```text
content_shape: <matrix row>
theme_primary: <registered theme>
theme_fallback: <registered theme>
theme_reject: <why nearby popular themes were rejected>
```

Missing this block = incomplete theme selection.

## Batch diversity gate

If a batch has **>= 2** cards:

- Every card must run an independent content-shape classification and record `theme_primary`, `theme_fallback`, and `theme_reject` before authoring.
- Reusing one theme across the batch is **blocked by default**. It is allowed only when every card truly shares the same content shape, reader scenario, and information density, or the user explicitly authorizes a monochrome batch.
- If the same theme is retained, the bundle must contain an explicit `same_theme_exception` with the three-part rationale; otherwise the release is `THEME_BLOCKED`.
- Research/author theme recommendations cannot be silently overridden. Any override requires a recorded reason and re-check against the selected theme's actual skeleton.
- Mixed shapes force per-card re-selection.

## Mechanical theme implementation gate

Before build/push, each card must pass all four checks:

1. `meta.yaml.style` normalizes to the registered bare theme slug;
2. HTML contains matching `data-theme="<bare-slug>"`;
3. the target theme's CSS token signature is present;
4. at least two target structural signatures are present (for example hardblue: `hero-bar` + `section-no`; redswiss: `topbar-hero` + `sec-head`).

A metadata-only style change is invalid. If declaration and implementation disagree, or a batch has unapproved same-theme reuse, stop with `THEME_BLOCKED` before build/push.

## 2026-08-03 counterexamples

| Card | Executed | Better primary |
|---|---|---|
| AirLLM layerwise inference | hardblue | hardblue (acceptable) |
| BrowserAct browser ops layer | hardblue | hardblue (acceptable) |
| SpecJudge local model recommender | hardblue | hardblue or darkblue |
| AutoResearch agent loop | hardblue | darkblue or hardblue |
| Graph Engineering paradigm migration | hardblue | **darkblue** |

## Decision tree (short)

```text
code architecture / knowledge graph?
  yes → graph-paper
  no ↓
architecture / methodology / paradigm / workbench?
  yes → darkblue
  no ↓
UI component library / React with live demo?
  yes → darkblue + 去 mockup + 紧凑 SVG 示意（见 infocard-authoring-workflow）
  no ↓
multi-tool catalog / ecosystem compare?
  yes → redswiss
  no ↓
single tool / CLI / implementation manual?
  yes → hardblue
  no ↓
security / monitoring?
  yes → darkgreen
  no ↓
investigation / conclusion-first?
  yes → black-head
  no ↓
tutorial / notes?
  yes → white-purple or blue-technical-manual
  no ↓
main as safe default
```

## Theme rebuild pattern (existing card → new theme)

When an existing card changes theme (not a new publish), follow this direct-rebuild workflow:

### When to use this pattern
- Card already exists with Theme A, user wants Theme B
- Content is unchanged; only the visual skin changes
- Not a new card — no research, no new sources needed

### Six-step rebuild sequence

```
1. read_file docs/<slug>.html          — preserve all original content
2. read_file theme/<target>.html       — get target theme skeleton
3. skill_view infocard-<target>-style  — get token palette + component rules
4. write_file with new tokens           — preserve ALL original content sections,
                                          swap only CSS variables + shell structure
5. patch meta.yaml style → infocard-<target>-style
6. git add + commit + push + curl 200
```

### CSS variable swap (the actual rebuild operation)

```css
/* Source: darkblue tokens (--bg:#0c1020, --accent:#58c3ff etc.)
   Target: white-purple tokens (--bg:#f7f7fb, --accent:#8a5cf5 etc.) */

/* Replace in :root { ... } block only — preserve all class/structure rules */
:root {
  --bg: #f7f7fb;        /* was #0c1020 */
  --paper: #ffffff;
  --ink: #111111;
  --accent: #8a5cf5;     /* was #58c3ff */
  --accent-deep: #5b49ff;
  /* ... all other target tokens ... */
}
```

### Content preservation rule
**Keep every `<section>`, `<div class="hero">`, `<div class="shell">`, `<div class="panel">`, `<div class="code-block">`, `<footer>` verbatim.** Only replace:
- `:root` CSS variables
- `<body>` background gradient
- Shell/glass-card wrappers that use the old tokens
- Footer badge values (`style: darkblue` → `style: white-purple`)
- `html2canvas` background color in the save button script

Do NOT rewrite prose content, code block text, comparison items, or author cards.

### Build may timeout but files are written
`npm run build` can timeout on large repos (816+ meta files). The build process writes files incrementally — if `_index.yaml` and `index.html` were regenerated before timeout, the card HTML is already correct. Verify with:
```bash
grep -c '<slug>' _index.yaml    # should show the card
grep -c '<slug>' index.html     # should show the card
```
If both show the card, proceed to git add+commit+push. Do NOT re-run build.

### Append change comment to HTML
```html
<!-- 变更说明 YYYY-MM-DD: 主题从 <old> 更改为 <new>（矩阵：<row> → <new>），原始内容保留 -->
```
Place it at the very end of the file, after `</html>`.

### Git commit for rebuild (not new card)
```bash
git add docs/<slug>.html docs/<slug>.html.meta.yaml
git commit -m "feat: rebuild <slug> with <target> style (<old> → <target>)"
git push   # or git push origin HEAD:refs/heads/main for worktree
```

### Verified case (2026-08-19)
`best-rules`: darkblue → white-purple. Matrix row: `tutorial/methodology → white-purple`. All original content (hero, Implementation rules, three-layer structure, comparison, author cards) preserved. HTML written in one `write_file` call (~30KB). Build timed out but files correct. HTTP 200 confirmed.

## Batch incident reference

The 2026-08-16 batch-theme collapse and its verified correction are recorded in `references/batch-theme-collapse-20260816.md`. Use it when two or more cards are published together or when a research handoff recommends a different theme than the batch default.

## After selection

1. `skill_view(name='infocard-<theme>-style')` when the style skill exists
2. Read `theme/<theme>.html` in infocard-pub
3. Write HTML from that skeleton
4. Set `meta.style` only if implementation matches
5. Verify `:root` tokens + >=2 structural signatures

## Closeout must report

- content_shape
- theme_primary / theme_fallback
- style skill loaded (or “theme-only”)
- token/signature verification result

## Republish / push lessons (2026-08-03)

When correcting a theme on an existing card, the release path must distinguish implementation delivery from Pages deployment:

1. Create a fresh named worktree from the current `origin/main`; keep ambient changes out of the candidate.
2. Rebuild the HTML around the selected theme's real skeleton and signature components; changing only `meta.style` or a few colors is not a valid correction.
3. Add `data-theme="<bare-slug>"` to HTML and normalize it against canonical `meta.style: infocard-<slug>-style`.
4. Run build/static gates and 390px CDP checks before commit. Record `innerWidth`, `scrollWidth`, page height, and overflow for every changed card.
5. Stage generated `_index.yaml` and `index.html` with the card and sidecar in the same commit.
6. Push a named branch and verify both the remote ref and raw branch content. A pushed branch is not a GitHub Pages deployment; if Pages still serves the old content, report `已推送分支，公网主站待合并/部署`, not `已发布`.

DOM/theme markers, computed styles, overflow metrics, or screenshot bytes alone do not constitute visual PASS. A successful screenshot must still receive a critical/major/minor review; otherwise report `VISUAL_PENDING`.

See `references/theme-rebuild-branch-delivery-lessons-20260803.md` for the evidence record and verification template.

## Related (may be user-owned / need adopt)

- `infocard-publish-sop` — publish orchestrator; currently user-owned, cannot be auto-patched
- `infocard-style-man-skill` — style governance admin; currently user-owned
- `infocard-authoring-workflow` — light-route shortlist (4 defaults); incomplete alone

If those umbrella skills should absorb this permanently, run:

```text
hermes curator adopt infocard-publish-sop
hermes curator adopt infocard-style-man-skill
```

then merge this decision tree into them.

## Graph-Paper 公众号兼容正文样稿工作流（2026-08-04）

**输入**：`gzh-design` 技能的 reference 手册（如 `theme-graph-paper-manual.md`）  
**输出**：公众号可直接粘贴的 `.wechat.html` 文件

### 标准步骤

1. **读取 reference 手册** — 位于 `~/.agents/skills/gzh-design/references/theme-<name>-manual.md`，包含所有组件的参数化 HTML snippet  
2. **写 `.wechat.html`** — 放在 `/tmp/redswiss-stage/` 下，主体是 `<section style="max-width:677px;margin:0 auto;padding:10px;background:#纸底色;">`  
3. **公众号化规则**：
   - 不使用 `<style>` 标签、class、id、grid、position:absolute/fixed、var()、clamp()、vw/vh/rem
   - 所有样式用 `style="..."` 内联
   - 嵌套 `<span leaf="">` 包裹每段可替换文字（即使有多层样式也要层层包裹）
   - Hero 顶栏也套入白色 `<section style="background:#fff;border:1px solid #E0DDD0;border-radius:4px;padding:14px;">` 使之与节点卡视觉统一
4. **校验**：`python3 .agents/skills/gzh-design/scripts/validate_gzh_html.py <output.html>` → 必须输出 `✅ 完全合规`
5. **二次检查**：用 skill 内置脚本 `scripts/check_gzh_inline.py <output.html>`：
   - 禁用属性（position/gradient/var/clamp/vw/vh/rem）：0 处
   - `span leaf=` 包裹数量充足（正文段落每段 ≥1 处）
   - 仅含允许标签（section/span/p/h2/h3/h4/ul/li/strong/em/br）
6. **严格交付前自检**：只保留用户声明的标签子集，不要把示例、调试文字或临时占位内容写入成品；用 HTMLParser 检查所有非空文本节点都在带 `leaf` 属性的 `span` 内，并检查真实标签集合。禁用 CSS 扫描必须匹配真正的 `transform:`（例如 `(?<![\\w-])transform\\s*:`），不要把合法的 `text-transform:` 误报为禁用项；扫描发现任何命中都必须修复后再交付。

## References

- `references/2026-08-03-hardblue-collapse-session.md` — discovery evidence and matrix detail
- `scripts/check_gzh_inline.py` — 公众号 HTML 禁用属性 + 标签白名单 + span leaf 计数验证脚本
