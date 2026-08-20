---
name: infocard-authoring-workflow
description: "Light-route single-card authoring without subagent."
category: infocard
tags: [infocard, authoring, light-route, python, template-clone]
---

# infocard-authoring-workflow · Light-Route Direct Authoring

## When to use this skill

Trigger: publishing a single infocard where you have full content and no multi-source cross-validation is needed. Specifically:

- User gave a URL with content → light route
- Subagent delegation failed (Token Plan 429) → fallback to this workflow
- Single-source research card with clear content → prefer this over subagent

**Do NOT use** when: multi-source cross-validation needed, content is ambiguous, user explicitly requested subagent parallel authoring, or research scope exceeds main-thread context.

### Solvable social-source ambiguity is not an automatic pause

When a social post contains a recommendation plus an image/screenshot but omits the canonical project or book name, do not immediately ask the user to choose among every superficially similar search result. First run a bounded first-party matching check using distinctive OCR and structural fingerprints: chapter names, item counts, code-line/read-time figures, author identity, README outline, and public reading links.

If one candidate has a strong multi-signal match, proceed with an explicit attribution boundary in the bundle and card copy, for example: “原帖未点名；根据配图 OCR 与公开 README 交叉匹配，本文聚焦该项目（高置信度）。” Keep the social post's exact wording separate from the matched project's first-party facts, and list rejected candidates only in internal research notes unless the user asked for a comparison.

Ask one clarification question only if the bounded match remains materially uncertain or choosing among candidates would change the requested artifact. Existing explicit “创建/发布” authorization remains valid through a solvable attribution gap; do not reset it merely because the source post is terse.

This pattern is documented for reuse in `references/social-source-attribution-matching.md`.

## Recovery takeover gate (when session context is lost)

When a user asks to find and take over unfinished cards from disk, do not count bundles or HTML files as published-work units. First inventory all run bundles, declared worktrees, registered Git worktrees/branches, integration worktrees, and remote/public evidence. Classify each candidate as `制作中待发布`, `已发布待审计`, `历史残留/不可直接接管`, or `环境/仓库污染`; report counts from that classification before claiming takeover.

For a recovered batch, preserve the primary repository's dirty state as ambient residue. Create one fresh integration worktree from current `origin/main`, copy only declared card artifacts by allowlist, regenerate shared indexes once, and validate every card with the live bundle gate. Recovery bundles must contain canonical fields (`slug`, `html_path`, `meta_path`, `asset_dir`, `manifest_path`, `source_url`, `style`, `keywords`, `wiki`, and absolute `repository.root`). Normalize slugs to lowercase kebab-case and update bundle paths, HTML filenames, and sidecars together. A local commit is not proof of “待发布” until remote branch and public URL evidence are checked.

When `visual_review.required=true`, a screenshot result with any critical or major defect blocks release. A successful build, HTTP 200, or DOM check cannot be upgraded to visual pass. Keep the per-card `critical / major / minor` disposition in run-local evidence.

**User expectation for interrupted runs:** If the user says “继续 / go / 直到完成”, keep executing to a terminal state rather than returning a plan or pausing after discovery. If a hard visual gate blocks release, report the exact blocker and preserve the recovery worktree/evidence; do not call the batch complete.

**Visual disagreement rule:** A local `.table-scroll` wrapper and `scrollWidth == clientWidth` prove only page-level mechanical containment. They do not prove discoverability or visual readability. Dense tables need a visible mobile affordance (for example a short “横向滑动查看完整对比” cue or a partial next-column reveal), and multi-column cards need visible right-side padding/border. Re-screenshot after each repair. If vision still reports clipping while DOM checks pass, keep `VISUAL_PENDING` and do not push.

See `references/recovery-takeover-inventory.md` for the evidence matrix and recovery classification recipe.
See `references/chatgpt-url-to-infocard.md` for the verified workflow to extract infocard content from ChatGPT conversation URLs via `abc` — navigate, snapshot-parse table/cells/code blocks, and `abc screenshot` visual verification.
See `references/interrupted-batch-recovery.md` for the class-level recovery sequence and visual-gate disagreement handling.
See `references/github-api-workarounds.md` for GitHub API quirks and the reliable git-push pattern for this repo.
See `references/wechat-inline-body-compatibility.md` for the verified Handline-to-WeChat inline-body conversion and validator gate.
See `references/color-material-wechat-inline-recipe.md` for the Color Material editorial-to-WeChat natural-flow conversion, allowed-tag contract, leaf-marker audit, and deterministic static checks.
See `references/graph-paper-wechat-inline-recipe.md` for the graph-paper/manual strict-tag migration, independent allowlist scan, and the `<br>` to whitespace-leaf correction.
See `references/vscode-marketplace-card-build-notes.md` for the VS Code Marketplace / Open VSX marketplace-card workflow, provenance split, and build/commit notes from the 2026-08-15 card.

## Worktree-first authoring hard gate

All task artifacts must be written inside a fresh, task-specific Git worktree created from the current `origin/main`. This includes `research.md`, HTML, metadata, facts fixtures, screenshots, and audit files. Never write the research handoff into the primary checkout before the worktree exists.

## Repo-local skill placement

When the workflow belongs to one repository, prefer placing the skill inside the repo under `<repo>/.agents/skills/` so the project owns its own procedures. Hermes also recognizes `<repo>/.hermes/skills/`, but `.agents/skills/` is the clearer cross-tool convention when the repo may be used by more than one agent harness.

Key behavior:
- project-local skills are only active for sessions started inside that repo
- project-local skills override same-named global/local skills inside their home repo
- Hermes only loads them after the repo is trusted
- quarantined skills do not enter the index, even if present on disk

## Spec-first implementation

