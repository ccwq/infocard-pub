# Infocard Publish Authorization Boundary

This repo has recurring work where an HTML detail page exists before the listing/index is correct. Fixes are valid when requested, but creating or publishing new cards is not implied by a request for a report.

## Authorization levels

- **Report only**: generate text/report in current channel. Do not write repo files, publish, push, or send externally.
- **Prepare draft**: may create local draft files if explicitly requested, but do not push or publish.
- **Publish**: only when user explicitly asks to publish/add to `infocard-pub`/GitHub Pages.
- **Cross-platform delivery**: only to the named platform. On failure, ask before switching.

## Project-level auto-push overrides (2026-06-06)

When a project has an explicit, persistent "改完直接 push" rule baked in (e.g. user's stated "这个项目 主题新增修改完成都要push" for infocard-pub themes), the agent must NOT default to "wait for push authorization". Project-level hard rules outrank the generic SOUL "high-risk side effects need explicit authorization" rule. Before publishing without re-confirming, check:

1. fact_store `entity=infocard-pub` or query "主题 新增 修改 push 自动" for the project rule.
2. The user's last few messages on this project (recurring collaboration signals strong rule).
3. Whether the change fits the project-specific surface area (themes / metadata / docs/), not new business logic.

If a project rule exists, follow this skeleton for theme work:

```
edit _themes.yaml / theme/{slug}.html
→ python3 scripts/rebuild_themes.py
→ git add && git commit
→ git push origin main        # DO NOT wait for authorization
→ smoke test (git clean + 3 URLs HTTP 200 + browser visual verify)
```

If unsure, ask once with a concrete "push now?" prompt — but never assume "wait" when the user has stated a project-level push rule.

## Repairing an already-created card

If the user says to keep a mistakenly created card but add it to the index:

1. Preserve the existing HTML.
2. Check for missing `.meta.yaml` sidecar.
3. Create/normalize the sidecar with required fields: `slug`, `path`, `category`, `title`, `date`, `tags`.
4. Rebuild `_index.yaml` from sidecars; do not hand-merge conflict markers.
5. Commit and push.
6. Verify detail page 200 and public `_index.yaml` contains the slug.

## Failure mode to avoid

A detail page returning 200 is not enough. If the public index does not contain the slug or the homepage/list cannot show it, the release is incomplete.