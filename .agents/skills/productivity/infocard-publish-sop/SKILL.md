---
name: infocard-publish-sop
description: Use when creating or publishing an infocard through the mandatory .docs-to-promotion workflow.
version: 4.4.0
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

### Full-route 30-minute hard-stop

下列任一情况必须进入 full route：多源核验、敏感声明、复杂视觉、或高密度目录（显式 `highDensity=true`、超过 12 个分类、或超过 60 个条目）。full route 仍然有边界：墙钟硬上限 **30 分钟**，预算为研究 4 分钟、主题 1 分钟、authoring 6 分钟、Publisher 审计 3 分钟、promotion/static 4 分钟、build/verify 5 分钟、release/public 4 分钟，并保留 3 分钟缓冲。

超过研究预算立即停止继续搜索并 author；超过 authoring 预算立即停止子智能体并由 Publisher 做最小缺口接管；超过 30 分钟只能报告明确的 `BLOCKED_AT_*` 终态或执行已有产物的最小恢复，不得重新研究、重复派发同一 slug 或无限修复。

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

### Bounded Author delegation

同一 bare slug 同时只能有一个 Author 任务锁；第二个任务不得重派完整 authoring，而应读取已有目录并只恢复缺失阶段。协调器已经提供完整来源事实、主题、条目清单、路径和结构时，Author 只允许读取 `theme-decision.json`，然后立即写入五个声明文件；不得重复加载大 Skill、历史模板、历史 manifest 或再次搜索。60 秒没有任何声明文件写入时，协调器必须停止该子任务并直接接管。

子智能体模型必须在派发前通过运行时 provider 配置解析；provider/model 不可用属于立即失败，不得等待模型 400 后再重派。

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

### Timestamp and hash order (updated 2026-09-05)

**Root cause of prior failure**: The SOP previously said "Publisher sets final promotion time" but did not mandate calling the timestamp script before promotion. In update-card scenarios, the old `updated` field survived the build because it was never refreshed before the first promotion.

`npm run build` can refresh an existing card when its formal HTML/sidecar appears in the current diff, but this is implicit detection and cannot replace an update-card contract. The prior incident was more basic: the update authoring/promotion chain never completed, so no formal card change reached the build stage and the old sidecar remained untouched. The Publisher must explicitly call `npm run sync-publish-metadata` **before** promotion whenever updating an existing card, making the edit-date invariant independent of build heuristics.

Required sequence for update cards:

```text
1. node scripts/sync-publish-metadata.js --manifest .docs/<run-id>/<slug>/promotion-manifest.json --timestamp "YYYY-MM-DD HH:MM:SS"  # candidate only
2. node scripts/promote-infocard.js --manifest .docs/<run-id>/<slug>/promotion-manifest.json
3. npm run build
4. (optional) node scripts/verify-meta-timestamps.js
5. visual gate → verify → taxonomy → leak → commit/push
6. independently verify formal sidecar `updated` after build and after push
```

Required sequence for new cards (unchanged):

```text
1. node scripts/promote-infocard.js --manifest .docs/<run-id>/<slug>/promotion-manifest.json
2. npm run build  ← build sets date=updated automatically via sync-build-timestamps
3. copy final formal sidecar back to candidate directory
4. recompute manifest hashes
5. visual gate → verify → taxonomy → leak → commit/push
```

This is one bounded synchronization step. A hash mismatch after it is `BLOCKED_AT_LOCAL_GATE`, not a reason to rerun authoring or repeat build indefinitely.

## Required visual gate before build / commit / push

After promotion, before build:

1. render exact formal `docs/<slug>.html` locally;
2. generate the canonical risk-driven capture plan, then capture exactly the desktop/mobile `hero` and selected `complex` regions by delegating to `web-capture` (which uses the runtime-provided `agent-browser` endpoint); package each viewport's two raw images as one labeled contact sheet;
   - Call `web-capture` with the target tab / URL and the `pc` or `mobile` preset
   - `web-capture` returns screenshot paths and geometry checks
   - **Do NOT embed `browser_exec` built-in `cdp()` screenshot logic here** — route all web screenshots through `web-capture`
3. record explicit per-panel `critical / major / minor` findings and bind the four raw images plus two contact sheets to current HTML SHA-256;
4. run `npm run verify:visual-gate -- docs/<slug>.html`;
5. repair and recapture after every HTML/CSS/content/structure change;
6. block commit/push on any critical or major defect.

