# Infocard Publish Protocol v3

## Status and migration

This protocol governs new and republished cards from its adoption date. It does not backfill historical cards, recreate historical visual evidence, or bulk-edit old sidecars. A legacy card migrates only when it is explicitly repaired, updated, or republished.

`publish-bundle.json` has `schema_version: 3`. It is the runtime source of truth. A concise, non-secret immutable release summary is written after public verification to the existing card `.meta.yaml` under `release_audit`.

## Batch reliability gates

For a shared batch, the orchestrator must enforce these gates in order:

1. **Capacity gate** — record free space before creating a worktree. Below 1 GB is `BLOCKED_AT_CAPACITY`; request cleanup authorization rather than deleting old worktrees or creating more output.
2. **Incremental handoff and single-writer gate** — every Research/Author task writes a valid minimal handoff in its private run directory before enrichment. At timeout it returns that path, remaining gaps, and loses write authority. Only the orchestrator writes the integration worktree; before taking over a card it cancels or fences every task targeting that card. One target file has one writer at a time.
3. **Bundle and fixture gate** — create, validate, and freeze the canonical schema-v3 bundle before Author starts. It must explicitly carry `hero_identity`, `required_sections`, claims, `min_claim_coverage`, business `slug`, source allowlist, and required boundaries; generate the verifier `facts.json` fixture from it before authoring. Missing or invalid input is `BLOCKED_AT_AUTHOR_INPUT`; Author must not create speculative artifacts.
4. **Batch narrative gate** — before authoring is accepted, compare all cards for conflicting capability claims, safety boundaries, terminology, prohibited terms, source-display policy, and risk language. High-risk categories (`security`, `physical-system`, `external-side-effect`) require explicit `required_boundaries` in the bundle.
5. **Artifact gate** — build begins only after every declared HTML/meta artifact exists and passes local structure/content checks. A pre-artifact build is invalid evidence and its generated index changes must be discarded or regenerated later.
6. **Allowlist diff and log gate** — after the integration build, the candidate diff may contain only declared card artifacts, their declared assets, generated index files, and declared release-audit fields. Classify output as `BLOCKER`, `NEW_WARNING`, or `BASELINE_WARNING`; baseline noise cannot mask a batch blocker.
7. **Visual capability and session gate** — preflight `agent-browser` executable, session support, preview reachability, and screenshot capability. If unavailable, mark visual verification `UNAVAILABLE` and never call static or HTTP checks visual pass. Otherwise visual work for each card uses its own `agent-browser --session <run-id>-<slug>`; close only that session's tabs at success, failure, or cancellation.
8. **Public verification, recovery, and retained-worktree gate** — after push, first prove the remote content commit contains the HTML, sidecar, `_index.yaml`, and `index.html`; then rerun the local worktree/index gate at that commit; only then verify detail page, public index, and homepage with bounded backoff. Before exhaustion use `PUBLISHED_PENDING_CDN`, not failure or a repeat push. A failed first publish is repaired only in the same publish worktree, or in an explicitly recorded recovery worktree based on the remote release commit; it reruns every local gate before a repair commit. After verification and audit capture, preserve only non-secret evidence, keep the worktree, report historical worktrees, and prompt the user to reply exactly `del-rm` for cleanup. Do not remove a publish worktree automatically.

## Route

Use the **light route** only when every condition is true:

- one card;
- one primary source or complete user-provided text;
- not public-figure, public-opinion, political, medical, or financial-decision content;
- no multi-image acquisition, rights check, or material processing;
- no cross-repository, cross-platform, or multi-source verification requirement;
- not part of a shared publication batch.

Otherwise use the **full route**. The full route starts Research A. Add Research B only for a risk trigger: sensitive topic, unsupported strong/causal claim, conflicting sources, external or multi-audience distribution, or explicit fact/risk review.

## Ownership

| owner | owns | does not own |
|---|---|---|
| Orchestrator | route, run state, conflict disposition, authorized release | duplicate research, card design, Git writes |
| Research A | exact object, first-party facts, dynamic snapshot | narrative audit, card files, Git |
| Research B | claim verdicts, ambiguity, attribution, risk boundaries | API/README duplication, dynamic snapshot, card files |
| Author | HTML, sidecar, manifest, visual evidence | research expansion, build/index, Git, Wiki |
| Publisher | isolated build, gates, commit, push, public verification, audit commit | research, design, subagent management |

A dynamic value has one Research A owner and one `retrieved_at`. The publisher never recreates facts from prose or a dirty worktree.

## Runtime bundle

Location:

```text
/tmp/infocard-runs/<run-id>/<slug>/publish-bundle.json
```

Required shape:

