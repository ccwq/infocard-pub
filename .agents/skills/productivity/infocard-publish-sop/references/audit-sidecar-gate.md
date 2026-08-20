# Audit sidecar gate

Use after public verification and before the audit-only commit. This gate replaces content-stage bundle validation at the audit phase.

## Inputs

- the pushed content commit SHA;
- the exact card HTML, sidecar, and manifest paths from the frozen bundle;
- public verification timestamp and URL;
- current visual and Wiki states.

## Check

1. Parse the sidecar YAML.
2. Require `release_audit.schema`, `published_commit`, `pages_url`, `verified_at`, `visual_status`, `wiki_status`, `facts_retrieved_at`, and SHA-256 hashes for HTML and manifest.
3. Require `published_commit` to equal the pushed content commit.
4. Recompute HTML and manifest SHA-256 values and require exact equality with the sidecar.
5. Require `visual_status` to match the bundle disposition and `wiki_status` to match the separate Wiki state.
6. Stage only the sidecar; require the staged set to contain exactly that path and pass `git diff --cached --check`.

## Integration

Fetch before pushing the audit commit. If `origin/main` advanced, use the protocol's one rebase/rebuild budget. If audit integration still fails, record `AUDIT_PENDING`; keep the already verified Pages state.

## Completion criterion

Either one audit-only commit is pushed with a sidecar that passes every check, or the run bundle records `AUDIT_PENDING` and its exact integration failure.
