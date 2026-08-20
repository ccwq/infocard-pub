# X status with multiple attached images + public reply gate

Use this pattern when a single X status is the source and it contains several attached images that must be published as evidence, together with the public interaction signal.

## Extraction order
1. Open the status page and identify the durable anchor: author, handle, status ID, timestamp.
2. Extract the post body from DOM/innerText first. If oEmbed or summary text truncates, fall back to the raw HTML / embedded text blob.
3. Use `browser_get_images()` to recover the media URLs and preserve their on-page order.
4. If there are 3+ images, map them to the card structure before writing any prose:
   - overview / total frame
   - workflow / process frame
   - layer / mechanism frame
   - summary / checklist frame
5. Download all attached images locally and reference them with relative paths in the published card.
6. If the reply thread is gated by login, record only the public reply-entry signal and interaction counts; do not invent reply text.
7. Add one explicit screenshot/crop that proves the page state (正文 + 互动数 + 回复入口 / 登录墙).

## What to preserve
- status ID as the canonical anchor
- author name and handle
- public reply / repost / like / bookmark / view counts
- attached-image order and meaning
- visible boundary language when comments are inaccessible

## Verification
- Each attached image loads from the local asset path.
- The page shows the image grid and the evidence screenshot.
- The published card states clearly when replies are gated.
- The card title reflects the post's actual claim, not the raw URL.
