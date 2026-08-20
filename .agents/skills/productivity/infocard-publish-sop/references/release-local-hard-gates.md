# Release-local hard gates rollout

## Trigger

Use for every newly authored or republished card after the runtime bundle has been created and before build, public verification, or worktree cleanup.

## Runtime contract

`publish-bundle.json` must carry an absolute `repository.root`: the one dedicated publish worktree. It is runtime-only and never enters the source allowlist.

Run from that exact directory:

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase prebuild
npm run build
npm run verify:publish-local-gate -- --bundle <bundle> --phase postbuild
```

Before treating a public 404/missing entry as CDN propagation, first verify the remote content commit includes the HTML, sidecar, `_index.yaml`, and `index.html`; then run:

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase pre-cdn
```

Before removing the worktree:

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase cleanup
```

## What the deterministic gate proves

- `prebuild`: process is in the declared Git worktree; sidecar is one YAML mapping; required fields are non-empty; identity fields agree with the bundle.
- `postbuild` / `pre-cdn`: additionally, parsed `_index.yaml` has a target entry with matching `slug` and `path`, non-empty `title`/`desc`, and `index.html` contains the slug.
- `cleanup`: `git status --porcelain` is empty. A failure preserves the worktree; never substitute `git worktree remove --force` without explicit authorization.

## Repair discipline

A failed release is repaired in the same publish worktree. If it no longer exists, create an explicitly recorded recovery worktree from the remote release commit. Re-run every local gate before a repair commit. Do not repeat-push or call an issue CDN propagation before the Git-content and local-index proofs pass.

## Test seam

The repository command is `scripts/verify-publish-local-gate.js`; its Node test is `scripts/test/verify-publish-local-gate.test.js`. Update both when changing deterministic behavior.
