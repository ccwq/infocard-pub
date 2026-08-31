---
name: infocard-publish-sop
description: Use when creating or publishing an infocard through the mandatory .docs-to-promotion workflow.
version: 4.3.0
---

# Infocard Publish SOP: `.docs` → Promotion → Main Checkout

## Non-negotiable workspace boundary

All information-card work uses the primary `infocard-pub` checkout. The only valid lifecycle is:

```text
Read-only research
→ .docs/<run-id>/<slug>/ authoring candidate, facts, evidence, assets, promotion-manifest.json
→ Publisher validates and promotes declared files into docs/ and assets/
→ local visual gate
→ build / verify / taxonomy / leak checks in primary checkout
→ narrow stage / commit / non-force push from primary checkout
→ cache-busted public HTTP, index, and visual recheck
```

Forbidden for every infocard run:

- `git worktree add/remove/prune`, any worktree reuse, detached HEAD, branch handoff, or temporary clone;
- any temporary information-card repository root;
- force-pushing main;
- Author writes to `docs/`, `assets/`, generated indexes, or Git state;
- ordinary publishing triggering inventory, removal, cleanup, reset, stash, or clean of historical worktrees.

Existing worktrees and `/tmp` artifacts are a separate inventory/cleanup concern and require separate explicit authorization. A dirty primary checkout is ambient state to record and exclude, not a reason to create an alternate checkout.

## Route

Use the light route only when there is one card, one complete primary source/user brief, no sensitive claim/risk trigger, no multi-source reconciliation requirement, and no shared batch. Otherwise use the full route with bounded Research A and, only when needed, Research B.

Creation-and-publication authorization authorizes this whole release chain unless the user explicitly requests draft-only or preview-only work. It does not authorize installing or configuring the subject tool.

### Light-route 20-minute SLA

普通单来源、低风险、单卡整理使用 `scripts/lib/infocard-route.js` 判定。其目标为 15–18 分钟，墙钟硬上限为 20 分钟；预算与 hard-stop 由 `scripts/lib/infocard-light-route.js` 固定。超过范围必须升级 full route，不得通过跳过视觉、manifest、build/verify 或公网复核来满足 SLA。

Light route 的 static gates 必须绑定当前卡片：`node scripts/verify-taxonomy.js docs/<slug>.html.meta.yaml`、`node scripts/check-info-leak.js docs/<slug>.html` 和 `npm run verify:visual-gate -- docs/<slug>.html`。不要在普通单卡路径中调用 `--all`、全量 `fix-taxonomy` 或全仓历史 leak 阻断扫描。

`.stop.jsonl` 诊断记录使用 schema v2：`run_start` 不计阶段时间；research、promotion、visual_capture、visual_review、deployment_wait 和 repair 分开记录；SLA 以 wall clock 为准。

实际 light-route 编排入口为 `npm run run:light-route -- --config <run.json>`。配置必须声明 `runId`、`request`、`preflight.authoringDir`、正式 `htmlPath`，以及需要外部工具完成的 `stageCommands`；截图阶段会收到 `INFOCARD_CAPTURE_PLAN_PATH/JSON`。仅在诊断需要时设置 `diagnosticsPath`，否则不得每次创建 `.stop.jsonl`。编排器使用单调时钟执行阶段预算、定向 static gates 和 20 分钟 hard-stop，并写入四种允许终态之一。

## Roles

### Research

Research produces first-party facts, source boundaries, time-sensitive snapshots, claim verdicts, and evidence gaps. It does not write formal card files, create workspaces, build, commit, push, or publish.

### Author

Author writes only under `.docs/<run-id>/<slug>/`:

```text
card.html
card.html.meta.yaml
facts.json or research.md
theme-decision.json
promotion-manifest.json
visual/
assets/ (only declared assets)
```

The Author must not directly write formal `docs/` or `assets/`, generated indexes, Git state, or `/tmp` files. It does not build, commit, push, or start Wiki sync.

### Publisher

Publisher owns manifest validation, exact promotion, visual gate, build, static gates, narrow Git staging, commit/push, public verification, and closeout. It operates only in the primary checkout.

## Bundle, sidecar, and manifest

Before authoring, create `.docs/<run-id>/<slug>/promotion-manifest.json`. A `publish-bundle.json` is optional process evidence unless a concrete Publisher/audit command requires it; it is not a second promotion authority.

Manifest requirements:

- every source is relative to the authoring directory;
- every target is repository-relative and only under `docs/` or `assets/`;
- reject absolute paths, `..`, duplicate targets, missing sources, undeclared assets, screenshots, bundles, process files, secrets, and generated indexes;
- never promote `_index.yaml` or `index.html` from `.docs`.

Every formal sidecar is one YAML mapping containing at least:

```text
slug, path, category, title, desc, date, updated, tags,
author, source, source_url, style
```

`path` must exactly equal the manifest HTML target. `date` and `updated` use quoted `YYYY-MM-DD HH:MM:SS`; Publisher sets final promotion time. Theme evidence must be the validated `.docs/<run-id>/<slug>/theme-decision.json` produced by `infocard-theme-assignment` before candidate HTML is written. The selected theme is a complete template from `theme/themes.json`; `theme/*.html` must not be referenced as a stylesheet. Theme selection and visual-evidence details are owned by `infocard-theme-assignment` and `visual-verification-gate`; this SOP only composes those gates. This SOP never generates candidates, ranks themes, or makes a second theme decision. Author delegation is blocked unless that decision exists; delegation context must not hard-code or preselect a concrete theme.

