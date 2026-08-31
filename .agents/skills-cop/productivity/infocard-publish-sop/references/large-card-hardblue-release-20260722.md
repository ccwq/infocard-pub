# Dense hardblue card release notes — 2026-07-22

## Scope

A research-heavy ChatGPT/OpenAI account-ban card was authored and published to GitHub Pages. The card used a dense HTML layout with Hero, timeline, five reason cards, appeal workflow, and prevention grids.

## Reusable recovery sequence

1. Author the HTML in bounded chunks. A large single `write_file` payload timed out; retrying the same payload is the wrong recovery. Inspect the partial file, then patch or append smaller sections.
2. Validate the sidecar before build. The live index builder required `category` and a correct `path`, in addition to the usual `slug`, `title`, `desc`, `date`, `updated`, `author`, `style`, `tags`, and `source_url`.
3. Run `npm run build`, stage `_index.yaml` and `index.html`, then run `node scripts/verify-index.js`. Generated artifacts must be staged before verification.
4. If remote `main` advanced, fetch and rebase once. Generated `_index.yaml` and `index.html` can conflict; resolve them from the rebased/generated state, then rerun build and index verification rather than trusting an unverified merge.
5. Run `node scripts/check-info-leak.js` after the final content edit. Generic email placeholders such as `example.com` can be flagged as personal-email leaks; replace them with visibly generic HTML-escaped placeholders such as `&lt;YOUR_EMAIL&gt;` and rerun the scanner.
6. For a date/path correction, rename both HTML and sidecar, update sidecar `path`, rebuild the shared index, and verify the new `/docs/YYYYMMDD-slug.html` returns 200 while the superseded path returns 404.
7. Treat the requested theme as a release gate. For hardblue, blue must dominate the accent system. A structurally excellent card with red as the primary accent is still a visual failure; fix CSS variables, rebuild, push, wait for CDN propagation, and capture again.

## Evidence expected in closeout

- build output and index verification
- leak scanner result
- pushed commit(s)
- public final URL and HTTP 200
- superseded URL 404 when renamed
- rendered visual review confirming theme and section completeness
