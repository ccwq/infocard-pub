# Pi Plugins Q-Style Card: Asset Manifest Discovery (2026-07-24)

## Context

Bundle `publish-bundle.json` declared:
```
"asset_dir": "assets/img/20260724-pi-plugins精选",
"manifest_path": "assets/img/20260724-pi-plugins精选/manifest.json"
```

The worktree already had complete `docs/20260724-pi-plugins精选.html` and
`docs/20260724-pi-plugins精选.html.meta.yaml`.  The **only missing artifact was the
manifest.json** in the asset directory.

## Lesson: Always Check All Three Artifact Paths

For any Protocol v3 bundle, three files must exist before the card is considered complete:

1. `docs/{slug}.html`            ← HTML card
2. `docs/{slug}.html.meta.yaml`  ← metadata
3. `assets/img/{slug}/manifest.json`  ← asset manifest (often overlooked)

**Failure mode:** Agent reads the HTML + meta.yaml and reports "all done" without
noticing the manifest.json was never written.  Build scripts that count assets or
validate completeness then fail or produce incomplete output.

**Rule:** When authoring a card, always verify all three artifact paths exist,
including the manifest.json.  Do not assume the manifest was created by a prior step.

## Asset Manifest Schema (current working shape)

```json
{
  "schema_version": 1,
  "slug": "YYYYMMDD-slug",
  "created_at": "YYYY-MM-DD",
  "assets": [
    {
      "filename": "card-img.jpg",
      "local_path": "assets/img/{slug}/card-img.jpg",
      "source_url": "https://...",
      "source_context": "图片来源说明",
      "download_status": "present",
      "size_bytes": 60565,
      "mime_type": "image/jpeg",
      "role": "hero-visual",
      "note": "用途说明"
    }
  ],
  "asset_policy": {
    "mode": "include-local",
    "local_assets": ["card-img.jpg"],
    "reason": "为何使用该图片"
  }
}
```

## When Assets Are Missing from Manifest

- `assets: []` + `policy: "empty"` — card uses only inline CSS/SVG, no external images
- `{"files": [], "assets": [], "reason": "..."}` — alternative empty shape used in some cards
- Always prefer `schema_version` + `slug` + `assets[]` + `asset_policy` shape for new cards

## Hero Image Routing in Q-Style Cards

Q-style hero section uses `hero-stats` grid (4 statistics blocks) for the visual punch.
The Pi brand hero image from X was downloaded but not embedded in the hero HTML —
the card instead shows live stats (6 plugins / 17 extensions / 15.7K downloads / 104 likes).
The image is preserved in the asset directory as `card-img.jpg` for completeness.

If the bundle specifies `asset_policy.mode: "include-local"` and lists `card-img.jpg`
in `local_assets`, the image path should match the `manifest.json` record exactly.