Infrastructure-only capture or visual-review failure must be recorded according to `visual-verification-gate`, with an explicit `evidence_gap`, error category, and outcome. It is never visual pass, and must not fabricate screenshots or dispositions.

### Batch visual preflight

批量开始时先探测一次 CDP / `web-capture`。若不可用，写入批次级 `VISUAL_PENDING` 与错误类别；后续单卡仅引用该状态，不重复调用已确认不可用的 capture backend。基础设施恢复后，必须对仍待发布卡重新采集当前 HTML hash 绑定的桌面和 390px 移动证据。

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

Public verification uses a blocking detail-page check and a separate post-release evidence task. The blocking check requires cache-busted:

```text
https://ccwq.github.io/infocard-pub/docs/<slug>.html
/_index.yaml
/index.html
```

Verify detail HTTP `200` plus a release-specific fingerprint (slug/title/theme/structural token); this establishes `PUBLISHED_VERIFIED`. Index/home checks and fresh public desktop/mobile first-screen screenshots are recorded as post-release audit evidence. Screenshot failure becomes `PUBLIC_VISUAL_FAILED`/`PUBLIC_VISUAL_PENDING` and does not overwrite the release state; successful screenshots are sent to channel.

## Update, rebuild, and timeout recovery (hardened 2026-09-05)

- New card vs update is decided before authoring through `infocard-update-vs-new-pattern`.
- **Any update to an existing card means the edit date must change.** Before promotion, run `sync-publish-metadata.js`; never rely on `npm run build` or on the site build timestamp to refresh `updated`.
- Theme changes rebuild a `.docs` candidate around the selected theme skeleton, preserve required content, then promote through the same gate.
- Author timeout is a filesystem-first handoff: inspect exactly one declared `.docs/<run-id>/<slug>/` directory. If all three declared artifacts (`card.html`, `card.html.meta.yaml`, `promotion-manifest.json`) exist, continue at Publisher; otherwise Publisher completes the missing artifacts in that same directory after confirming frozen facts and theme decision. Never re-delegate the same slug, repeat research, create a worktree, or claim authoring completion from a child summary alone.
- Record the timeout as an execution event (`timeout/no-authoring` or `timeout/partial-authoring`) and preserve the directory; it is not a release result.
- Build/sidecar failure gets one targeted repair and full gate rerun. Second failure is `BLOCKED_AT_LOCAL_GATE`.
- Before closeout, independently verify `updated` in the formal sidecar is newer than the prior value for an update card and verify its rank under the requested homepage sort mode.

## Closeout

Retain `.docs/<run-id>/<slug>/`. Report route, authoring path, manifest mappings, local build/static state, local visual state, content commit, public HTTP/index state, public visual state, and only terminal exceptions.

Do not start Wiki automatically. Do not list, prune, remove, or otherwise operate historical worktrees in ordinary closeout.

## Acceptance checklist

- [ ] No worktree, clone, detached HEAD, `/tmp/infocard*`, or force push used
- [ ] Author wrote only `.docs/<run-id>/<slug>/`
- [ ] Manifest validates source-to-target allowlist
- [ ] Promotion diff contains only declared formal artifacts
- [ ] Four raw desktop/mobile regional captures and two labeled contact sheets are current and have 0 critical / 0 major per panel
- [ ] Build, verify, taxonomy, and leak gates pass
- [ ] Staged diff excludes ambient state
- [ ] Public detail HTTP/fingerprint release state is separate from public visual evidence state
- [ ] `.docs` evidence retained; no cleanup side effect occurred

## Canonical references

- `references/publish-protocol-v3.md` — detailed release fields, states, and ownership.
- `../visual-verification-gate/SKILL.md` — screenshot, visual disposition, retry, and exception rules.
- `../infocard/infocard-theme-assignment/SKILL.md` — theme selection and decision-record rules.
- `scripts/sync-publish-metadata.js` — authoritative timestamp refresh for update cards; MUST be called before promotion for any existing (non-new) card to ensure `updated` reflects the current publish time.
- `../infocard-subagent-delegation/SKILL.md` — filesystem-first timeout handoff, no-redelegation rule, and publisher takeover contract.

Historical worktree incident notes may be retained only for a separately authorized migration/cleanup investigation. They are not active publication instructions and must never be loaded to create, recover, publish, or clean a new information card.
