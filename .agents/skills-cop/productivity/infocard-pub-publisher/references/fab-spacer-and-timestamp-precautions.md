# FAB spacer / timestamp precautions for infocard-pub

## 1) Fixed PNG save buttons do not need a spacer div

If the PNG button is `position: fixed`, it is anchored to the viewport and **does not consume document flow**. Do **not** add placeholder elements such as:

- `<div class="fab-spacer">`
- `<div class="fab-dock">`

These wrappers create large blank gaps at the bottom of the page and are a recurring source of "why is there so much white space" regressions.

### Correct pattern
- Keep the button fixed.
- If the button overlaps the last block on mobile, add safe bottom padding to the content container / footer instead of inserting a spacer div.
- Verify with a mobile screenshot or browser snapshot after the change.

### Quick verification
```bash
grep -n "fab-spacer\|fab-dock\|save-btn\|saveCard" docs/<slug>.html
```

## 2) `date` vs `updated`

For published cards:
- `date` = original source / issue time
- `updated` = substantive content update time

Homepage/listing logic may prefer `updated` first, so if a republish only changes layout, **do not** blindly rewrite `updated` to now. That makes older cards appear freshly published.

### Safe rule
- Style-only fix: keep `date` and `updated` unchanged.
- Real content revision: update `updated` to the actual modification time.
- Fresh reissue requested by user: use the new issuance time explicitly and be consistent everywhere.

## 3) Public verification reminder

If the page is 200 but the list time looks wrong, the bug is usually in the sidecar fields or the homepage time priority, not in the HTML body.
