---
name: infocard-rebuild-template-grill
description: Use when building a high-density infocard for an open-source repository or technical analysis article. Covers both first-time creation and full reconstruction. Preserves the Swiss red-black UI style, chapter organization, and a 3-round maximum grill-me alignment flow before writing. Use when the user wants a build skill, not merely a content expansion patch.
---

# Infocard Build Template + Grill Alignment

Use this skill when building OR rebuilding a high-density infocard for an open-source repository or technical analysis article.

**Build** = first-time creation from source material.
**Rebuild** = re-do structure, CSS, and visual system from scratch — does NOT mean adding more content to the old layout while carrying bugs forward.

This skill is the authoritative reference for this user's infocard workflow. Do not substitute other skills, do not skip the grill-me phase unless the request is already fully specified, and do not stop at code changes — always verify the rendered result.

**Known pitfalls / debugging (session 2026-07-22):**
- **Table mobile overflow**: `.comp-table` inside a `.card` swallows `overflow-x: auto` due to block formatting context isolation. Fix: wrap table in `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">` — see `infocard-three-stage-pipeline` SKILL.md for the exact pattern. Each `</table>` must close its wrapper `</div>`. Test with 390px viewport.

**Image insertion scope rule (session 2026-06-03):** When the user provides a source URL for image insertion, always confirm the target card by name/slug before writing. The fact that we just edited Card X is NOT sufficient evidence that the image belongs to Card X. See `references/2026-06-03-image-scope-error-and-expansion-spec.md`.

**"Expand to 3x" rule (session 2026-06-03):** When the user says "expand to 3x" or "content is too sparse," every module needs substantive explanation, workflow, caveats, and boundary conditions — not just more listed items. See `references/2026-06-03-image-scope-error-and-expansion-spec.md`.

For rebuild-style infocards, treat these as hard rules unless the user says otherwise:

## Core interpretation rule

When the user says **"build"**: create from source material, full structure from scratch.

When the user says **"rebuild"**: do NOT merely add content to the old layout. The structure, CSS, and visual system must also be re-done from scratch — old bugs must not be carried forward. "Rebuild" ≠ "expand".

When the user says **"expand" / "update" / "make it denser"**: preserve the chapter skeleton and visual style, but increase content depth, examples, evidence, and explanation density. Do not leave the old layout rough and call it done.

**This was the user's explicit correction**: prior sessions showed that "rebuild" was being interpreted as "add more text on top of the old layout" which preserved the original bugs. The user explicitly rejected this. The correct interpretation is: structure replaced, CSS replaced, old bugs gone, content preserved (or explicitly adjusted by user).

**Hard reminder:** if the user says "我是说重建信息卡" or similar, treat it as a strict rebuild directive, not a request for extra density or a style-only patch. Do not continue the grill-me phase unless the user re-opens scope.
## vxtwitter API truncation pattern (2026-06-03)
For `x.com/i/status/<id>` links, use `https://api.vxtwitter.com/status/<id>`:
- Returns JSON with `text`, `user_name`, `user_screen_name`, `date`, `likes/retweets/replies`, `hasMedia`, `mediaURLs[]`
- **Truncation behavior**: `text` is truncated (~100 chars) when tweet is long, but `mediaURLs[]` stays complete
- When `len(text) < 200` and `hasMedia: true` → content is primarily in the image
- Card title strategy: extract "what this tweet argues" from partial text, note "完整内容在配图中"
- Insert `mediaURLs[0]` (largest width) as content source in the card
- `fxtwitter.com` works for HTML but needs JS; `mobile.twitter.com` is blocked; other proxies 404

## Mandatory output style

Preserve the following visual identity:
- Swiss / high-density layout
- red / black / white palette with restrained accent colors
- IBM Plex Sans + IBM Plex Mono typography or visually equivalent mono/sans pairing
- dense but readable modules
- strong section headers, compact metadata blocks, and crisp callouts
- mobile-first resilience: no horizontal overflow, no clipped text, no tiny unreadable text

