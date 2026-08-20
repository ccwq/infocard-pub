# Publish bundle contract

A publish bundle is a JSON object used to validate and scope one infocard publish.

| Field | Contract |
|---|---|
| `slug` | Lowercase kebab-case; must not begin with `YYYYMMDD-`. |
| `html_path` | `docs/YYYYMMDD-${slug}.html`. |
| `meta_path` | Exactly `${html_path}.meta.yaml`. |
| `asset_dir` | `assets/img/${slug}`. |
| `manifest_path` | Exactly `${asset_dir}/manifest.json`. |
| `source_url` | Valid `http` or `https` URL. |
| `style` | Supported repository style. |
| `category` | Non-empty string. |
| `keywords` | Non-empty array of non-empty strings. |
| `wiki.raw_path` | Required relative path without `..` traversal. |
| `wiki.knowledge_path` | Required relative path without `..` traversal. |
<<<<<<< HEAD
| `repository.root` | Optional runtime-only absolute path of the primary repository checkout. The local publish gate resolves the current Git root and no longer requires a dedicated publish worktree. |
| `authoring.root` | Runtime-only repository-relative authoring directory, normally `.docs/<card>`. This is never a publication artifact. |
| `promotion.manifest_path` | Runtime-only repository-relative path to the exact promotion manifest under the authoring directory. The manifest is never included in the repository allowlist. |
=======
| `repository.root` | Runtime-only absolute path of the one dedicated publish worktree. Required by `verify:publish-local-gate`; never a publication artifact. For new publish runs it must be inside the cross-platform fixed root reported by the infocard-worktree root CLI, namely os.tmpdir()/infocard-worktree. |
| `repository.root_policy` | Optional runtime compatibility field. Omit or use `fixed-temp` for new runs. Use `external-user-supplied` only when the user explicitly provided an existing external recovery worktree; such worktrees are never cleaned by the del-rm flow. |
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf

Supported style identifiers are: `darkblue`, `redswiss`, `hardblue`, `main-style`, `darkgreen`, `graph-paper`, `handline`, `wood`, `black-head`, `pixelstack`, `q-style`, `paper-warm`, `white-purple`, and `color-material`.

## Allowlist

A valid bundle scopes publication changes to exactly:

1. `html_path`
2. `meta_path`
3. `${asset_dir}/**` (including `manifest_path`)
4. `_index.yaml`
5. `index.html`

Wiki paths describe the external Wiki synchronization contract and are not repository paths, so they are not included in the repository allowlist.

Authoring paths under `.docs/`, publish bundles, promotion manifests, screenshots, and other process evidence are intentionally excluded from the repository allowlist. They must be promoted through the manifest boundary before build and staging.

## CLI

```bash
node scripts/verify-bundle.js --bundle path/to/bundle.json
```

The command writes one JSON object to stdout. It exits `0` for a valid bundle and nonzero for invalid input or load errors.
