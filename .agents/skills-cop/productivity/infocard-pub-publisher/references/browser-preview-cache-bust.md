# Local preview cache-bust after HTML edits

## When it happens

During infocard publishing, a browser tab attached to the local preview can keep showing stale CSS/DOM after you patch the HTML file. This is most visible when you change font sizes, spacing, or responsive rules and then immediately re-check the same tab.

## What to do

1. Reload the exact preview tab after file edits.
2. If the preview still looks stale, reopen the card with a cache-busting query string such as `?v=2`.
3. Re-run computed-style checks after the reload, not before.
4. If you need to compare two states, use two distinct URLs (for example `...html` and `...html?v=2`) instead of trusting the old tab.

## Why this matters

Browser verification should reflect the file on disk, not an earlier render state held by the preview tab. This avoids false negatives when verifying font size, overflow, or button placement after a patch.