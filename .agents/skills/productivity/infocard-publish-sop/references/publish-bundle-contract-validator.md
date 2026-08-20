# Publish Bundle Contract Validator

## Purpose

A publish bundle is the sole handoff from upstream preparation to the private publish orchestrator. Validate it before agent2 writes a card and again before the card enters a frozen batch. The validator is read-only: a failure must not trigger build, commit, or push.

## Repository compatibility gate

The private SOP defines the target contract, but the repository validator is the executable authority for a live batch. Before agent1 writes a bundle, read `scripts/lib/publish-bundle.js` and `scripts/lib/publish-bundle-schema.md`, then run `node scripts/verify-bundle.js --bundle ...`.

Validator implementations can lag the SOP. An older implementation may require top-level `source_url` and `wiki.knowledge_path`, while not validating newer `provenance` or `high_value` fields. Emit the compatibility fields required by the script **as well as** the richer SOP fields; never assume a syntactically plausible facts file will pass agent1 delivery.

After the bundle gate, run `node scripts/verify-agent1-delivery.js --bundle ...` before starting agent2. This second gate requires the agent1 facts schema: matching `source_url`, non-empty `retrieved_at`, `repo_meta`, `claims`, and `required_sections`, in addition to the bundle and manifest.

If either gate fails, return its structured errors to agent1 for its single permitted targeted repair. Do not start agent2 from a bundle-only PASS.

## Contract

```json
{
  "slug": "example-card",
  "html_path": "docs/20260716-example-card.html",
  "meta_path": "docs/20260716-example-card.html.meta.yaml",
  "asset_dir": "assets/img/example-card",
  "manifest_path": "assets/img/example-card/manifest.json",
  "style": "hardblue",
  "category": "AI/LLM",
  "keywords": ["agent", "workflow"],
  "provenance": {
    "kind": "source_url",
    "source_url": "https://example.com/source",
    "reference": "primary project page"
  },
  "wiki": {
    "raw_path": "raw/articles/2026-07-16-infocard-example-card.md",
    "high_value": false
  }
}
```

Required fields:

- `slug`: lowercase kebab-case, no date prefix;
- `html_path`: a repository-relative `docs/YYYYMMDD-<slug>.html` path;
- `meta_path`: exactly `${html_path}.meta.yaml`;
- `asset_dir`: exactly `assets/img/<slug>`;
- `manifest_path`: exactly `${asset_dir}/manifest.json`;
- `style`: registered style identifier;
- non-empty `category` and `keywords`;
- `provenance`; and
- `wiki.raw_path`: repository-relative and contained in the Wiki root.

`provenance.kind` is exactly one of:

| kind | required proof |
|---|---|
| `source_url` | valid HTTP(S) `source_url` plus a non-empty reference |
| `user_provided` | non-empty reference identifying the user-supplied material; no invented URL |
| `internal` | non-empty reference to the repository/local fact or asset source; no invented URL |

When `wiki.high_value: true`, require non-empty, contained `knowledge_path`, plus the declared index and log targets. For normal cards, those derived knowledge targets are optional. Raw Wiki is always required.

## Asset and evidence checks

- The manifest must be valid JSON.
- Each declared local asset is inside `asset_dir`, exists, is non-zero, and has a matching extension/MIME/signature where the gate supports it.
- `facts.assets` and `manifest.assets` must agree when facts are included upstream.
- A no-image card uses explicit empty arrays and a non-empty reason; it never fakes a decorative asset.
- Bundle paths reject absolute paths, `..`, drive/UNC paths, and symlink escapes.

## Allowlist

For a single candidate, permitted source paths are:

1. `html_path`;
2. `meta_path`;
3. `${asset_dir}/**` including the manifest.

Generated `_index.yaml` and `index.html` are batch artifacts. Wiki paths belong to the Wiki closure contract, not the infocard-pub source allowlist. `.tmp/`, screenshots, `.hermes/`, and agent logs are never allowed publication inputs.

## Validator interface

```bash
node scripts/verify-bundle.js --bundle .tmp/publish-bundles/<slug>.json
```

The command emits one machine-readable JSON object. Exit `0` means valid; non-zero means invalid or unreadable. Every error carries `{field, message}` so the relevant agent can make one bounded repair.

## Release-worktree gate

Before build, require `repository.root` in the runtime v3 bundle to be the absolute path of the exact dedicated publish worktree; reject relative roots and new publish roots outside the fixed temp/infocard-worktree directory reported by `node scripts/infocard-worktree.js root`. Run the repository gate from that directory:

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase prebuild
npm run build
npm run verify:publish-local-gate -- --bundle <bundle> --phase postbuild
```

The gate machine-checks the worktree identity; strict single-document sidecar form; required sidecar fields; bundle/sidecar identity consistency; and, after build, the target entry inside both `_index.yaml.cards` and the parsed `index.html` `home-index-data` payload. It checks slug, path, non-empty title, and non-empty description; arbitrary HTML text containing the slug does not pass. It is deliberately read-only and must block commit/push when it fails.

Use `--phase pre-cdn` only after remote Git content has been verified. It repeats the local index proof so a public 404 cannot be prematurely blamed on CDN propagation. Use `--phase cleanup` to prove a retained worktree is clean enough to be a cleanup candidate; it rejects a dirty worktree and never performs deletion. Actual deletion requires an exact `del-rm` user reply and the `npm run worktree:cleanup -- --confirm del-rm` flow.

## Completion criterion

The command exits 0, declared paths are contained, asset evidence is real, provenance is coherent for its kind, and the computed allowlist contains no process artifacts.

## Gate discipline

Do not shrink complete, attributed facts into short page strings merely to satisfy a content matcher. Preserve evidence quality and repair the derived keyword/section matching instead. See `content-gate-fact-fidelity.md`.
