# Git HOME env + CDP/screenshot fallback for infocard publishing

## Trigger

Use this note when an infocard publish reaches commit/push or mobile verification and one of these happens:

- `git push` over HTTPS fails with `could not read Username for 'https://github.com': No such device or address`, even though this machine normally has stored GitHub credentials.
- `Path.home()` / `~` unexpectedly resolves to a public URL-like path (for example `https:/ccwq.github.io/infocard-pub`) instead of `/home/ccwq`.
- Browser navigation or `browser_vision` screenshot times out in a crowded CDP session, but CDP itself is still responsive.

## Fix pattern

### 1. Re-run Git with the real user HOME

Do not print credential contents. Just force the correct home directory for the command:

```bash
HOME=/home/ccwq GIT_HTTP_VERSION=HTTP/1.1 git push origin main
HOME=/home/ccwq git status --short --branch
```

If a mistaken URL-like directory was created in the repo by an earlier `~` expansion, remove only that accidental path after confirming it is untracked:

```bash
git status --short --branch
rm -rf 'https:'
```

### 2. Resolve index rebase conflicts by regeneration

If a rebase conflicts only in generated artifacts (`_index.yaml`, `index.html`):

```bash
git checkout --theirs _index.yaml index.html
npm run build && npm run verify
git add _index.yaml index.html <current-card-html> <current-card-meta> <current-card-report>
GIT_EDITOR=true git rebase --continue
```

Do not hand-merge generated index artifacts.

### 3. CDP fallback when browser tools time out

If `browser_navigate` or `browser_vision` times out but `browser_cdp Target.getTargets` works:

```text
Target.createTarget(url)
Emulation.setDeviceMetricsOverride(target_id, width=390, height=844, mobile=true, deviceScaleFactor=2)
Runtime.evaluate(target_id, DOM audit for scrollWidth, small fonts, overflow, keywords)
```

This verifies the rendered page without relying on high-level browser wrappers.

### 4. Screenshot fallback with system Chrome

If CDP screenshot also times out, use local Chrome headless only for visual evidence:

```bash
mkdir -p /tmp/infocard-check
HOME=/home/ccwq google-chrome --headless=new --disable-gpu --no-sandbox \
  --window-size=390,844 \
  --screenshot=/tmp/infocard-check/<slug>-mobile.png \
  'https://ccwq.github.io/infocard-pub/docs/<slug>.html?shot=1'
file /tmp/infocard-check/<slug>-mobile.png
```

Keep the canonical PASS criteria as HTTP/index/homepage/CDP DOM checks; screenshot is supporting visual evidence.
