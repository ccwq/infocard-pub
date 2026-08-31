# Batch release performance and contract notes

Use for an explicitly authorized multi-card information-card publication.

## Contract before build

Normalize each author handoff before any repository build:

- HTML: `docs/YYYYMMDD-slug.html`
- sidecar: `docs/YYYYMMDD-slug.html.meta.yaml`
- sidecar fields must match repository contract: `slug`, `path`, `title`, `desc`, `date`, `updated`, `style`, taxonomy, and repository-valid source/category values.
- Never publish temporary paths or author-only placeholder provenance values.

A role instruction such as “author does not Git/publish” limits only that role. The publisher owns continuation and must not request another release confirmation when the overall card-creation request is already a publish pipeline.

## Efficient batch plan

1. Parallelize authoring and read-only, per-card checks.
2. Fetch once; create one clean publisher worktree from the remote base.
3. Normalize all card artifacts once.
4. Run one mutating build/index pass.
5. Revert unrelated build churn before staging.
6. Run shared repository gates once; run only necessary card-level gates per card, in parallel when read-only.
7. Stage one declared allowlist plus generated index files; commit and push once.
8. Poll every card page, but fetch `_index.yaml` and the homepage once per retry round.

## State discipline

- First Pages 404 after push: `DEPLOYING`; retry with cache busting and bounded backoff.
- If static responsive checks and HTTP smoke pass but screenshot evidence cannot be collected, use `VISUAL_PENDING`; record the missing evidence and reason. Do not call it visual PASS.
- Pages success does not erase outstanding visual or Wiki work. Persist each independently in release audit / closeout state.

## Anti-patterns

- Do not create a non-conforming shared bundle merely to feed a single-card validator.
- Do not run full build, worktree creation, or Pages polling per card.
- Do not commit temporary bundles, manifests, logs, screenshots, caches, or author scratch files.
- Do not report the author handoff as task completion; report only meaningful release boundaries or final state.