For repo-local skill rollout or skill-heavy repo work, do not jump straight from idea to file edits. First turn the current discussion into a spec with `to-spec`, then delegate implementation to a subagent that follows the spec and returns concrete changes plus verification evidence.

Use this sequence:
1. scope the repo-local skill or workflow boundary
2. write the spec first (`skill:to-spec`)
3. implement with a subagent
4. verify in the target repo before declaring the skill usable

This keeps project-specific workflows separate from the global skill library and makes later consolidation easier.

**Preflight is a write barrier, not a reminder:** do not call `write_file`, `patch`, `mkdir` under the repository, or copy research into `docs/` until the worktree path has been registered and `git -C <worktree> status --short --branch` has been verified. Keep any pre-worktree handoff under `/tmp/infocard-runs/<run-id>-handoff/` only.

**Recovery if a primary-checkout write already happened:** move the file—not copy it—to the run-local handoff directory; verify the primary checkout no longer contains task-specific paths; then create/attach the worktree and copy the handoff into it. Do not reset, stash, or repair unrelated primary-checkout state.

**Stale worktree path / pre-created branch:** if `git worktree add -b ...` fails because the directory already exists or the branch already exists, inspect both with `git worktree list --porcelain` and `git branch --list`. Move only the stale run directory aside, then attach the existing branch with `git worktree add <path> <existing-branch>`; do not delete or recreate the branch blindly.

**Primary checkout HEAD is not `main`:** if the primary checkout's `HEAD` is a named branch (e.g. `infocard/20260804-qm-agent`) or detached, `git worktree add -b <branch> origin/main <path>` fails with `fatal: invalid reference: origin/main` or `fatal: invalid reference: /absolute/path`. This is because `origin/main` is not the current branch. New publish worktrees must still use the fixed path from `node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <slug>` under os.tmpdir()/infocard-worktree. **Correct pattern:**

```bash
<<<<<<< HEAD
REPO="$(git rev-parse --show-toplevel)" || exit 1
=======
REPO="/home/ccwq/qbox/opendir/project/infocard-pub"
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf
WORKTREE="$(node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <slug> --plain)"
SHA="<sha>"

# Step 1: fetch the remote SHA
git -C "$REPO" fetch origin main --depth=1

# Step 2: get the SHA (either from fetch output or rev-parse)
git -C "$REPO" rev-parse origin/main

# Step 3: create detached-HEAD worktree (bypasses branch tracking entirely)
git -C "$REPO" worktree add --detach "$WORKTREE" "$SHA"

# Step 4: commit in worktree
git -C "$WORKTREE" add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git -C "$WORKTREE" commit -m "feat: publish <slug>"

# Step 5: push via detached HEAD refspec
git -C "$WORKTREE" push origin HEAD:refs/heads/main
```

Key points:
- `--detach` creates a worktree with no branch tracking — it does not matter what the primary checkout's HEAD is
- `origin/main` must be fetched first; `rev-parse origin/main` fails if the ref hasn't been fetched
- Push must use `HEAD:refs/heads/main` (not `<branch>:refs/heads/main`) because there is no named branch
- If the fixed temp root is low on space, stop at the capacity gate and request cleanup authorization; do not silently move the publish worktree to another directory.

**Verified 2026-08-12**: Primary checkout at `infocard/20260804-qm-agent`, `origin/main` not locally available → `worktree add -b` failed. `--detach` + `fetch` + `HEAD:refs/heads/main` succeeded.

**Verified lesson:** a repository can report a corrupt object in the primary checkout while `git fetch origin main` and a remote-based worktree still succeed. Treat the primary checkout problem as ambient and continue only in the healthy worktree; never write the card into the damaged checkout.

**Build/index staging order:** a new untracked sidecar may cause `verify-index.js` to report `path ... exists on disk, but not in HEAD`. This is expected before the first commit. Stage the new HTML, sidecar, research file, and generated `_index.yaml`/`index.html` before running the final `verify-index.js`; do not “fix” the repository by modifying unrelated historical metadata.

Required sequence:
1. Inspect the primary checkout read-only: `git status`, `git worktree list`, disk capacity, and remote state.
2. If a task file was accidentally created in the primary checkout, move it to a run-local handoff directory, verify the primary checkout is clean of task-specific residue, and only then continue.
3. `git fetch origin main`, record the fetched SHA, and create or reuse a registered worktree from that SHA.
4. Copy/write the research handoff only under the task worktree (or its run-local handoff directory before copying it into the worktree).
5. Run authoring, build, visual review, commit, and release operations from the task worktree.

If the primary checkout reports a corrupt or missing Git object, do not repair it in place or continue writing there. Fetch the remote and create the task worktree from a healthy remote commit; use a clean clone only if the remote-based worktree path is unavailable. Report the primary-checkout problem separately from the card result.

## Core workflow (6 steps)

### Step 1 · Template prep

**If worktree already exists** (user provides worktree path like `wt-ahe-harness-evolution`):
- Skip `git worktree add` entirely
- Skip `git branch` entirely
- Check existing docs/ directory directly: `ls wt-<slug>/docs/`
- If template file already exists in `wt-<slug>/theme/<style>.html`, copy from there
- If no template in worktree, copy from the active repository root: `cp "$REPO/theme/<style>.html" "wt-<slug>/docs/<slug>.html"`

**If no worktree exists**: follow the git worktree pattern in the template clone script.

### Theme selection (light-route lookup)

`infocard-publish-sop` is the single source of truth for theme assignment. Before writing HTML, classify the content form and apply its decision table.

**⚠️ Hard constraint: must use an actual theme from `theme/` — never fabricate custom CSS.** The theme decision is a structural requirement, not aesthetic preference. Custom CSS built from scratch will be rejected by the user (原话：「风格主题要靠近系统内置主题的其中一个，不是捏造」). If no built-in theme fits, default to `main`.

