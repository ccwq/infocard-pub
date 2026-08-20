# Asset commit trap for infocard publish

## When to use
Use this reference when a card embeds a localized image and the public page still shows a broken image / empty hero even though the HTML references the right path.

## What happened in the Odysseus case
- HTML referenced `assets/images/<slug>/hero.jpg` correctly.
- The image existed locally in the repo checkout.
- Public Pages still returned 404 for the image because the asset had not been staged/committed in the publish bundle.
- The page therefore appeared to have a broken first-screen image even after the HTML had already been "fixed" once.

## Durable lesson
A localized asset is not real until all three are true:
1. The file exists at the exact referenced path.
2. The file is included in the same git commit as the HTML/meta bundle.
3. The deployed public asset URL returns HTTP 200.

## Verification recipe
- Verify local static server:
  - `curl -I http://127.0.0.1:5588/docs/<slug>.html`
  - `curl -I http://127.0.0.1:5588/docs/assets/images/<slug>/<file>`
- Verify public Pages after push:
  - `curl -I https://ccwq.github.io/infocard-pub/docs/<slug>.html`
  - `curl -I https://ccwq.github.io/infocard-pub/docs/assets/images/<slug>/<file>`
- If the HTML page is 200 but the image is 404, treat it as an asset-commit failure, not a styling issue.

## Repair pattern
1. Add the localized asset to git.
2. Rebuild and verify.
3. Push HTML + meta + asset together.
4. Wait for Pages propagation.
5. Recheck the exact asset URL, not just the page URL.

## Prevention
- Keep image paths slug-shaped and stable.
- Prefer SVG or PNG assets in `docs/assets/images/<slug>/` for flat `docs/*.html` cards.
- When a fallback is needed, render a text fallback block inside the hero card so the first screen remains readable even if the image temporarily fails.
