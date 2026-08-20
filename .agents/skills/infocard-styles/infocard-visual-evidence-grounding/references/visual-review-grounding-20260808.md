# Visual Review Grounding — 2026-08-08 IRIS Card

Session reference for `infocard-visual-evidence-grounding`. Records the exact false-positive and verified-defect findings from the IRIS shell-autocomplete card release.

## Card under review

- Slug: `20260808-iris-shell-autocomplete`
- Style: `redswiss` single-project topbar variant, not the diagonal-hero variant.
- URL: `https://ccwq.github.io/infocard-pub/docs/20260808-iris-shell-autocomplete.html`
- Source: `versenilvis/IRIS` (1,050★, 0BSD, beta)

## Verified defects repaired

1. **Mobile FAB overlap** — `保存 PNG` used fixed positioning and covered the first list item at 390px. Real major defect.

   Repair:

   ```css
   @media(max-width:720px){
     .save-btn{
       position:static;
       display:block;
       margin:14px 0 0 auto;
       border-radius:0;
       box-shadow:4px 4px 0 rgba(10,10,10,.16)
     }
   }
   ```

   The page bottom padding was also raised from 72px to 96px.

2. **Mobile typography too small** — `.meta` was 11px and `.stat span` was 10px, below the repository's 11.2px readability floor. Both were raised to 12px.

3. **Section 02 padding too tight** — `.sec-body{padding:10px 12px}` made the table bottom border visually touch the section border. Changed to `padding:12px 14px 14px`.

## False positives recorded and ignored

1. **"Top diagonal hero missing"** — the reviewer expected a diagonal red→black hero, but this card intentionally uses the standard single-project redswiss topbar variant. Verify the selected theme's actual contract before changing a valid variant to satisfy an implied variant.

2. **"Section 02 table truncated at 1440×900"** — the image was a viewport crop of a long page, not a full-page capture. Confirm `scrollHeight`, table geometry, and the last row before classifying a cutoff.

3. **"2026-04-06 is a future date"** — this is the repository creation date; compare against the actual system date before flagging date errors.

## Cache-busted full-page capture

After each HTML/CSS patch, use a fresh query string and a tall mobile viewport:

```bash
PROFILE_DIR=$(mktemp -d /tmp/hermes-card-profile.XXXXXX)
google-chrome --headless=new --disable-gpu \
  --user-data-dir="$PROFILE_DIR" \
  --screenshot=/tmp/iris-mobile-v3.png \
  --window-size=390,1600 \
  --force-device-scale-factor=1 \
  'http://127.0.0.1:5588/docs/20260808-iris-shell-autocomplete.html?cb=3'
rm -rf "$PROFILE_DIR"
```

Use 390×844 for viewport-only review and 390×1600 or full-page capture for long-card content coverage.

## Release lesson

Classify every finding as `critical / major / minor / false-positive / pending`. Repair verified overlap/readability defects, record model contradictions, and never redesign a card solely because a cropped screenshot suggests missing content or a different theme variant.