# Infocard Publish Protocol v3

## Status and lifecycle

This protocol governs new and republished cards from its adoption date. It does not backfill historical cards, recreate historical visual evidence, or bulk-edit old sidecars. A legacy card migrates only when it is explicitly repaired, updated, or republished.

The active lifecycle is:

\`\`\`
AUTHORING → READY_FOR_PROMOTION → PROMOTED → VERIFIED →
PUBLISHED | PUBLISHED_PENDING_VISUAL | BLOCKED_* | CANCELLED
\`\`\`

Authoring is repository-local and always uses the ignored directory \`<repo>/.docs/<card>/\`. Promotion is the only step that copies files into formal \`docs/\`, \`assets/\`, and generated root paths. The promotion manifest is the exact source-to-target allowlist; files not listed in it are not promoted. The \`.docs/<card>/\` directory is retained after closeout. Cleanup is a separate dry-run/reporting concern and never part of ordinary publication.

\`publish-bundle.json\` has \`schema_version: 3\` and is the runtime source of truth. A concise, non-secret immutable release summary is written after public verification to the existing card \`.meta.yaml\` under \`release_audit\`.

## Reliability gates

For a shared batch, the orchestrator enforces these gates in order:

1. **Capacity gate** — record free space before authoring and promotion. Below 1 GB is \`BLOCKED_AT_CAPACITY\`; request cleanup authorization rather than deleting retained authoring material.
2. **Incremental handoff and single-writer gate** — every Research/Author task writes a valid minimal handoff in its private run directory before enrichment. At timeout it returns that path, remaining gaps, and loses write authority. One card directory has one writer at a time.
3. **Bundle and fixture gate** — create, validate, and freeze the canonical schema-v3 bundle before Author starts. It must carry \`hero_identity\`, \`required_sections\`, claims, \`min_claim_coverage\`, business \`slug\`, source allowlist, and required boundaries. Generate \`facts.json\` before authoring. Missing or invalid input is \`BLOCKED_AT_AUTHOR_INPUT\`; Author must not create speculative artifacts.
4. **Batch narrative gate** — compare cards for conflicting capability claims, safety boundaries, terminology, prohibited terms, source-display policy, and risk language. High-risk categories require explicit \`required_boundaries\`.
5. **Artifact gate** — \`READY_FOR_PROMOTION\` requires every declared HTML, metadata, asset, and manifest entry to exist under \`.docs/<card>/\` and pass local structure/content checks.
6. **Promotion allowlist gate** — the manifest is reviewed before copying. The promotion diff may contain only declared target card artifacts, declared assets, generated index files, and declared release-audit fields. Classify output as \`BLOCKER\`, \`NEW_WARNING\`, or \`BASELINE_WARNING\`.
7. **Visual capability and session gate** — preflight the configured visual runner, session support, preview reachability, and screenshot capability. If unavailable, mark visual verification \`VISUAL_PENDING\`; static or HTTP checks never become a visual pass. Each card still uses its own named review session when the configured runner is available.
8. **Public verification and audit gate** — after promotion and push, prove the remote commit contains the HTML, sidecar, generated index, and expected identity. Then verify detail page, public index, and homepage with bounded backoff. Capture the release audit only after public verification.

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
| Orchestrator | route, run state, conflict disposition, authorized release | duplicate research, card design, direct content authoring |
| Research A | exact object, first-party facts, dynamic snapshot | narrative audit, card files, promotion |
| Research B | claim verdicts, ambiguity, attribution, risk boundaries | API/README duplication, dynamic snapshot, card files |
| Author | \`.docs/<card>/\` HTML, sidecar, assets, promotion manifest, authoring evidence | research expansion, build/index, Git, Wiki |
| Publisher | manifest validation, exact promotion, build, gates, commit, push, public verification, audit commit | research, design, authoring outside the declared directory |
| Closeout | public evidence summary, retained authoring directory, cleanup dry-run candidates | deleting authoring material or release artifacts |

A dynamic value has one Research A owner and one \`retrieved_at\`. The Publisher never recreates facts from prose or an unverified authoring directory.

## Runtime bundle and promotion manifest

The bundle is stored at \`.docs/<card>/publish-bundle.json\`. It is process evidence and is never promoted. The minimum shape is:

\`\`\`json
{
  "schema_version": 3,
  "run_id": "20260820T182344Z-khoj",
  "identity": {"slug": "khoj-ai-second-brain", "title": "Khoj：把资料变成 AI 第二大脑", "expected_public_identity": "Khoj"},
  "request": {"pages": true, "wiki": false},
  "route": "light|full",
  "authoring": {"root": ".docs/khoj-ai-second-brain", "status": "AUTHORING|READY_FOR_PROMOTION", "bundle_path": ".docs/khoj-ai-second-brain/publish-bundle.json", "manifest_path": ".docs/khoj-ai-second-brain/promotion-manifest.json"},
  "promotion": {"status": "PENDING|PROMOTED", "files": [{"source": "card.html", "target": "docs/20260820-khoj-ai-second-brain.html"}, {"source": "card.meta.yaml", "target": "docs/20260820-khoj-ai-second-brain.html.meta.yaml"}], "assets": []},
  "facts": {"sources": [], "claims": [], "dynamic": {"retrieved_at": "ISO-8601", "owner": "research_a"}, "prohibited_conflations": []},
  "gates": {"local": {}, "visual": {"status": ""}, "public": {}},
  "states": {"pages": "DRAFT", "wiki": "NOT_REQUESTED"},
  "release": {"content_commit": "", "audit_commit": ""}
}
\`\`\`

\`promotion-manifest.json\` is the authoritative exact copy list. Source paths are relative to \`.docs/<card>/\`; target paths are relative to the repository root and must be under \`docs/\` or \`assets/\`, except for generated \`_index.yaml\` and \`index.html\` owned by the repository build. No bundle, screenshot, process file, temporary file, or secret may appear in the manifest. Reject duplicate targets, path traversal, absolute paths, and undeclared files.

## Required gates and literal command sequence

All routes run the repository's actual equivalents of bundle/metadata structure, promotion manifest validation, build, repository verification, taxonomy verification, leak check, static content/local-assets checks, visual disposition, and cache-busting public checks for HTML, \`_index.yaml\`, and expected identity.

Canonical local commands, run from the authorized repository checkout after promotion:

\`\`\`bash
npm run build
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
\`\`\`

A local structure/content failure gets one targeted repair and one complete rerun. A second failure is \`BLOCKED_AT_LOCAL_GATE\`. Before promotion, validate the sidecar as one YAML mapping with required fields \`slug\`, \`path\`, \`category\`, \`title\`, \`desc\`, \`date\`, \`updated\`, and \`tags\`; \`path\` must equal the manifest target. After promotion, verify \`_index.yaml.cards\` and \`index.html\`'s injected \`home-index-data\` contain the target slug, path, title, and description. A free-text slug occurrence never passes.

## Visual evidence

Review desktop \`1440x900\` and mobile \`390x844\` after verifying preview identity. A passing result is \`VISUAL_PASSED\`; \`critical\` or \`major\` is \`VISUAL_BLOCKED\`; infrastructure-only unavailability is \`VISUAL_PENDING\`. \`VISUAL_PENDING\` may proceed only as \`PUBLISHED_PENDING_VISUAL\` when all other gates are green and the exact reason plus mechanical responsive evidence are recorded. Any HTML/CSS/structure change invalidates prior visual evidence.

After public verification, capture a fresh online-URL screenshot when state is \`PUBLISHED\` or online proof was requested. Store only the real absolute PNG path in run evidence; never put it in the promotion manifest or audit sidecar.

## Promotion and integration

The Publisher operates in the authorized repository checkout and does not create or switch to an alternate checkout. Inspect the working tree and preserve unrelated user changes. Copy only manifest-declared source files from \`.docs/<card>/\` to exact formal targets; do not use unrestricted directory copies or \`git add -A\`.

For a multi-card batch, validate each manifest, promote all declared files, run one shared build, and regenerate shared indexes once. Inspect the full diff after build; restore unrelated timestamp, sidecar, taxonomy, and historical index spillover before staging. Stage exactly the promoted card files, declared assets, and generated index artifacts.

If the remote branch advances before push, reconcile in the authorized checkout, regenerate generated artifacts, rerun affected gates, and retry once. A second integration failure is \`BLOCKED_AT_INTEGRATION\`; never force-push or alter unrelated user changes. Network/Pages verification uses one initial attempt plus three backoff retries. HTTP 200 alone is not current-release evidence.

## States

Pages:

\`\`\`
DRAFT → VERIFIED → PROMOTED → PUBLISHED | PUBLISHED_PENDING_VISUAL |
BLOCKED_AT_AUTHOR_INPUT | BLOCKED_AT_CAPACITY | BLOCKED_AT_LOCAL_GATE |
BLOCKED_AT_INTEGRATION | PAGES_VERIFICATION_FAILED
\`\`\`

Wiki: \`NOT_REQUESTED | PENDING | SYNCED | FAILED\`. Wiki runs only when explicitly requested and never rolls back Pages.

## Two-commit release audit

1. Promote declared artifacts and run build/gates.
2. Create and push the content commit containing promoted card artifacts, declared assets, and generated indexes.
3. Verify public HTML, index, and identity text.
4. Update only the formal card sidecar with \`release_audit\`.
5. Run \`audit-sidecar-gate.md\` to verify audit fields, content-commit SHA, artifact hashes, visual/Wiki states, and the exact one-file staged set.
6. Create and push the audit commit; record its SHA in the bundle.

Minimum audit fields:

\`\`\`yaml
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
\`\`\`

Never store local paths, retry logs, credentials, or environment diagnostics in the audit sidecar. If audit integration fails after Pages succeeds, keep Pages and record \`AUDIT_PENDING\` in the bundle.

## Closeout and retained authoring material

After the terminal business state is recorded:

1. Verify the formal card, generated index, public URL, visual state, and requested Wiki state.
2. Retain \`.docs/<card>/\` as the authoring record. Report its path and classify contents as retained source, manifest, evidence, or cleanup candidate.
3. Re-run local cleanliness and leak checks when final content or metadata changed.
4. Report cleanup candidates as a dry-run only. Actual deletion of a retained \`.docs\` card or any candidate requires a separate explicit cleanup command and separately scoped authorization.

Do not report historical alternate checkouts, request a cleanup phrase, or perform deletion as part of this lifecycle. Historical references elsewhere in the skill library are legacy incident notes, not active protocol.

## Retry budget

| phase | budget | terminal disposition |
|---|---|---|
| child | no auto-redelegation | bounded completion or research failure |
| local structure/content | one targeted repair + one full rerun | \`BLOCKED_AT_LOCAL_GATE\` |
| network/Pages | initial + three backoff retries | \`PAGES_VERIFICATION_FAILED\` |
| visual infrastructure | initial + four retries | \`VISUAL_PENDING\` / \`PUBLISHED_PENDING_VISUAL\` |
| integration | one reconciliation/rebuild | \`BLOCKED_AT_INTEGRATION\` |
| Wiki | one requested attempt | \`FAILED\`, independent of Pages |

## Compatibility

The live repository validator is executable authority for its mechanical fields. Preserve v3 semantics while adding live compatibility fields when required. Use \`validator-compatibility.md\`; do not weaken ownership, state, manifest, or audit rules to imitate an older validator.