Quick lookup:
- single technical tool / CLI / executable implementation manual → `hardblue`
- multi-tool comparison, catalog, CLI ecosystem → `redswiss`
- AI architecture, Agent system, paradigm/methodology narrative → `darkblue`
- code graph, dependency or knowledge network → `graph-paper`
- tutorial / knowledge note → `blue-technical-manual` or `white-purple`
- **UI component / React library with live demo as core value** → `darkblue` + **去 mockup 原则**（见下方）
- unclear fit → `main` (not `hardblue` by default)

**Available themes** (check `theme/` at runtime — this list may be stale): `archive-green`, `bigwhite`, `black`, `blue`, `codex-notebook`, `color-material`, `crayon`, `darkblue`, `darkgreen`, `graph-paper`, `green`, `handline`, `hardblue`, `main`, `pixelstack`, `q`, `redswiss`, `sage-swiss`, `scrapbook`, `white-purple`, `wood`.

**Content depth guide ("内容不要吝啬")**: When user asks for practical-guide level:
- Expand comparison tables with full detail rows
- Add step-by-step operation guides (`.step-item` + `.step-n` numbered blocks)
- Include syntax-highlighted code blocks (dark `#1a1a2e` bg + color spans)
- Add known-issues / troubleshooting section
- Tool cards: install + config + CLI + JVM memory fix + PowerShell scripts
- Hardblue sections: `.section-head` + `.section-no` (96px red/blue/black blocks) + `.card` grid + `.risk` top-color stripes

### UI 组件库类卡片的 Hero 简化原则（darkblue 专用）

**触发**：卡片介绍一个有 Live Demo 的 UI 组件 / React 库，Live Demo 是核心价值。

**反模式**：Hero 右侧放置占一半高度的浏览器 mockup（Live Demo 截图）。被用户明确否定——截图≠真实动画，卡片变长但信息密度低，且截图与实际效果视觉不一致。

**正确结构**：
1. Hero 仅保留左侧：kicker + h1 + subtitle + badge row + **醒目蓝色 CTA 按钮**（不要放大浏览器 mockup）
2. CTA 示例：`<a class="cta" href="https://...live-demo...">↗ 体验 9 种动画</a>`
3. 9 个状态用 **紧凑 SVG 静态示意**（每 orb 一个 56×56 SVG）+ state name + 中文描述。**不要用占 Hero 一半高度的浏览器 mockup 截图**（用户明确否定："超长截图不应该存在，用一个最后占位抽象图来表示右侧"）
4. Footer 兜底 Live Demo 链接

**为什么 SVG 示意必须保留**：用户原话"所有的 svg 都消失了，也没有动画"——去掉 SVG 后只剩纯文字，信息密度反而比原来更低。正确做法是去掉 mockup 截图，保留紧凑 SVG 网格。

**CTA CSS 要点**：
```css
.cta {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--blue); color: #fff; font-size: 14px; font-weight: 700;
  padding: 11px 20px; border-radius: 6px;
  width: fit-content;   /* ← grid 1fr 下必须！否则占满整行 */
  box-shadow: 0 4px 16px rgba(74,120,255,.35);
}
```

**已验证案例**：`thinking-orbs`（1569 ★，MIT，React 18+ / Pure JS 出口）→ darkblue + 去 mockup + 紧凑 SVG 示意
- Commit `0865ecd` · 桌面 0/0/0，移动 0/0/1
- https://ccwq.github.io/infocard-pub/docs/20260805-thinking-orbs.html

**移动端截屏规范**：用 `--window-size=390,1500`（非 1800），能覆盖一屏信息卡完整内容又不截到页面底部空白。

```bash
google-chrome --headless=new --disable-gpu \
  --window-size=390,1500 \
  --screenshot=/tmp/card-mobile.png \
  "http://127.0.0.1:PORT/docs/<slug>.html"
```

Before HTML authoring, record `Content form`, `Primary theme`, `Alternative theme`, and `Rejection rationale`; then set HTML `data-theme` to the registered bare slug (for example `hardblue`), set canonical sidecar `style: infocard-hardblue-style`, and verify their normalized match, target tokens, and two structural signatures. This is a hard gate for new cards. For batches of three or more, an all-one-theme result needs the SOP's documented content-form/reader/evidence-density exemption.

## Mandatory theme gate (light-route)

在写任何 HTML 之前，你必须输出并保留这四行：

```
content_shape: <矩阵中的一行，如 single technical tool>
theme_primary: <注册主题名，如 hardblue>
theme_fallback: <备用主题>
theme_reject: <为什么排除了流行主题>
```

缺少任一行 = THEME_BLOCKED，停止并加载 infocard-theme-assignment skill。

然后在 meta.yaml 中记录 style 和 theme_reject 依据。

### Step 2 · Write HTML directly (preferred)

### Investigation dossier density gate

For a multi-source controversy or any card upgraded after feedback such as “内容空洞 / 充分调查 / 作为调查记者”, do not retain a thin fact-check skeleton. Build an investigation dossier with: a conclusion-led overview, a causally connected timeline, at least two attributable primary quotations/notices, a sourced scale-data block, ≥3 stakeholder positions, one legal/industry/comparable-case context, and a clearly separated evidence boundary.

A card fails this gate if it is mainly “confirmed / unverified” labels, if its timeline lacks actor-action-evidence detail, or if deleting most paragraphs leaves the conclusion unchanged. This gate governs content density; `wang-reporter-investigation-standard` remains the single source of truth for evidence traceability.

**Completion criterion:** each section adds an independently sourced fact, explanation, or bounded inference; no disputed claim is upgraded beyond its evidence tier.

**Method**: Use `write_file` directly — simpler and faster than Python scripts, works reliably for HTML content up to ~20KB. The 