Avoid:
- soft pastel UI
- large decorative illustrations that reduce density
- excessive whitespace that breaks the archive-card feel
- arbitrary font switching
- layout tweaks that only hide bugs instead of fixing the structure

## Fixed chapter organization

Keep the content organization in a stable card-like hierarchy.

### For open-source repository infocards
Use this default chapter order:
1. Header / project identity
2. One-line judgment / core take
3. Architecture / system overview
4. Quick start / key usage path
5. Configuration / important knobs
6. Extension / contribution / plugin path
7. Artifact / output / deployment / verification
8. Boundary / suitable vs unsuitable users
9. Closing summary / sources

### For technical analysis infocards
Use this default chapter order:
1. Header / subject identity
2. One-line judgment / core conclusion
3. Background / why it matters
4. Evidence / key facts / data points
5. Mechanism / architecture / causal chain
6. Case breakdown / examples / comparison
7. Configuration / parameters / workflow if relevant
8. Verification / limitations / risk / boundary
9. Closing summary / sources

### Allowed variation
You may insert 1–2 topic-specific modules, but the overall skeleton should remain recognizable and reusable.

## Grill-me alignment flow

Before drafting, run a maximum of **3** rounds of grill-me.

### Grill order
1. **Scope split** — what category of infocard is this?
2. **Chapter rigidity** — how fixed should the chapter structure be?
3. **Validation bar** — what must be treated as hard acceptance rules?

### Rules for grilling
- Ask **one question per round**.
- Ask in a compact A/B/C table.
- Provide a recommended answer.
- Stop after 3 rounds max.
- If the user wants a visual module removed but the data should survive, ask where the data should be re-housed before writing.
- If the request is about header density or edge distance, treat spacing as a structural header concern, not a global page resize.
- If the answer is already clear from the user request, skip to writing.
- **Strict execution when user says "用 grill-me 对齐，次数不大于3"**：必须显式问用户选择（A/B/C），不指定默认选项，等用户回复后再执行。不能直接默认执行推荐答案。

### Preferred question shape
Use this format:

| A | B | C |
|---|---|---|
| option 1 | option 2 | option 3 |

Then add a short recommendation: “我的推荐：X”.

## Hard acceptance rules

## Hard acceptance rules

