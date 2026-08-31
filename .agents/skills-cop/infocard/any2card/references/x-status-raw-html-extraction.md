# X status raw-HTML extraction fallback

Use this when the normal X oEmbed / page summary is truncated or when a text-only fetch only shows the beginning of the post.

## Useful patterns
- The public X HTML often contains a `full_text` JSON field embedded in the page source.
- The same blob usually carries `id_str`, author metadata, and `extended_entities.media[*].media_url_https` for attached images.
- If the first fetch only returns a short excerpt, search the raw HTML for the status ID, then extract the `full_text` block around it.

## Fallback order
1. Prefer oEmbed for a quick title / author / date summary.
2. If oEmbed is truncated, fetch the raw X HTML and parse the `full_text` JSON fragment.
3. **CDP Runtime.evaluate (when raw-HTML fetch returns login wall):**
   - Check tabs via `Target.getTargets` — X tab titles contain tweet previews, so you can identify the right tab.
   - Use `Page.navigate` on the target tab, then `Runtime.evaluate` with `document.querySelector('article').innerText` to get the COMPLETE text (X renders article content behind login overlays).
   - Use `browser_get_images()` to extract media URLs from `pbs.twimg.com`.
   - Advantage over `browser_vision`: no VLM cost, no hallucination risk, exact link text/URL pairs preserved.
4. If text extraction is blocked or insufficient, use screenshot/vision tools on the post page or attached image.
5. If a VLM limit is hit, continue with deterministic text parsing and local image handling rather than stalling.

## Image handling
- When the post contains media, download the `pbs.twimg.com` image locally.
- Keep the image in `docs/assets/images/` for publishing workflows.
- Preserve the original image order unless the user explicitly requests a reorder.

## X infocard link formatting
When creating cards from X posts, the user expects this link presentation:
- **Link name first** as a clickable anchor (bold, prominent)
- **Full URL** displayed verbatim below the name (monospace, smaller)
- **Brief description** of what the link references (context from the tweet)
This applies to every URL the tweet references, not just the first few. Use a `link-card` pattern (bordered container per link, name/URL/desc stacked). Do not collapse multiple links into one paragraph.

## What to preserve in the card
- status ID as the durable anchor
- author handle / display name if available
- the post's actual claim, not just the URL
- any attached image-to-item mapping
- visible boundary / caveat language when the post is promotional or list-like