**Metadata naming rule**: Name the sidecar exactly `<html-basename>.meta.yaml`, and set `slug` to the full date-prefixed basename used by the repository (for example, `20260729-alacritty`), not merely the project name. The build's metadata-shape pass treats a short slug as a warning and may block verification.

**Content discipline for tool cards**: Prefer claims that are directly supported by the project's README or official documentation. Treat live GitHub counts and benchmark numbers as time-sensitive; either date them, label them approximate, or omit them. Preserve the repository's own feature boundaries, especially when a deliberate omission (such as no built-in tabs) is part of the product's design.

### Model-router claim separation

For AI gateway, provider-switcher, or model-router cards, keep these layers separate in prose and comparison tables:

1. **account/login state** — OAuth cache or an account displayed by a client;
2. **catalog visibility** — a model listed in the client menu or model map;
3. **request route and billing** — the endpoint, credentials, protocol adapter, and upstream that actually receive the request.

Never infer layer 3 from layer 1 or 2. “Official account remains visible”, “model appears in `/model`”, and “OpenAI-compatible” are not proof of official subscription billing, endpoint success, or complete tool/streaming/image compatibility. State the route’s required endpoint, credential, protocol, and known capability limit; distinguish native protocol passthrough from conversion adapters.

**Completion criterion:** every routing advantage names its layer; catalog, OAuth, protocol conversion, local inference source, and billing claims each retain their own first-party evidence.

Python script approach remains as a fallback for very large content.

**If `write_file` is blocked for unsupported scripting reasons**:
- Switch to direct file tools instead of trying to force Python execution.
- Keep the content in a single write, then validate with the repo build.

**Template source priority** (worktree already exists scenario):
1. Check `wt-<slug>/docs/` — if docs already exist in the worktree, skip template clone entirely and write directly
2. Check `wt-<slug>/theme/<style>.html` for a local template; copy to `wt-<slug>/docs/<slug>.html` if found
3. Fall back to parent repo: `cp .../theme/<style>.html wt-<slug>/docs/<slug>.html`

**Python script fallback** (only needed for ~15KB+ content where direct write_file is risky):
```python
import re
path = 'wt-<slug>/docs/<slug>.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<title>infocard-darkblue-style 元素演示</title>',
                   '<title>Your Title Here</title>')

new_body = r'''...your HTML content...'''
html_new = re.sub(r'<main class="page">.*?</html>', new_body, html, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f:
    f.write(html_new)
print("OK:", len(html_new), "bytes")
```

Execute: `python3 /tmp/gen_<slug>.py`

### Step 3 · Write meta.yaml

**⚠️ 子智能体 meta.yaml 三大常见错误（需人工复核）**：
1. `---` 首尾符：子智能体有时在文件首尾各写一个 `---`，导致 YAML 被解析为多文档，报 `expected a single document in the stream, but found more` 而使 build 失败。**修复：删除全部 `---`，meta.yaml 必须只有一个文档**。
2. 缺 `style` 字段：子智能体有时遗漏 `style` 字段。**修复：补全 `style: <theme>`**。
3. `date` 填为内容原始日期而非发布时间：用户要求 `date` 为**发布时间**，不是内容来源的原始日期。**修复：统一填当天发布日**。

**Twitter/X 来源的额外字段**：
- `x_status_id`：X 帖子的数字 ID（如 `2081932972559855907`）
- `author`：格式为 `"yibie (@yibie)"`（显示名 + 括号内用户名）

**格式规则**：
- 文件首尾都不要有 `---`（js-yaml 会把 `---` 当成多文档分隔符，即使只有一处也会引发问题）
- No em-dash `—` in title/desc（导致 YAML 解析歧义）
- `path` field：双引号字符串 `"docs/<slug>.html"`
- `date` and `updated`：`"YYYY-MM-DD HH:MM:SS"` 格式（空格分隔，无 T，无时区后缀）；填**实际运行时 UTC 时间**：`date -u +"%Y-%m-%d %H:%M:%S"`
- `category`：用户指定值，非固定 "knowledge"；常见如 `工具推荐`、`knowledge` 等
- `slug`：默认无 YYYYMMDD 前缀（如 `agent-routing`）；用户指定加前缀则从用户
- Required: slug / title / desc / date / updated / tags / category / author / source / source_url / style / path

Correct template:
```yaml
slug: agent-routing
title: "agent-routing v1.3.0：Subagent 模型智能路由"
desc: "给 subagent 分配「最合适的模型」通常靠经验和运气。agent-routing 把这个决策变成可重复的 calibrate 流程——Haiku/Sonnet/Opus 三级路由 + per-agent effort level。"
date: "2026-07-28 23:10:42"
updated: "2026-07-28 23:10:42"
tags: ["agent-skills", "routing", "model-selection", "Claude-Code"]
category: 工具推荐
source: Twitter
source_url: "https://x.com/i/status/2081932972559855907"
author: "yibie (@yibie)"
x_status_id: "2081932972559855907"
style: infocard-hardblue-style
path: "docs/20260729-agent-routing.html"
```

### Build 后 meta.yaml 被 sync-build-timestamps 覆盖

`sync-build-timestamps` 在 build 时用 Shanghai 时区时间覆盖 `updated` 字段。**不要依赖 meta.yaml 中的 `updated` 作为实际发布时间**，以 build 输出日志中的 `build_ts` 为准。

典型 build 输出：
```
[build-site] build_ts=2026-07-29 07:11:50 Asia/Shanghai
[sync-build-timestamps] NEW docs/20260729-agent-routing.html.meta.yaml | date=updated=2026-07-29 07:11:50
```

### Commit 时不要 push

用户明确要求 **worktree 内 commit，不要 push**。push 由用户自行控制：
```bash
git add docs/20260729-agent-routing.html docs/20260729-agent-routing.html.meta.yaml
git commit -m "feat: publish agent-routing subagent model routing"
# git push ...   # 跳过，不要 push
```

