# Asset Commit Trap & Public Image 200

## What happened in session
- A localized hero image existed in the working tree, and the HTML referenced it correctly, but the public page still showed a missing image state because the asset itself had not been committed/pushed as part of the publish bundle.
- The repo-local file path was valid; the failure was at the publish boundary.

## Durable lesson
For infocard cards that localize images:
1. Stage the HTML, meta, and localized image together.
2. Commit them in the same bundle.
3. Push the bundle.
4. Verify the **image URL itself** returns HTTP 200 on the public domain, not just the HTML page.
5. If the page is public but the image is not, treat that as an incomplete publish, not a UI-only bug.

## Verification pattern
- Page URL: `HTTP 200`
- Asset URL: `HTTP 200`
- If either fails, do not say the card is fixed.
