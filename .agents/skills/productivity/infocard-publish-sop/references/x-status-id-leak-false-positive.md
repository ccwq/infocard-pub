# X Status ID Leak False Positive

## Problem

`scripts/check-info-leak.js` flags `[HIGH]` on X post URLs because the Chinese phone regex `/(\+?86)?[1][3-9]\d{9}/g` matches substrings inside post IDs like `2078318406424793326`.

Example: `href="https://x.com/i/status/2078318406424793326"` → matches `18406424793` as a phone number.

## Fix: Option 1 (RECOMMENDED)

Remove the href attribute containing the post ID from the HTML body; use plain text label instead.

**Before:**
```html
<a href="https://x.com/i/status/2078318406424793326">x.com/i/status/2078318406424793326</a>
```

**After:**
```html
<span style="color:var(--blue)">源帖链接（X 站内访问）</span>
```

Keep the full URL in the `.meta.yaml` `source_url` field (not rendered in HTML body).

## Alternative: Option 2 — URL context exclusion in leak checker

Add `urlContextExclude` pattern to phone-number rule so that numbers inside URL paths are skipped.

```javascript
// In check-info-leak.js, phone-number pattern block:
urlContextExclude: /[\/\?&][^"'\s]*/,  // skip numbers in URL paths/params
```

Update the match loop to check `urlContextExclude` before flagging. Apply this fix to the main repo and push.