### 仓库 URL 待核实的标注方式

当用户提供仓库 URL 但标注"需核实"时：
1. 在 `source_url` 字段保留原始 URL
2. 在 HTML 正文和 desc 中加 `(需核实)` 标注
3. 不要自行搜索核实（除非用户明确要求）

### Step 4 · Build or skip-build shortcut

```bash
cd wt-<slug> && npm run build
```

Expected: `wrote _index.yaml and injected index.html (N cards)`

If build fails with "single document in stream, but found more": check meta.yaml for trailing `---`, em-dash in fields, or multi-doc YAML.

**Skip-build shortcut (new card + index already correct):**

When ALL of the following are true, you can skip `npm run build` entirely:
- New HTML and meta.yaml are freshly written
- `_index.yaml` and `index.html` were already regenerated by a prior build (e.g. during draft validation)
- No other cards were modified in this session

Then go directly to Step 5 commit — the index is already correct.

**Build-vs-commit decision tree:**
1. Modified existing card HTML/meta → must run `npm run build` (regenerates index)
2. Brand new card, index stale → run `npm run build` then Step 5
3. Brand new card, index already correct from prior run → skip build, go straight to Step 5

### Step 5 · Commit（不要 push）

```bash
cd wt-<slug>
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish <title>"
# git push origin infocard/<slug>:main --force   # 不要 push！由用户自行控制
```

**Critical: stage new files BEFORE building, not after.**

If you write new files to disk and run `build-site.js` first (which internally does `git add .` + `git commit`), then try to `git add docs/<slug>.html docs/<slug>.meta.yaml` in the same terminal, `build-site.js` will fail because the files are already staged but its internal git commit conflicts.

Correct sequence for brand new cards:
```bash
# Option A: build handles everything (safe, recommended)
git add docs/<slug>.html docs/<slug>.html.meta.yaml  # stage FIRST
npm run build                                        # build regenerates index, commits
git push origin HEAD:main                           # push

# Option B: index already correct → skip build entirely
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish <slug>"
git push origin HEAD:main
```

**If build fails with staged-file conflict:**
```bash
# Files already staged, build-site.js can't commit — use staged files directly
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish <title>"
git push origin HEAD:main
```

### Step 6 · Verify + Cleanup

Wait ~80s for GitHub Pages deploy, then:
```bash
curl -sI --max-time 15 "https://ccwq.github.io/infocard-pub/docs/<slug>.html"
# Expect: HTTP/2 200
```

Retained worktree report:
```bash
npm run worktree:list -- --repo <repo>
```
Do not remove the worktree automatically. Tell the user: `如需清理可安全删除的历史 worktree，请回复：del-rm`. If the user replies exactly `del-rm`, re-scan and run `npm run worktree:cleanup -- --repo <repo> --confirm del-rm`; never use `--force`.

## Known pitfalls

## Content gate: every card/item that looks clickable MUST have a real href

**Symptom** (verified 2026-08-18 on `deepseek-harness-learning`): A resource-collection card displays 4 section cards + 12 sub-resource items, all visually styled as clickable cards, but zero have actual `<a href>` attributes. Total page links = 1 (Twitter attribution only). All section cards were `<a class="mini-card">` without href; all sub-resource items were plain `<div>`, not `<a>`.

**Root cause**: Authoring created dead `<a>` tags (no href attribute) and non-linked `<div>` elements that visually resemble links. Visual screenshot review cannot detect this — it requires structural HTML inspection.

**Detection (run before build/commit — `web_extract` strips href attributes, do not use it):**
```python
import subprocess, re
r = subprocess.run(['curl','-s','-L','--max-time','30',
    'https://ccwq.github.io/infocard-pub/docs/<slug>.html'],
    capture_output=True, text=True)
html = r.stdout

hrefs = re.findall(r'<a[^>]+href=["\']([^"\']+)["\']', html)
hrefs_external = [h for h in hrefs if h.startswith('http')]
print(f"Total links: {len(hrefs)}, External links: {len(hrefs_external)}")
print(f"External URLs: {hrefs_external}")

# Also check for dead <a> tags (class contains 'card'/'link' but no href)
dead_a = re.findall(r'<a[^>]+class="([^"]*(?:card|link)[^"]*)"[^>]*(?<!href)>', html)
print(f"Dead <a> (class=card but no href): {len(dead_a)}")
```

**Rule**: Every visually clickable resource item must be a real `<a href="URL">`. If a resource entry has no URL target, it must NOT be visually styled as a card or link — use a plain label instead.

**Fix pattern — convert `<article>` to `<a>`:**

```html
<!-- Before: dead <article> -->
<article class="flow-item cyan">
  <div class="t">🏠 GitHub 仓库</div>
  <div class="c">DeepSeek Harness 官方源代码仓库</div>
</article>

<!-- After: real <a> -->
<a class="flow-item cyan" href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">
  <div class="t">🏠 GitHub 仓库</div>
  <div class="c">DeepSeek Harness 官方源代码仓库</div>
</a>

<!-- Before: <article class="mini-card"> in hero-visual -->
<article class="mini-card">
  <div class="mini-icon cyan" aria-hidden="true"><svg>...</svg></div>
  <div class="label">Official</div>
  <div class="value">官方仓库</div>
  <div class="desc">源代码、README、示例、架构说明</div>
</article>

<!-- After: <a class="mini-card"> -->
<a class="mini-card" href="https://github.com/deepseek-ai/deepseek-harness" target="_blank" rel="noreferrer">
  <div class="mini-icon cyan" aria-hidden="true"><svg>...</svg></div>
  <div class="label">Official</div>
  <div class="value">官方仓库</div>
  <div class="desc">源代码、README、示例、架构说明</div>
</a>
```

