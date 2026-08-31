# Blank-Page Diagnosis: missing Vue `<script>` tag

**Date:** 2026-07-09
**Symptom:** `https://ccwq.github.io/infocard-pub/` opens to a totally empty page. Title shows in the tab; `<div id="app">` has zero children.
**Root cause:** Entry JS expects a global `Vue` object, but the HTML `<head>` never loads Vue — only `vendor/js-yaml.min.js` and `assets/home/index.js`.

## Evidence

```
$ curl -sSL https://ccwq.github.io/infocard-pub/ | grep -oE 'src="[^"]+\.js[^"]*"'
src="./assets/home/vendor/js-yaml.min.js?v=20260601-003"
src="./assets/home/index.js?v=20260625-130800"
# (no Vue script — that was the bug)
```

```
$ grep -n "Vue" /tmp/idx.js
2:  const { createApp, ref, computed, onMounted, nextTick } = Vue;
```

Browser-side confirmation:
```js
typeof Vue      // "undefined"
typeof jsyaml   // "undefined"   (index.js crashed at line 2 before yaml was reached)
appLen          // 0
```

Console produced exactly one `js_errors` entry with `message: ""`, `source: "exception"` — anonymous `ReferenceError: Vue is not defined` from a minified/IIFE script whose error message is swallowed.

## Why the static layer looked fine

| Probe | Result | Misleading because |
|---|---|---|
| `curl /` HTTP | 200, 728 KB, text/html | Pages returns 200 even if all included JS throws at boot |
| `index.html` size | large | HTML body itself is fine; `<head>`-level omissions are silent |
| `index.js` HEAD | 200, 31 KB | Asset is reachable; doesn't prove it's *runnable* without its deps |
| `index.css` HEAD | 200, 36 KB | Unrelated to JS mount |
| `home-index-data` JSON-LD | embedded inline | OK; mount just never reaches `createApp().mount('#app')` |

The page is **200 + correct HTML + reachable assets + embedded data**, yet **blank** — only a browser-side globals probe or a CDN-allowed CSP log could expose it.

## Fix

`vue.global.prod.js` v3.5.13 is **already vendored** in the repo at
`assets/home/vendor/vue.global.prod.js` (157 KB) — only the `<script>` tag
that references it was dropped. Do NOT add a CDN fallback like
`https://unpkg.com/vue@3/dist/vue.global.prod.js`: the project intentionally
keeps Vue local so the page works offline / behind firewalls / behind CSP
that blocks `unpkg.com`. Always use the local vendor path.

In `index.html`, **before** `vendor/js-yaml.min.js`, insert:

```html
<script src="./assets/home/vendor/vue.global.prod.js?v=20260601-003"></script>
```

After the fix (commit → push → wait for Pages workflow `completed|success`
on the new HEAD, NOT just the push returning — Pages CDN can lag 5–30s
after workflow success), the page renders the full 514-card archive.

## Runtime verification when browser cannot reach the page

When the public URL is reachable but `browser_navigate` refuses with
"Blocked: URL targets a private or internal address", use jsdom with
inline script injection instead of HTTP-fetched resources:

```js
// Run via: node /tmp/jsdom-mount-check.js dist/index.html \
//          dist/assets/home/vendor/vue.global.prod.js \
//          dist/assets/home/vendor/js-yaml.min.js \
//          dist/assets/home/index.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const [, , htmlPath, vuePath, yamlPath, idxPath] = process.argv;
const html = fs.readFileSync(htmlPath, 'utf8');
const vue  = fs.readFileSync(vuePath, 'utf8');
const yaml = fs.readFileSync(yamlPath, 'utf8');
const idx  = fs.readFileSync(idxPath, 'utf8');

// Strip <script src=...> and <link stylesheet> so jsdom doesn't try to fetch
let stripped = html
  .replace(/<script\b[^>]*src=["'][^"']*["'][^>]*>\s*<\/script>/g, '')
  .replace(/<link[^>]*stylesheet[^>]*>/g, '');

const dom = new JSDOM(stripped, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true });
const w = dom.window;
function inject(t) { const s = w.document.createElement('script'); s.textContent = t; w.document.body.appendChild(s); }
inject(vue); inject(yaml); inject(idx);
setTimeout(() => {
  const app = w.document.getElementById('app');
  console.log(JSON.stringify({
    hasVue: typeof w.Vue,
    hasYaml: typeof w.jsyaml,
    appInnerLen: app?.innerHTML.length ?? -1,
    cardLinks: w.document.querySelectorAll('#app a[href]').length,
    titleVisible: app?.innerHTML.includes('BrowserSkill'),   // known card slug
    errs: [],   // window.addEventListener('error', ...) captured earlier
  }, null, 2));
}, 800);
```

Pass local `dist/` files (after `npm run build`), NOT live HTTPS URLs —
jsdom at `http://localhost/` won't reach GitHub Pages anyway. A passing
result (`hasVue=object`, `appInnerLen > 30000`, `cardLinks > 0`,
`titleVisible=true`) is the deterministic equivalent of opening the
browser, and bypasses the "Pages CDN still serving the pre-fix HTML
for the first ~30s after workflow success" race.

## How this regressed (avoid recurrence)

`git log -p -- index.html` shows the Vue script was once
`<script src="./assets/home/vendor/vue.global.prod.js?v=20260601-003">`,
then a later commit **replaced** that line with the js-yaml vendor line
instead of inserting *alongside* it. Net effect: the Vue line went away
entirely. Anyone hand-editing `index.html` (especially the script block
near `</body>`) must re-verify all vendor tags survived.

**Suggested guard**: add a CI check (or pre-commit hook) that asserts the
literal string `assets/home/vendor/vue.global.prod.js` appears in
`index.html`. Build passed and Pages deployed fine — only a runtime
probe exposed it. The script `scripts/probe-blank-page.sh <url>` already
covers the post-deploy half of this guard; pairing it with a
`grep -F assets/home/vendor/vue.global.prod.js index.html` check in
`npm run verify` would close the loop.

## Pitfall for the next agent

A 200 status on a GitHub Pages URL is **not** evidence the page works. When the user reports "blank page" or "opens but shows nothing":
1. Fetch the HTML, list **every** `<script src=...>` in `<head>`.
2. Grep the entry JS for global identifiers (`Vue`, `React`, `jQuery`, `alpine`, `D3`, `THREE`, …).
3. Confirm **each global has a `<script src=...>` pointing at it** somewhere earlier in the document.
4. If unsure, navigate the page in browser and evaluate `typeof Vue` (or whichever global the entry references) to settle it.

`scripts/probe-blank-page.sh <url>` automates steps 1–3.