- **Content Density**: When the user requests a rebuild or expansion, treat this as a signal for high-density delivery (3x the previous text depth). Do not merely rearrange sections; supplement with workflow examples, CLI patterns, anti-pattern logic, and installation/config pitfalls.
- **Visual Anchor**: Every technical info card must anchor on at least one high-quality visual element (e.g., product interface, architecture diagram, or CLI capture) from the source repository, solidified locally in `docs/assets/images/` to avoid hotlink degradation.
- For mobile-first legibility (390px/720px), apply the 1.2x scale-up rule for all sub-text (meta, caption, badge, route labels) and ensure no inline `font-size: < 11.2px` exists. When the user explicitly says "字号放大1.2x", treat it as a global typography pass — multiply ALL font-size declarations by 1.2 at the CSS variable definition level, not just body text.
- Structural fix principle: when the user says "不是改颜色" or "not color patching", the fix must be structural (remove padding, box-shadow, unneeded elements) rather than overriding colors. This applies to bottom "black shelf" artifacts — remove the box-shadow causing the shadow and/or make body background match card background, do not paint over the dark color.
- Bottom black area pattern: a visible dark strip at the page bottom is typically caused by body background (#0b0f0d dark) showing through when .page doesn't fill the viewport. Fix structurally: (1) change body{background} from --bg to --card, (2) remove .card box-shadow that creates a visual "shelf" at the bottom, (3) only add min-height as a last resort.
- **Verification failure pitfall — visual model misidentification (2026-06-07)**：当用户说"有吗/没看到/证明给我"时，**视觉分析模型可能误判**：它会把 ENGINEERING section 里的 skill cards 布局误认为旧的 prob-grid 2×2 区域，或把页面其他 card 布局误认成目标区域。正确验证顺序是：
  1. **必须先** `curl -s https://raw.githubusercontent.com/ccwq/infocard-pub/<sha>/docs/<slug>.html | grep "目标字符串"` —— 源码验证优先于一切
  2. GitHub Pages CDN 更新后（延迟 30-120s）再用 `browser_vision` 截图
  3. 如果源码确认已改但视觉模型说"还有"，判定为误判，不重做
  不依赖"截图里看起来如何"来判断代码是否正确——源码对比才是最终依据。

- **Post-rebuild data completeness pitfall (2026-06-10)**：rebuild 过程中最常见的错误不是换色，而是**信息在重建时被遗漏或排序被打乱**。典型场景：12 个样本卡重建后，其中一张的日期排序不对（视觉模型在截图里发现 2021-06-15 排在了 2022 年的条目后面）。防范方法：rebuild 完成后，用源码级检查（grep/count ODI编号/日期/关键字符串）确认所有原始数据都在位，再用 `browser_vision` 确认视觉顺序与预期一致。不要在只有截图验收的情况下宣布 rebuild 完成。

- **Chronological ordering pitfall (2026-06-10)**：当 rebuild 涉及按时间排列的样本/事件列表时，视觉 grid 顺序必须与时间顺序严格对应——不能按"车型"或"年款"分组后再按时间排，而要把所有条目放在一起统一按时间升序排后再切 grid 行。检查方法：rebuild 后 `grep -o 'ODI [0-9]*\|YYYY-MM-DD'` 提取所有关键标识，排序后确认顺序符合预期。

- **Existing card rebuild — index files may not change (2026-06-10)**：当 rebuild 的卡已经在索引里（存量卡），且没有新增 meta.yaml 字段时，`npm run build` 会显示 "SKIP unchanged: 195"，`_index.yaml` 和 `index.html` 不会变化。此时只需要 commit 那个 HTML 文件即可，不需要 commit 索引文件。判断标准：`git diff --stat _index.yaml index.html` 输出为空即代表索引未变。

- **mcp-forge theme is not limited to protocol gateway cards (2026-06-10)**：mcp-forge 的暖米纸 + 深色控制台 + 协议彩色节点风格，适用于**任何需要左右分栏 + 中央汇总 + 右侧信息 rail 的高密度信息卡**，包括但不限于：调查报告（多案例/多来源）、技术对比分析、多维度评测总览。用户说"用 mcp-forge"时，优先按主题的 CSS token 系统重建整卡，而不是保留旧卡结构只换皮肤。
If the user says "rebuild", do not stop at code changes: verify the rendered result.
If the user says "insert 1 image", the image count in the output must be exactly 1.

## Content handling rules

- Preserve factual scope; do not silently drop sections.
- If you compress, do so only with explicit user agreement.
- If a section is weak or bug-prone, prefer structural replacement over piecemeal patching.
- If the user wants a body module removed but not forgotten, relocate its key data into header meta pills or stats first, then delete the redundant block.
- For header compacting requests, reduce the meta block's wrapper spacing structurally so the pills sit closer to the viewport edge.
- For repository cards, keep repo facts and workflow details separate from opinionated analysis.
- For technical-analysis cards, keep evidence and interpretation separate.
- For X / social-post infocards, prefer **high-density expansion** over thin summaries: include author, date, engagement, core thesis, notable examples, and a clear take on why it matters.
- If the user says a card is "rough" or asks to "expand" / "add data", preserve the chapter skeleton but make the content richer, denser, and more explanatory instead of stopping at a thin summary.
- If a social post includes an image, treat the image as first-class content: analyze it, describe the visible UI/details, and keep the image embedded in the card when publishing.
- See `references/x-post-card-playbook.md` for the extraction and density workflow learned from this session.
- `references/2026-06-10-toyota-cruise-rebuild-and-mcp-forge-for-investigation.md` — 调查稿 mcp-forge 重建案例：12个样本完整保留、时间排序验证、NHTSA API 绕过、存量卡 rebuild 索引判断。
- `references/2026-07-08-hardblue-from-scratch-rebuild-lesson.md` — hardblue vs darkblue rebuild 区别：两种主题的 CSS 骨架完整对照。**2026-07-08 session 教训：hardblue 重建必须从 `theme/hardblue.html` 完整读取 CSS 后从零构建，不能在旧布局上打补丁。**
- `references/rebuild-vs-expansion.md` for the strict rebuild/expand distinction and verification rules.
- See `references/2026-06-03-neo-mirai-skillopt-mobile-repair.md` for the session pattern: source image selection, local asset solidification, exact image count, and the mobile stats/header recovery sequence.
- `references/codegraph-benchmark-grid-pattern.md` for the pattern: per-language performance numbers → `grid2` with `.item` list, NOT `<table>`. Table overflows at 390px mobile viewport.
- `references/open-design-repo-tech-analysis.md` for a concrete README-heavy repo analysis pattern: capability stack → workflow chain → artifact types → compatibility → quick start → boundary.
- For **config-framework repos** (dotfiles, oh-my-zsh, prezto, oh-my-tmux, neovim distros), the default chapter order is different: identity → vs-bare-tool comparison → core features grid → install paths → uninstall/restore → primary keybindings → secondary keybindings + plugin-manager differences → tunable variables + troubleshooting. The full pattern lives in `infocard-pub-publisher`'s `references/dotfile-config-framework-card-pattern.md`; load that when the repo wraps another tool via a symlinked main config + `.local` override + install script.
- **Tool/product infocard completeness rule (2026-06-23)**：当信息卡的对象是一个**工具或产品**（尤其是从 GitHub 仓库创建的），卡内必须包含一个"系统支持与配置"段落，至少覆盖以下 4 项：
  1. **平台支持**：当前正式支持哪些平台，哪些在路线图上（明确区分"可用"与"计划中"）
  2. **安装方式**：至少 2 种安装路径（如下载 App / npm / CLI）
  3. **配置要求**：是否需要 API key、依赖什么上游服务、最小环境要求
  4. **卸载方式**：如何完整卸载（App + Skill/插件 分离卸载）
  用户原话："缺乏系统支持度信息。比如如何安装，如何支持Windows，如何配置，需不需要配置apikey等等等等"。这个纠正说明：只覆盖特性和安装步骤是不够的，用户期望看到完整的"落地条件"——能不能用、怎么配、需不需要额外凭证、怎么卸。用 `route-list` 或 `note` 组件承载这段内容。
- **Wikimedia image download failure pattern (2026-06-23)**：Wikimedia (`upload.wikimedia.org`) 会拒绝直接 curl 下载图片（返回 HTML 错误页而非 PNG/SVG），即使用 `--max-time 30 -A "Mozilla/5.0"` 也无效。**回退方案**：自绘一个主题风格匹配的 SVG 插图嵌入仓库 `docs/assets/<slug>/`。优势：(1) 无外链依赖，(2) 风格与信息卡主题一致（如 pixelstack 的像素风、handline 的手绘风），(3) 文件更小。自绘 SVG 时注意：写 `<title>` 和 `<desc>` 标签做无障碍说明，caption 要准确描述"示意图"而非"渲染结果"。
- **Random theme re-roll pattern (2026-06-23)**：当用户说"主题随机/任意"时，用 `shuf -n 1` 从 `theme/` 目录的 .html 文件中随机抽取。但如果抽到的主题明显不适合内容类型（如 Q 版贴纸风用于密集产品发布卡），应从适配池中 re-roll。适配参考：产品发布/技术手册 → blue/darkblue/hardblue/redswiss/main；科普/概念 → pixelstack/graph-paper/handline；方法论/策略 → wood/handline/white-purple。排除最近 3 天用过的主题以保持多样性。
- **Responsive grid overflow pattern (2026-07-07)**：布局错乱的常见根因是多列网格（3列/4列/5列）在窄屏下未定义回退规则。典型症状：卡片被裁切、横向溢出、hero 双栏在小屏断裂。修复方法：
  1. 宽度限制：`max-width: 960px`（标准信息卡断点），不能用 `1180px` 或更大
  2. 多列网格必须配媒体查询：`@media(max-width: 720px){ .grid { grid-template-columns: 1fr } }`
  3. 移除 hero 双栏布局，改用单栏 stats 行内展示
  4. hardblue/main-style 主题自带这些约束；自定义 CSS 卡片容易忽略
  案例：`docs/20260707-ai-engineering-field-guide.html` 原版 1180px + 无响应式 → 重建后 960px + 响应式网格，正常显示。

- **SVG pipeline diagram as hero visual (2026-06-23)**：当工具/产品有清晰的"输入→处理→输出"流水线时（如 StemDeck 的 音频输入→Demucs 分轨→6 轨→混音器→导出），在 hero 区放一个 SVG 流程图比放截图或 logo 更有信息量。graph-paper 主题的 node/edge SVG 渲染天然适合这个模式。原则：(1) 节点用 hot/dim 区分主流程和辅助步骤，(2) 边用 dashed line 标注关键路径，(3) 节点文字用 mono font 保持技术感。Canonical reference: `docs/20260623-stemdeck.html`（graph-paper 主题）。
- **Preserve honest comparison tables from source (2026-06-23)**：当 README 包含诚实的竞品对比表（承认工具自身劣势，如"无移动端"、"质量通常更低"），保留它原样进卡，不要美化或删除劣势行。这种表帮读者做知情选择，是信任信号而非弱点。典型结构：维度 × [本工具] × [竞品]，用 check/cross 标注。Canonical reference: `docs/20260623-stemdeck.html` 的"StemDeck vs 商业分轨服务"11 行对比表。

## Recommended workflow

1. Classify the infocard type (open-source repo vs technical analysis).
2. Grill the user for up to 3 rounds (only if request is underspecified).
3. Freeze chapter skeleton and visual style.
4. Build the HTML/CSS from scratch (not patch the old layout).
5. If publishing, handle git push conflicts via:
   ```
   git fetch origin main && git rebase origin/main
   # if conflict in _index.yaml: rebuild index, git add, GIT_EDITOR=true git rebase --continue
   ```
6. Verify rendered content on desktop and mobile via `--browser` flag.
7. Verify the live public URL is reachable (HTTP 200).
8. Confirm worktree is clean.

## Git conflict pattern (infocard-pub specific)

When pushing to `infocard-pub` and the remote has new commits (common because `index.yml` workflow auto-commits `_index.yaml`):

```
git fetch origin main && git rebase origin/main
# if _index.yaml conflicts:
python scripts/rebuild_index.py && git add _index.yaml && GIT_EDITOR=true git rebase --continue
git push
```

Do not use `--no-rebase` or merge — rebase keeps history clean. GIT_EDITOR=true skips the editor prompt during rebase continue.

## Rebuild checklist

- [ ] title and subtitle match the subject
- [ ] the card reads dense but not cramped
- [ ] metadata blocks are visually balanced
- [ ] section titles are consistent
- [ ] no legacy layout artifacts remain
- [ ] **all source identifiers present in rebuilt HTML** (e.g. all 12 ODI numbers, all original dates, all key strings — grep before declaring done)
- [ ] **chronological order verified** if the card contains ordered samples/cases (extract all date/identifier strings and sort to confirm)
- [ ] mobile 390px view is checked
- [ ] public deployment is verified if applicable

## Good defaults

When the user does not specify otherwise:
- prefer high-density over airy
- prefer explicit sectioning over narrative blur
- prefer structural rebuild over visual patching
- prefer exact verification over “looks okay”
- preserve the user’s requested chapter order and UI language

## Final reminder

This skill exists to stop a common failure mode: “I added content, therefore I rebuilt.”

## Rebuild: full write_file, never patch

When "重建" is triggered, **always use write_file to produce the complete HTML**, never patch. patch modifies structural indentation and nesting unpredictably on large HTML files, causing layout corruption. Confirmed in archify darkblue rebuild (2026-07-10): a targeted patch disrupted the twin-image hero section indentation, requiring full HTML rewrite to fix.

Correct rebuild workflow:
1. Collect data + images in parallel (git clone, GitHub API, copy assets)
2. **write_file the complete HTML from scratch** (not patch)
3. write_file meta.yaml
4. npm run build && git add && commit && push
5. HTTP verification
6. git rm old card (docs/<old-slug>.html + .meta.yaml)
7. commit deletion + push
8. Wiki sync

## Rebuild: darkblue theme — full CSS skeleton required

When the user says "重建" for a darkblue-style card (e.g. last30days-skill, harness-self-improv), do NOT patch the old layout. Write the complete HTML from scratch using the full darkblue CSS system.

Darkblue CSS system (copied verbatim from `theme/darkblue.html`):
```css
:root{
  --bg:#0c1020; --bg-2:#11162a; --panel:#171c2b; --panel-2:#0f1424;
  --ink:#eef4ff; --muted:#a8b7df; --line:rgba(255,255,255,.12);
  --cyan:#58c3ff; --blue:#4a78ff; --green:#2db36a; --yellow:#f4c84c; --purple:#8459ff;
  --shadow:0 18px 42px rgba(0,0,0,.34);
}
/* Hero: .hero / .hero-copy / .kicker / .badge-row / .badge / .badge.blue|green|purple|hot / .alert / .flow */
.hero{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(280px,.92fr);gap:14px}
.hero-copy{min-width:0;display:grid;gap:10px;align-content:start;padding:12px 0 0}
/* Sections: .section / .section-label / h2 / .section-body */
.section-label{font:900 11px/1 ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--cyan);margin-bottom:8px}
h2{font-size:clamp(18px,3vw,28px);font-weight:950;letter-spacing:-.03em;margin:0 0 10px;line-height:1.15}
.section-body{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}
/* Cards: .grid-2|.grid-3|.grid-4 / .card */
.grid-2,.grid-3,.grid-4{display:grid;gap:10px}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.card{border:1px solid var(--line);background:var(--panel-2);border-radius:10px;padding:13px;display:grid;gap:7px}
/* Table: .tbl */
.tbl{width:100%;border-collapse:collapse;font-size:13px;border-radius:10px;overflow:hidden}
.tbl th{padding:10px 13px;background:var(--bg-2);border-bottom:1px solid var(--line);text-align:left;font:900 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.tbl td{padding:10px 13px;border-bottom:1px solid var(--line);color:var(--ink);font-size:12.5px;line-height:1.6;vertical-align:top}
/* Footer: .footer */
.footer{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center}
/* Mobile */
@media(max-width:760px){
  .hero{grid-template-columns:1fr}
  .grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
  .footer{grid-template-columns:1fr}
}
```

Do NOT use the old panel+grid3+wide hybrid layout for darkblue cards. Use section+grid-N throughout.

## Support files
- `references/infocard-content-insertion-position.md` — 内容扩充时的插入位置规范：默认插入"前面"（step-grid 后 PAGE 01 前），不插 footer；PAGE 编号从 05 而非 01 开始；日期更新规则。**2026-07-08 用户明确纠正：内容应插前面而非 footer。**
- `references/infocard-pub-git-stash-recovery.md` — infocard-pub 仓库 git stash/pull/rebase 混乱状态的恢复步骤：先 abort rebase → checkout -- . → clean untracked → pull ff → 重新 patch。**2026-07-08 本次 session 教训：修改已发布卡不需要 stash，直接 pull 后改 HTML 再 push。**
- `references/github-repo-readme-extraction-pattern.md` — GitHub README 多段提取模式：分片提取大 README（>10K 字符）、知识卡章节模板、meta.yaml 字段规范、`updated` 字段防 CI verify 失败模式。
- `references/2026-06-03-orphan-card-index-entry-handling.md` — 孤儿索引条目诊断与处理流程：页面 404 时先确认文件是否存在，再判断修图片还是清索引，不要误判。
- `references/2026-06-03-cheatsheet-template-body-lock-bug.md` — cheatsheet-generate 输出 HTML 的 `width:389px` body 锁定 bug 检测、根因、修复方法。**凡是用 cheatsheet 源文件生成的 infocard 必须重写全套 CSS，不能只修 body 宽度。**
- `references/2026-06-03-infocard-pub-rebuild-optimization.md`
That is not a rebuild.