**URL research workflow** (before authoring the HTML):
1. Web search for the official project URL (GitHub repo, docs site)
2. Web search for each sub-resource's doc path (README, guide, changelog, examples/)
3. Verify all URLs return HTTP 200 via `curl -sI --max-time 15 "URL" | head -1`
4. Map each visual resource item → its verified URL before writing HTML

**PASS**: links >= expected_resource_count AND dead_a == 0 → proceed to build.
**FAIL**: any dead `<a>` tag or link count < expected → repair HTML before push.

**⚠️ `web_extract` strips href attributes — never use it for link verification.** Always use `curl` + regex as shown above. `web_extract` is safe for extracting readable prose content, not for structural HTML inspection.

## Critical: patch stops on duplicate match in HTML files

**Symptom**: `patch` reports "duplicate" or "found 2 matches" but `read_file` still shows the wrong content. Subsequent patch calls keep returning "duplicate" and making no progress, even with different `old_string` values.

**Root cause**: When two elements share the same wrapping structure (e.g. two `<div class="feat">` blocks with identical class/label hierarchy), `patch` finds both and blocks. After the first successful patch on one element, both lines become identical — patch now sees the other element as a new duplicate and blocks again. The tool reports "1 files modified" on the first pass, but the second pass finds two identical instances and stops.

**Concrete case from 2026-08-06** (Exa Search API card): Both `/search` panel and `/contents` panel had a `<div class="feat">` with label "认证". After patching the `/search` panel correctly, both panels' lines became identical, so the next patch for the other element reported "duplicate" and changed nothing. 15+ patch attempts were made over ~30 minutes.

**Recovery patterns (in order of reliability)**:

1. **`replace_all=true` on a fully unique substring** — only when all instances need identical replacement:
   ```python
   patch(path=html, old_string='<div class="value">WRONG</div>',
         new_string='<div class="value">CORRECT</div>', replace_all=True)
   ```

2. **Widest unique context** — include surrounding lines that only exist around the target element:
   ```python
   # Patch the whole block including unique surrounding lines
   patch(path=html,
         old_string='''  <section class="shell">
     <div class="panel">
       <div class="panel-head"><span class="panel-kicker">POST /search</span></div>
       <div class="feat"><div class="label">端点</div><div class="value">https://api.exa.ai/search</div></div>
       <div class="feat"><div class="label">认证</div><div class="value">WRONG</div></div>''',  # ← only /search has this exact URL
         new_string='''  <section class="shell">
     <div class="panel">
       <div class="panel-head"><span class="panel-kicker">POST /search</span></div>
       <div class="feat"><div class="label">端点</div><div class="value">https://api.exa.ai/search</div></div>
       <div class="feat"><div class="label">认证</div><div class="value">CORRECT</div></div>''')
   ```

3. **Line-by-line Python replacement** (most reliable for HTML with near-identical div structures):
   ```python
   with open(path, 'r', encoding='utf-8') as f:
       lines = f.readlines()
   new_lines = []
   for line in lines:
       if 'WRONG_TEXT' in line:
           new_lines.append(line.replace('WRONG_TEXT', 'CORRECT_TEXT'))
       else:
           new_lines.append(line)
   with open(path, 'w', encoding='utf-8') as f:
       f.writelines(new_lines)
   ```

4. **Byte-level replacement for invisible character differences** — when text looks identical but Python can't find it:
   ```python
   with open(path, 'rb') as f:
       content = f.read()
   # Find by hex/byte pattern
   idx = content.find(b'AUTHORIZATION_SUBSTRING')
   chunk = content[idx:idx+50]
   print(chunk.hex())  # See exact bytes
   content = content.replace(b'OLD_BYTES', b'NEW_BYTES')
   with open(path, 'wb') as f:
       f.write(content)
   ```
   Use this when text appears in `repr()` output but `in` check returns False — indicates invisible Unicode or encoding differences.

**Rule**: After any `patch` that reports "duplicate", always `read_file` the affected lines to verify actual content. A "duplicate" block means nothing was changed. Don't trust "1 files modified" without confirmation.

**Prevention**: Before patching elements that may be duplicated in an HTML file, scan first:
```bash
grep -n 'class="feat"' docs/<slug>.html | grep '认证'
# If output shows 2 lines with same context → use Python line-by-line method
```

## Critical: worktree add failure → branch exists but files nested wrong

**Symptom**: `git worktree add -b <branch> <path>` fails with `fatal: invalid reference: /absolute/path/to/worktree-dir` even though the target directory exists and is empty.

**Root cause**: A prior `git worktree add` created the branch but failed partway through (timeout/interrupt), leaving:
1. The git branch registered (`git branch` shows it)
2. A partial worktree directory on disk (but NOT in `git worktree list`)
3. Subsequent attempts to add the same branch fail because the branch name is taken
4. Attempting to reuse the path interprets it as a branch name → "invalid reference"

**Correct diagnosis sequence**:
```bash
# 1. Is the branch registered?
git -C <repo> branch | grep <branch-name>

# 2. Is the worktree listed?
git -C <repo> worktree list | grep <worktree-path>

# 3. Is the directory empty or stale?
ls -la /path/to/worktree-dir/
```

**Safe fix — always check before worktree add**:
```bash
BRANCH="publish/<slug>-<date>"
WORKTREE="/path/to/wt-<slug>"

# Check if worktree already exists in git
if git -C "$REPO" worktree list | grep -q "$WORKTREE"; then
    echo "worktree already registered, skip add"
else
    # Check if directory exists (stale from failed attempt)
    if [ -d "$WORKTREE" ]; then
        # Is it tracked by git?
        if git -C "$REPO" branch | grep -q "$(basename $WORKTREE)"; then
            echo "Branch exists, directory is stale — skip add, use existing"
        else
            echo "Directory exists but no branch — remove dir then add"
            rm -rf "$WORKTREE"
            git -C "$REPO" worktree add -b "$BRANCH" origin/main "$WORKTREE"
        fi
    else
        # Clean slate — add normally
        git -C "$REPO" worktree add -b "$BRANCH" origin/main "$WORKTREE"
    fi
fi
```