```json
{
  "schema_version": 3,
  "run_id": "20260716T182344Z-khoj",
  "identity": {
    "slug": "khoj-ai-second-brain",
    "title": "Khoj：把资料变成 AI 第二大脑",
    "expected_public_identity": "Khoj"
  },
  "request": {"pages": true, "wiki": false},
  "route": "light|full",
  "repository": {
    "root": "/absolute/path",
    "branch": "main",
    "local_dependencies": "symlinked|none",
    "commands": {},
    "compatibility": {}
  },
  "facts": {
    "sources": [],
    "claims": [],
    "dynamic": {"retrieved_at": "ISO-8601", "owner": "research_a"},
    "prohibited_conflations": []
  },
  "author": {
    "html_path": "docs/YYYYMMDD-slug.html",
    "meta_path": "docs/YYYYMMDD-slug.html.meta.yaml",
    "asset_dir": "assets/img/slug",
    "manifest_path": "assets/img/slug/manifest.json",
    "allowlist": [],
    "required_sections": [],
    "asset_policy": {"mode": "declared|empty", "reason": ""}
  },
  "gates": {"local": {}, "visual": {"status": ""}, "public": {}},
  "states": {"pages": "DRAFT", "wiki": "NOT_REQUESTED"},
  "release": {"content_commit": "", "audit_commit": ""}
}
```

Absolute paths are allowed only in `repository.root` and run-local evidence fields. Publication artifact paths must be repository-relative and contained. Process files, screenshots, and `.tmp` paths are never in the source allowlist.

For new publish runs, `repository.root` must be inside the cross-platform fixed root reported by `node scripts/infocard-worktree.js root`: `os.tmpdir()/infocard-worktree`. Use `node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <slug>` to create the path for the bundle. Existing user-supplied external worktrees are treated as explicit recovery inputs only when the bundle declares `repository.root_policy: "external-user-supplied"`; they are never moved or cleaned by this protocol.

## Required gates

All routes run the repository's actual equivalents of:

1. bundle and metadata structure;
2. build;
3. repository verification;
4. taxonomy verification;
5. leak check;
6. static content and local-assets checks;
7. visual disposition;
8. cache-busting public checks for HTML, `_index.yaml`, and expected identity.

Run additional gates only when the card type requires them.

A local structure/content failure gets one targeted repair and one complete rerun. A second failure is `BLOCKED_AT_LOCAL_GATE`.

### Deterministic local release gate