## Promotion

1. Record `git status --short` in the primary checkout and preserve all ambient changes.
2. Validate bundle, manifest, source paths, target paths, sidecars, theme agreement, and artifact allowlist.
3. Copy only manifest-declared HTML, sidecars, and assets into formal `docs/` and `assets/` targets.
4. Inspect the exact promotion diff and record source/target hashes in the bundle.
5. Do not promote a whole authoring directory or undeclared files.

For a batch, validate all manifests first, promote all declared artifacts, then build once in the same primary checkout.

## Required visual gate before build / commit / push

After promotion, before build:

1. render exact formal `docs/<slug>.html` locally;
2. capture desktop and 390px mobile evidence by delegating to `web-capture` (which uses the runtime-provided `agent-browser` endpoint), including all relevant hero/body/table/code/risk/footer regions;
   - Call `web-capture` with the target tab / URL and the `pc` or `mobile` preset
   - `web-capture` returns screenshot paths and geometry checks
   - **Do NOT embed `browser_exec` built-in `cdp()` screenshot logic here** — route all web screenshots through `web-capture`
3. record explicit `critical / major / minor` findings and bind screenshot manifest to current HTML SHA-256;
4. run `npm run verify:visual-gate -- docs/<slug>.html`;
5. repair and recapture after every HTML/CSS/content/structure change;
6. block commit/push on any critical or major defect.

Infrastructure-only capture or visual-review failure must be recorded according to `visual-verification-gate`, with an explicit `evidence_gap`, error category, and outcome. It is never visual pass, and must not fabricate screenshots or dispositions.

### Visual exceptions

All `VISUAL_EXCEPTION_AFTER_MAX_REPAIRS` rules, attempt counting, repair-round schema, and final wording are owned by `visual-verification-gate`. This SOP only requires that the Publisher consume its result; do not duplicate or reinterpret that schema here.

## Main-checkout gates and release

**Execution evidence**: use exit codes plus independent file/index/hash checks; do not treat truncated stdout, a child-agent summary, or a single status code as the release result.

Run, in the primary checkout:

```bash
npm run build
# OUT-OF-BAND: curl -s _index.yaml | python3 -c "import yaml,sys; d=yaml.safe_load(sys.stdin); print('cards:', len(d['cards']))"

npm run verify
# OUT-OF-BAND: echo $? == 0

npm run fix-taxonomy
# OUT-OF-BAND: npm run verify-taxonomy && echo $? == 0

npm run check-leak
# OUT-OF-BAND: echo $? == 0
```

Then inspect every mutation. Stage only promoted artifacts, declared assets, current visual evidence, `_index.yaml`, and `index.html`; never use `git add -A`.

If remote main advances, reconcile once in the same primary checkout, regenerate affected indexes and visual evidence, then retry non-force push. A second integration failure is `BLOCKED_AT_INTEGRATION`.

Public verification requires cache-busted checks for:

```text
https://ccwq.github.io/infocard-pub/docs/<slug>.html
/_index.yaml
/index.html
```

Verify expected identity and release-specific fingerprint, then capture fresh public desktop/mobile evidence. HTTP 200 alone is not release proof.

## Update, rebuild, and timeout recovery

- New card vs update is decided before authoring through `infocard-update-vs-new-pattern`.
- Theme changes rebuild a `.docs` candidate around the selected theme skeleton, preserve required content, then promote through the same gate.
- Author timeout means inspect the declared `.docs/<run-id>/<slug>/` handoff. Continue valid artifacts or complete that directory; never search for or create a worktree.
- Build/sidecar failure gets one targeted repair and full gate rerun. Second failure is `BLOCKED_AT_LOCAL_GATE`.

## Closeout

Retain `.docs/<run-id>/<slug>/`. Report route, authoring path, manifest mappings, local build/static state, local visual state, content commit, public HTTP/index state, public visual state, and only terminal exceptions.

Do not start Wiki automatically. Do not list, prune, remove, or otherwise operate historical worktrees in ordinary closeout.

## Acceptance checklist

- [ ] No worktree, clone, detached HEAD, `/tmp/infocard*`, or force push used
- [ ] Author wrote only `.docs/<run-id>/<slug>/`
- [ ] Manifest validates source-to-target allowlist
- [ ] Promotion diff contains only declared formal artifacts
- [ ] Desktop/mobile visual evidence captured with `runtime-configured agent-browser` and has 0 critical / 0 major
- [ ] Build, verify, taxonomy, and leak gates pass
- [ ] Staged diff excludes ambient state
- [ ] Public detail/index/home fingerprint and fresh visual evidence pass
- [ ] `.docs` evidence retained; no cleanup side effect occurred

## Canonical references

- `references/publish-protocol-v3.md` — detailed release fields, states, and ownership.
- `../visual-verification-gate/SKILL.md` — screenshot, visual disposition, retry, and exception rules.
- `../infocard/infocard-theme-assignment/SKILL.md` — theme selection and decision-record rules.

Historical worktree incident notes may be retained only for a separately authorized migration/cleanup investigation. They are not active publication instructions and must never be loaded to create, recover, publish, or clean a new information card.