**After a failed worktree add**: if files end up at `wt-X/wt-X/docs/` (nested), the worktree was partially created. Fix: commit from the correct parent directory, then push via `git push origin <branch>:refs/heads/main` (not via GitHub API).

## GitHub API merge fails → push branch directly to main

**Symptom**: GitHub REST API returns:
- `422 "No commits between main and <branch>"` — API thinks nothing changed
- `404 Not Found` on `/merges` endpoint
- `422 "nil is not an object"` on `/pulls` POST

**All these mean the same thing**: GitHub API doesn't want to handle this merge. The working alternative is git push:

```bash
# Push branch directly to main (bypasses PR review entirely)
git push origin <branch>:refs/heads/main

# If non-fast-forward, rebase first:
git fetch origin main && git rebase origin/main
git push origin <branch>:refs/heads/main
```

**Why this works**: `git push <remote> <local>:<remote>` forces a non-ff push to the target branch. GitHub Pages then redeploys. Never use GitHub REST API `/merges` or `/pulls` POST when `git push` is available.

## Nested worktree path bug

**Symptom**: Committed files appear at `wt-X/wt-X/docs/` instead of `docs/`. GitHub Pages 404s.

**Detection after the fact**:
```bash
git ls-tree --name-only <commit> | grep "^wt-"
# If you see wt-X/wt-X/ paths → nested bug
```

**Fix**:
```bash
# Copy files to correct location from parent repo
cp /tmp/card.html docs/<slug>.html
cp /tmp/card.meta.yaml docs/<slug>.meta.yaml
git add docs/<slug>.html docs/<slug>.meta.yaml
git commit -m "fix: move <slug> card to docs/"
git push origin <branch>:refs/heads/main
sleep 60 && curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

### Section number class: verify against deployed template, not the skill warning

The `theme/hardblue.html` template uses `.section-no` (96×96px grid cell with 3px border) as the numbered block inside `.section-head`. The CSS defines `.section-no` with a `display:grid; place-items:center` layout and color variants `.section-no.b` (blue) / `.section-no.k` (black). **This is the correct class — use it.**

The earlier skill warning about `.sec-no` was based on a different or outdated source. Always verify against `theme/<style>.html` directly before writing section numbers.

```css
/* ✅ ACTUAL: sec-no — used in every deployed hardblue card */
.sec-no{
  width:34px;height:34px;
  display:flex;align-items:center;justify:center;
  background:var(--black);color:#fff;
  font-size:13px;font-weight:900;
  border:1.5px solid var(--black);
  flex-shrink:0;box-shadow:var(--shadow-sm)
}

/* ❌ WRONG: section-no — does not exist in deployed HTML */
```

Always use `.sec-no` for section numbering. The hardblue SKILL.md's table entry for `section-no` is outdated.

### meta.yaml multi-doc parse failure
**Symptom**: `npm run build` throws `Error: Index build failed: expected a single document in the stream, but found more`

**Causes** (in order of frequency):
1. Trailing `---` at end of file → delete it
2. Em-dash `—` (U+2014) in title/desc → replace with `｜`
3. File missing trailing newline → add `\n`
4. Very long `style` attribute value in `path` field → use simpler quoted string

**Diagnosis**: `node -e "const yaml=require('./assets/home/vendor/js-yaml.min.js'); const d=require('fs').readFileSync('docs/<slug>.html.meta.yaml','utf8'); console.log(yaml.loadAll(d).length)"` — if count > 1, fix the above.

### Python heredoc timeout
**Symptom**: `python3 - <<'PY' ...` returns exit -1 with no output, or times out.

**Cause**: Content > ~15KB hits orchestrator command gate.

**Fix**: Use `write_file` directly for HTML content up to ~20KB — this is now the preferred method. Only fall back to the Python script approach for very large content.

### execute_code blocked in background/cron context

**Symptom**: `execute_code` returns error: "Cron jobs run without a user present to approve it."

**Cause**: `execute_code` runs arbitrary Python with tool access. When the calling context is a cron profile or background delegation, it is blocked.

**Fix**: Use `terminal` with inline Python via `python3 - <<'PY' ...` or `python3 -c "..."` instead. For file operations, use `write_file` / `patch` directly.

### Parallel multi-card publish → merge-to-main fast-forward trap

**Symptom**: 2+ cards published in 2+ separate worktrees. Each worktree's `git fetch origin main && git merge --no-edit origin/<branch> && git push origin HEAD:main` fails on the 2nd+ with `! [rejected] HEAD -> main (non-fast-forward)`.

**Root cause**: The first `git push origin HEAD:main` advances `origin/main`. Subsequent worktrees' `origin/main` were fetched before the first push — their merge base is now behind the new `origin/main`. Git refuses non-fast-forward.

**Wrong fixes**:
- `git merge --no-edit origin/main` → `fatal: refusing to merge unrelated histories`
- `git cherry-pick origin/<branch>` → merge conflicts in `_index.yaml` / `index.html` (generated build artifacts conflict)
- Sequential independent merges: still fails for all but the first worktree

**Correct pattern — consolidated single-worktree approach**:

When publishing 2+ cards simultaneously, do NOT merge each worktree independently. Instead:

1. Create ONE integration worktree:
   ```bash
   git fetch origin main --quiet
   git worktree add -b publish/integration-YYYYMMDD /tmp/infocard-integration origin/main
   ```

2. Copy all card files into it:
   ```bash
   cp /tmp/infocard-wrenai/docs/<slug1>.html docs/
   cp /tmp/infocard-librarian/docs/<slug2>.html docs/
   ```

3. ONE build, ONE commit, ONE push:
   ```bash
   cd /tmp/infocard-integration
   npm run build
   git add _index.yaml index.html docs/<slug1>.html docs/<slug2>.html ...
   git commit -m "feat: publish <slug1> + <slug2> cards"
   git push origin HEAD:main   # Only one push — no fast-forward conflict
   ```

4. Pages deploys once. Verify all URLs in one loop.

**Verified 2026-08-13**: WrenAI + Librarian + Awesome LLM Apps. 3 separate worktrees → 2nd/3rd merge rejected. Resolved by copying all 3 cards into one integration worktree (`/tmp/infocard-awesome-llm-v2`), one build, one commit (`5853de1`), one push. All 3 URLs returned HTTP 200 in first Pages poll.

### darkblue template title not replaced
The `theme/darkblue.html` template contains `<title>infocard-darkblue-style 元素演示</title>`. Always replace before the `re.sub`.

### Subagent timeout → main thread takes over (primary recovery path)

When a dispatched subagent times out (e.g. `Non-streaming API call timed out after 90s` or `API call failed after 3 retries`), **do NOT redispatch**. Take the task directly in the main thread. Use `write_file` for HTML (≤40KB, single write, no Python script needed) and `patch` for meta.yaml corrections.

**Step 1 · Diagnose what the subagent left behind**
```bash
# Check in the primary checkout docs/ (subagents often write to parent repo)
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
ls "$REPO_ROOT/docs/" | grep <slug>
# If meta.yaml exists but HTML is missing → partial state, fix it
# If both exist → just build + commit + push
```

**Step 2 · Handle partial state (most common: meta.yaml written, HTML missing)**
```python
# Read the existing meta.yaml to get slug/date/tags
with open('docs/<slug>.html.meta.yaml') as f:
    meta = yaml.safe_load(f)
