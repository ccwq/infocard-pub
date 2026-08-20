# GitHub repo card fetch + image verification notes

Use when publishing an infocard from a GitHub repository and normal GitHub/API/raw requests are flaky.

## Durable retry pattern

If `urllib`, `curl`, `git ls-remote`, or browser navigation hits transient TLS close / EOF against GitHub, retry the **same public source** with IPv4 + HTTP/1.1 before switching sources:

```bash
curl -4 --http1.1 -k -L --retry 3 \
  --connect-timeout 10 --max-time 40 \
  -A 'Hermes-Agent' \
  https://api.github.com/repos/OWNER/REPO \
  -o /tmp/repo-meta.json

curl -4 --http1.1 -k -L --retry 3 \
  --connect-timeout 10 --max-time 40 \
  -A 'Hermes-Agent' \
  https://raw.githubusercontent.com/OWNER/REPO/main/README.md \
  -o /tmp/repo-README.md
```

This preserves provenance better than immediately using search snippets or mirrors. Use mirrors only after direct API/raw retry fails.

## Repo evidence bundle for high-value tool cards

For GitHub repo information cards, collect and cite at least these layers when available:

1. GitHub API metadata: stars, forks, default branch, topics, language, created/updated/pushed timestamps.
2. README / localized README: positioning, benchmark claims, quick start, roadmap.
3. `package.json` or equivalent manifest: package name, version, runtime requirements, CLI bins, license.
4. Recursive tree or contents API: directory-level evidence (`src/`, `scripts/`, plugins, docker, assets).
5. README images: download to `docs/assets/images/<slug>/` and reference locally; do not hotlink.

## Image verification pitfall

Browser DOM checks can report `naturalWidth=0` for below-the-fold images that still have `loading="lazy"`, even when the HTTP asset is valid. For verification-critical card images, prefer:

```html
<img src="..." loading="eager" decoding="async" />
```

or explicitly scroll/fetch each image before asserting `complete && naturalWidth > 0`.

Verification should include both:

```bash
curl -I https://.../docs/assets/images/<slug>/<image>.png
```

and a browser-side check:

```js
Array.from(document.images).map(img => ({
  src: img.getAttribute('src'),
  complete: img.complete,
  nw: img.naturalWidth,
  nh: img.naturalHeight
}))
```

Do not mark image verification complete while any intended embedded image is still `complete=false` or `naturalWidth=0`, unless you have separately fetched it and documented why lazy loading is acceptable.
