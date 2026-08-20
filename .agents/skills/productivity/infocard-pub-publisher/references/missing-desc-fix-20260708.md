# Missing Desc: 3 Cards Had No Summary on Index Page

Date: 2026-07-08
Commits: `a11b83d`

## What happened

3 newly published infocards showed "无描述" (no description) on the index page:

- `20260708-entire-cli`
- `20260708-awesome-design-md`
- `20260708-last30days-skill`

The cards' HTML files were fine. The root cause: their `.meta.yaml` sidecars were missing the `desc` field.

## Why it happened

The `infocard-metadata-provenance` skill listed `desc` as **optional**. When writing meta sidecars for these 3 cards, the author (main agent) focused on `title`, `slug`, `date`, `tags`, `links` and forgot `desc`. The build pipeline (`npm run build`) did not treat missing `desc` as an error, so it silently passed. The index page rendered an empty summary.

## How it was fixed

```bash
# Add desc to each sidecar
patch docs/20260708-entire-cli.html.meta.yaml   # desc: "Git-native agent session recorder..."
patch docs/20260708-awesome-design-md.html.meta.yaml  # desc: "VoltAgent/awesome-design-md..."
patch docs/20260708-last30days-skill.html.meta.yaml   # desc: "把过去30天..."

# Rebuild and push
npm run build
git commit -m "fix: add missing descriptions..."
git push
```

## Prevention

1. `desc` is now **required** in `infocard-metadata-provenance` SKILL.md
2. Pre-publish scan: `references/check_desc_required.py` (in same skill) detects missing desc before push
3. Build gate: `index-build-lib.js` `requiredFields` array should eventually include `desc`

## Checklist to run before every publish

```bash
# Run desc check before git commit
python3 ~/hehome/hermes-data/skills/content/infocard-metadata-provenance/references/check_desc_required.py docs/
```

## Files touched

- `docs/20260708-entire-cli.html.meta.yaml`
- `docs/20260708-awesome-design-md.html.meta.yaml`
- `docs/20260708-last30days-skill.html.meta.yaml`