slug = meta['slug']  # use existing slug, date, tags from subagent's meta.yaml
```

**Step 3 · Write HTML directly with write_file**
- Source the darkblue template CSS by reading `theme/darkblue.html` (lines 500–772 have the full deployed CSS)
- Write the complete HTML in one `write_file` call (≤40KB, reliable)
- Do NOT use Python heredoc or execute_code for HTML — `write_file` is faster and less error-prone
- After writing, fix meta.yaml field ordering/duplicates with `patch`

**Step 4 · Commit + push (no subagent re-dispatch)**
```bash
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: add <slug> infocard (YYYY-MM-DD)"
git push origin main   # direct push, no worktree merge dance needed
```

**Step 5 · Verify**
```python
import urllib.request, time
time.sleep(45)   # GitHub Actions + Pages deploy time
url = "https://ccwq.github.io/infocard-pub/docs/<slug>.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
content = resp.read().decode('utf-8', errors='replace')
checks = ['Tabbit', '上下文', 'GN06', 'Agent', '91.8']
for c in checks:
    print(f"  '{c}': {'✓' if c in content else '✗'}")
```

**Verified 2026-08-19**: Tabbit card. Subagent API timed out at 90s with `Non-streaming API call timed out after 90s`. Subagent left only `meta.yaml` (partial state). Main thread wrote complete 39KB HTML in one `write_file` call, patched meta.yaml, committed, pushed. HTTP 200 in ~45s.

**Rule**: Never redispatch a timed-out subagent. The main thread's direct tool access (write_file, patch) succeeds where subagents fail on infrastructure.

### CSS grid nesting overflow (mobile critical)

**Root cause**: A grid cell with `grid-column: span N` inside a parent grid becomes overflow when the parent grid's column count changes via `@media` query.

**Concrete case**: `agent-row` has `grid-template-columns: 1fr 1fr 1fr` (desktop 3 columns). A `model-card` has `style="grid-column:span 3"` (spans all 3). On mobile `@media(max-width:720px)`, `agent-row` becomes `grid-template-columns: 1fr 1fr` (2 columns). The `span 3` card now overflows because 3 > 2. Vision model reports "text overlap".

**Symptom**: Desktop looks fine. Mobile has severe element collision in the affected section.

**Solution — extract overflowing element as a sibling, not a child**:
```html
<!-- BROKEN: model-card is inside agent-row grid -->
<div class="agent-row">            <!-- 3 cols → 2 cols on mobile -->
  <div class="agent-card">Research Agent</div>
  <div class="agent-card">Biology Agent</div>
  <div class="agent-card">Physics Agent</div>
  <div class="agent-card" style="grid-column:span 2">ML Agent</div>
  <div class="model-card" style="grid-column:span 3">Providers...</div>
  <!--                        ^^^^^^^^^ overflow on mobile! -->
</div>

<!-- FIXED: model-row is OUTSIDE agent-row, as a sibling -->
<div class="panel-body">
  <div class="agent-row">   <!-- 3 cols → 2 cols on mobile, no overflow -->
    <div class="agent-card">Research Agent</div>
    <div class="agent-card">Biology Agent</div>
    <div class="agent-card">Physics Agent</div>
    <div class="agent-card">ML Agent</div>
  </div>
  <div class="model-row">
    <!-- flex-wrap, not grid — safe on any width -->
    <span>OpenAI</span><span>Anthropic</span><span>Google</span>...
  </div>
</div>
```

**CSS rule for extracted row**: Use `display:flex; flex-wrap:wrap; gap:6px` — never another nested grid.

**Rule**: Never put a `span` value inside a grid child that is larger than the grid's mobile column count. Always extract spanning elements as siblings.

**Mobile screenshot height**: Use `--window-size=390,2200` (not 1500) for full-length infocards. 2200 captures the complete card without cutting off the bottom.

<!-- MODIFIED 2026-08-19: 添加 light-route 强制主题门禁 -->
