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

Supported style identifiers are: `darkblue`, `redswiss`, `hardblue`, `main-style`, `darkgreen`, `graph-paper`, `handline`, `wood`, `black-head`, `pixelstack`, `q-style`, `paper-warm`, `white-purple`, and `color-material`.

## Allowlist

A valid bundle scopes publication changes to exactly:

1. `html_path`
2. `meta_path`
3. `${asset_dir}/**` (including `manifest_path`)
4. `_index.yaml`
5. `index.html`

Wiki paths describe the external Wiki synchronization contract and are not repository paths, so they are not included in the repository allowlist.

## CLI

```bash
node scripts/verify-bundle.js --bundle path/to/bundle.json
```

The command writes one JSON object to stdout. It exits `0` for a valid bundle and nonzero for invalid input or load errors.
