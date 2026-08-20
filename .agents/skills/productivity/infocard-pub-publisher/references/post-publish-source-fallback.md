# Post-publish source fallback

If browser verification stalls after a publish, do not repeat the same browser navigation blindly.

## Fallback order
1. `curl -sI` the live detail page and confirm `HTTP 200`
2. Fetch the live homepage or `_index.yaml` and search for the slug, title, and style
3. `curl -sI` any local asset URLs that the card depends on
4. If mobile verification is still needed, use the source HTML as the acceptance anchor and re-open browser verification later

## Why this helps
Browser automation can time out for reasons unrelated to the published artifact. A source-first fallback keeps the publish verdict grounded in the live site data instead of a single browser run.