The bundle must declare the exact dedicated publish worktree as an **absolute** `repository.root` path. Relative roots are invalid because they can resolve to different worktrees. The publisher runs:

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase prebuild
npm run build
npm run verify:publish-local-gate -- --bundle <bundle> --phase postbuild
```

The prebuild phase blocks if the command is not running inside that declared worktree, the sidecar is not a single YAML mapping document, required fields (`slug`, `path`, `category`, `title`, `desc`, `date`, `updated`, `tags`) are missing, or the sidecar does not match the bundle. The postbuild phase additionally parses both generated structures: `_index.yaml.cards` and `index.html`'s injected `home-index-data` JSON must each contain the target slug with the bundle path plus non-empty title/description. A free-text slug occurrence in HTML never passes this gate.

Before any public 404 or missing-entry result may be classified as CDN propagation, run `--phase pre-cdn` in the same worktree after confirming the remote content commit contains the declared HTML, sidecar, `_index.yaml`, and `index.html`. `HTTP 200` is never sufficient evidence of a current release. If the local/remote proof fails, repair the content in the same worktree (or an explicitly recorded recovery worktree) and rerun all local gates; do not repeat-push or label it `PUBLISHED_PENDING_CDN`.

Before reporting cleanup readiness, run `npm run verify:publish-local-gate -- --bundle <bundle> --phase cleanup`. This phase proves only that the retained worktree is clean enough to be a safe candidate; it does not delete anything. A dirty worktree is a hard cleanup block; preserve its path and recovery state. Actual deletion requires the user to reply exactly `del-rm`, after which the agent must re-scan with `node scripts/infocard-worktree.js list --repo <repo>` and run `npm run worktree:cleanup -- --confirm del-rm`. The cleanup command removes only clean registered worktrees inside the fixed root and never uses `--force`.

## Visual evidence

Review desktop `1440×900` and mobile `390×844` after verifying the preview identity. Each card must use its own `agent-browser --session <run-id>-<slug>`; do not reuse or omit the session value. Make one attempt, then retry only visual infrastructure failures up to four more times. Infrastructure failures include unavailable runner, browser startup failure, and capture timeout; they are not visual results. After a terminal visual disposition, close the tabs belonging to that session and record the cleanup result in run-local evidence.

- An obtained result with `critical` or `major` is `VISUAL_BLOCKED` and blocks Pages publication.
- A passing result is `VISUAL_PASSED`.
- If five attempts fail only at infrastructure and all other Pages gates are green, set `VISUAL_PENDING` and allow Pages state `PUBLISHED_PENDING_VISUAL`.

`VISUAL_PENDING` is not a visual pass. Do not schedule automatic retries; only reopen on a user request to repair, correct, or supplement.

## Isolation and integration

Every publication gets a dedicated branch and worktree based on fresh `origin/main`. New worktrees are created only under the fixed `os.tmpdir()/infocard-worktree` root resolved by `scripts/infocard-worktree.js`.

For a multi-card batch, use one fresh integration/publish worktree and copy each card's source artifacts according to its bundle allowlist. Do not cherry-pick child commits that contain independently generated `_index.yaml`, `index.html`, or timestamps. Regenerate shared artifacts once in the integration worktree.

- If the repository needs local Node dependencies, symlink the validated primary repository `node_modules` into the worktree.
- If the package manifest has no local dependencies and the live commands run without `node_modules`, record `local_dependencies: none`; do not create an empty dependency directory merely to satisfy this protocol.
- Do not run dependency installation in a publication worktree.
- Build, validation, generated-index updates, staging, commit, push, recovery, and audit all occur only in that worktree. The publisher must run the deterministic prebuild/postbuild local gate there; it must never build in the primary repository and commit from the publish worktree (or vice versa).
- After build, inspect `git diff --stat`, full status, and all files outside the candidate allowlist. Restore unrelated timestamp, sidecar, taxonomy, and historical index spillover before staging.
- The content commit stages exactly the bundle source allowlist plus generated index artifacts; do not use unreviewed `git add -A`.
- Fetch immediately before push. If `origin/main` advanced, rebase once in the same worktree, regenerate generated artifacts, rerun affected gates, and retry once.
- A second integration failure is `BLOCKED_AT_INTEGRATION`. Do not force-push or alter another worktree.
- At a terminal state (`PUBLISHED`, `PUBLISHED_PENDING_VISUAL`, `BLOCKED_*`, or `CANCELLED`), copy only non-secret run evidence/audit outside the worktree, verify `git status --porcelain` for cleanup readiness, keep the worktree, and include the worktree path plus historical WT report in closeout. Remove worktrees only after the user replies exactly `del-rm`; remove the dedicated branch only after merge or confirmed obsolescence. A dirty worktree is a cleanup blocker, never a reason to force-remove artifacts.

Network and Pages verification use one initial attempt plus three backoff retries. Public verification requires HTTP 200 plus the expected identity/new content in HTML and the correct slug/path in public `_index.yaml`; HTTP 200 alone is not evidence that CDN content is current.

## States

Pages:

```text
DRAFT → VERIFIED → PUBLISHED | PUBLISHED_PENDING_VISUAL |
BLOCKED_AT_LOCAL_GATE | BLOCKED_AT_INTEGRATION | PAGES_VERIFICATION_FAILED
```

Wiki:

```text
NOT_REQUESTED | PENDING | SYNCED | FAILED
```

Wiki runs only when explicitly requested by the task. Wiki status never rolls back a successful Pages state and never creates a background retry by default.

## Two-commit release audit

1. Make and push a **content commit** containing the declared card artifacts and generated index artifacts.
2. Verify public HTML, index, and identity text.
3. Update only the card sidecar with `release_audit`.
4. Run `audit-sidecar-gate.md`; it verifies the audit fields, content-commit SHA, artifact hashes, visual/Wiki states, and exact one-file staged set before the audit-only commit.
5. Make and push the **audit commit**. The run bundle records its SHA after push; the sidecar does not self-reference it.

Minimum audit fields:

```yaml
release_audit:
  schema: 1
  published_commit: "<content commit>"
  pages_url: "https://..."
  verified_at: "ISO-8601"
  visual_status: "VISUAL_PASSED|VISUAL_PENDING"
  wiki_status: "NOT_REQUESTED|SYNCED|FAILED"
  facts_retrieved_at: "ISO-8601"
  artifact_hashes:
    html: "sha256:..."
    manifest: "sha256:..."
```

Never store local paths, retry logs, credentials, or environment diagnostics. If audit integration fails after Pages succeeds, preserve the Pages result and record `AUDIT_PENDING` in the run bundle; do not claim the audit is complete.

## Retry budget

| phase | budget | terminal disposition |
|---|---|---|
| child | no auto-redelegation | main-thread bounded completion or research failure |
| local structure/content | one targeted repair + one full rerun | `BLOCKED_AT_LOCAL_GATE` |
| network/Pages | initial + three backoff retries | `PAGES_VERIFICATION_FAILED` |
| visual infrastructure | initial + four retries | `VISUAL_PENDING` / `PUBLISHED_PENDING_VISUAL` if all other Pages gates pass |
| integration | one rebase/rebuild | `BLOCKED_AT_INTEGRATION` |
| Wiki | one requested attempt | `FAILED`, independent of Pages |

## Compatibility

The live repository validator is executable authority for its mechanical fields. Preserve v3 semantics while adding live compatibility fields when required. Use `validator-compatibility.md`; do not weaken the v3 ownership, state, isolation, or audit rules to imitate an older validator.
