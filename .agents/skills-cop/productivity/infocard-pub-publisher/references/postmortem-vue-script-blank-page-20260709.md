# Postmortem: Vue `<script>` line removed → 4h6min blank page

**Date:** 2026-07-09
**Outage window:** 12:23:16 → 16:29:10 (Asia/Shanghai) — 4 hours 6 minutes
**Restoration trigger:** Unintentional side-effect of a `git reset` class operation (commit `960f5be`), not a deliberate fix.
**Authoritative fix commit:** `7ad3441` "fix: restore missing Vue vendor script in index.html"

This is the **postmortem / audit methodology** companion to
`references/blank-page-missing-vue-script-20260709.md`. Read that first
for the diagnosis; come here when you need to **trace a regression back
to a specific commit, time, author, and context** — or when you suspect
the existing skill coverage masks an upstream hygiene failure mode.

## The exact deletion

| Field | Value |
|---|---|
| Commit | `941fa13d5646879ebce32c93e78d8b77637fa503` |
| Time | 2026-07-09 12:23:16 +08:00 |
| Author / Committer | Hermes Agent <agent@hermes> (subagent) |
| Subject | `feat: add karpathy-llm-wiki-knowledge-compilation` |
| Diff signature | Single line removed: `<script src="./assets/home/vendor/vue.global.prod.js?v=20260601-003"></script>` |
| File size change | 678,095 B → 902,729 B (+224 KB of JSON data, masking the +1 / -1 vendor-line diff) |

## The recovery (incidental, not targeted)

| Field | Value |
|---|---|
| Commit | `960f5be98937177787416d0a636cbf661873700c` |
| Time | 2026-07-09 16:29:10 +08:00 |
| Author | ccwq <ccwq@ccwq.net> (main thread) |
| Subject | `fix: remove duplicate camoufox slug from _index.yaml (was 500, now 499)` |
| Commit-message claim | "Only" touches `_index.yaml` |
| Actual effect | `git reset --hard` class rollback of 4 cards (karpathy / tau / microsoft / browserskill) + restored `index.html` blob to an earlier, vendor-complete version |
| Why it worked | The restored `index.html` blob happened to be `f04901e` (from `4d23ceb`, 13:04), which still contained the Vue script line. No deliberate page-blank fix was made. |

**Lesson:** The 4-hour gap closed by accident. If ccwq had not performed
that rollback at 16:29, the blank page would still be live today.

## Why the existing skill coverage did not catch this in real time

`references/blank-page-missing-vue-script-20260709.md` describes the
*symptom* (blank page, Vue undefined, anonymous console exception) and
the *fix* (insert one `<script>` tag). It does NOT cover:

1. **How to find the exact commit that introduced the regression** when
   the symptom is first observed hours/days later.
2. **How to read past subagent-driven `npm run build` outputs** when the
   `index.html` blob hash is the only forensic artifact.
3. **How to recognize a commit message that misrepresents the actual
   change scope** (commit says `_index.yaml` only; the file tree moved
   4 cards + 1 index blob).

This reference fills that gap.

## Audit methodology (reproduce this in any future regression)

### Step 1 — Confirm the symptom class

Before git archeology, make sure you are looking at the right problem.

```bash
# Static probe (already covered by scripts/probe-blank-page.sh <url>)
curl -sSL <url> | grep -oE 'src="[^"]+\.js[^"]*"'
# If Vue is referenced but not loaded → "vendor-script-missing" class

# Runtime probe (when browser can't reach)
node scripts/jsdom-vue-mount-check.js \
  dist/index.html \
  dist/assets/home/vendor/vue.global.prod.js \
  dist/assets/home/vendor/js-yaml.min.js \
  dist/assets/home/index.js
# Exit 0 + hasVue=object → fixed; exit 1 + hasVue=undefined → still broken
```

### Step 2 — Find the last commit where the missing tag was present

`git log -S '<literal>'` is **misleading** for large files: it counts
string occurrences, not deletions. With a 900 KB `index.html` growing
~30 KB per release (JSON data), `-S 'vue.global.prod.js'` will match
purely additive commits that re-emit the line, not the commit that
removed it.

Instead, enumerate every commit on the path between the broken HEAD
and the previous known-good state, and probe each commit's blob:

```bash
# Forward chronologic, filtered to commits that modified index.html
git log --reverse --pretty=format:'%H %ct' -- index.html | \
  awk '{print $1}' | while read sha; do
    count=$(git show "$sha:index.html" 2>/dev/null | grep -c 'vue.global.prod.js' || true)
    ts=$(git show -s --format='%ct' $sha)
    short=$(echo $sha | cut -c1-8)
    printf "%s %s vueRefs=%s\n" "$short" "$(TZ=Asia/Shanghai date -d @$ts '+%Y-%m-%d %H:%M:%S')" "$count"
  done | awk '
    BEGIN { prev = "" }
    { if ($3 != prev) { print "[CHANGED] "$0; prev = $3 } }
  '
```

The transition point `[CHANGED] <sha> ... vueRefs=N` where N goes from 1
to 0 is your deletion commit; 0 → 1 is your (incidental) restoration.

### Step 3 — Confirm via direct diff (do not trust `-S` alone)

```bash
# Show the literal removal
git diff <parent_sha> <bad_sha> -- index.html | grep -E '^[+-].*<script'
# Expected output for the 2026-07-09 case:
# -  <script src="./assets/home/vendor/vue.global.prod.js?v=20260601-003"></script>
```

### Step 4 — Identify the author and the actual context

```bash
git show -s --format='hash=%H%ndate=%ad%nauthor=%an <%ae>%ncommitter=%cn <%ce>%nsubject=%s%n---body---%b' \
  --date=iso-local <bad_sha>
```

Note: when `author != committer`, the **author** ran the build, but
the **committer** may be a different session — useful when a subagent
published under its own identity.

### Step 5 — Verify the "incidental fix" hypothesis

If a later commit silently restored the line, check whether it was
actually a `git reset --hard` or a rebase, not a targeted fix:

```bash
# Compare blob hashes
echo "before: $(git ls-tree <bad_sha>:index.html | awk '{print $3}')"
echo "after:  $(git ls-tree <recovery_sha>:index.html | awk '{print $3}')"

# A pure `_index.yaml`-only commit that *also* changed index.html is
# a smell. Use:
git show --stat <recovery_sha>
# vs.
git diff <recovery_sha>~1 <recovery_sha> --stat
```

If `git show --stat` reports fewer files than `git diff` reports, the
commit message is hiding a non-trivial change of scope.

### Step 6 — Confirm the file actually committed the broken state

Don't trust the GitHub Pages deploy without re-fetching the public URL.
Pages CDN can lag 5–30s after `workflow_runs` reports `completed|success`,
and `git push` returning 200 only confirms the push, not the deployment.

```bash
# Wait for workflow_runs to report completed|success on the new HEAD,
# then re-curl. Loop with sleep until the literal appears.
for i in $(seq 1 25); do
  if curl -sS <url> | grep -q 'vue.global.prod.js'; then
    echo "verified on attempt $i"; break
  fi
  sleep 6
done
```

## Forensic pitfalls the next agent will hit

### `git log -S '<string>'` matches additive commits, not deletions

`-S` measures the **count** of occurrences, not whether a line
disappeared. With `index.html` growing from 600 KB to 900 KB between
releases, the line `vue.global.prod.js` appears once before and once
after — both states report `1`, and `-S` will surface both commits.

**Workaround:** Always pair `-S` with a direct per-commit blob grep.
The script in Step 2 produces the canonical signal.

### Commit message ≠ change scope

`960f5be` (recovery commit) says "fix: remove duplicate camoufox slug
from `_index.yaml`". `git show --stat` lists only `_index.yaml`. The
**real diff** shows 10 files changed, including `index.html` and 4
doc deletions. This pattern — message focused on the user's stated
intent, while the operation is a wider `git reset` — is the **single
biggest blind spot in `git show --stat`-based review**.

**Workaround:** Always confirm `git show --stat` against
`git diff <sha>~1 <sha> --stat`. Mismatch = commit message is hiding
scope.

### Anonymous `exception` from minified/IIFE scripts

The blank-page symptom presents in browser devtools as:

```
js_errors: [{ message: "", source: "exception" }]
```

The empty `message` is **not** "no error". It is the CDP-side rendering
of `Uncaught ReferenceError: Vue is not defined` from a script whose
inner IIFE swallows the message field.

**Workaround:** Do not stop at "no message → probably fine". Run
`browser_console expression='typeof Vue'` (or the relevant global) to
get the runtime fact.

### `git reset`/rebase can mask the live state

After `960f5be`, the working `main` HEAD's `index.html` blob is `f04901e`
(last seen at `4d23ceb`, 4 hours earlier). Anyone reading the live page
during the rollback window sees the **restored** version, not the
**broken** version — so a casual `curl` could falsely conclude "the
site is fine" when in fact the next release (`b3a420d`) is built on a
fresh, also-broken `index.html`.

**Workaround:** Don't trust `HEAD` state. Pin your curl to the
specific `HEAD~1` blob when investigating a regression.

### Subagent templates can re-introduce old bugs

`941fa13` was built by a subagent whose working tree (or template file)
for `index.html` did not include the Vue script line. The build logic
in `scripts/build-site.js` only rewrites the `<script id="home-index-data">`
block; it does **not** protect surrounding `<script src=...>` lines.

A subagent's "clean template" for `index.html` is therefore a **time
bomb**: any future subagent that regenerates `index.html` from a
template missing the vendor scripts will re-introduce this exact
failure.

**Mitigation (proposed, not yet implemented):**

```js
// In scripts/build-site.js, before writeText(INDEX_HTML_PATH, ...):
const REQUIRED_VENDOR_SCRIPTS = [
  './assets/home/vendor/vue.global.prod.js',
  './assets/home/vendor/js-yaml.min.js',
  './assets/home/index.js',
];
const htmlText = readText(SOURCE_INDEX_HTML_PATH);
for (const tag of REQUIRED_VENDOR_SCRIPTS) {
  if (!htmlText.includes(tag)) {
    throw new Error(
      `index.html is missing required vendor script: ${tag}\n` +
      `This is exactly the 2026-07-09 blank-page regression — see\n` +
      `references/postmortem-vue-script-blank-page-20260709.md`
    );
  }
}
```

The matching verify-side check would be:

```js
// In scripts/verify-index.js (the npm run verify entry point):
const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
for (const tag of REQUIRED_VENDOR_SCRIPTS) {
  assert(html.includes(tag), `verify failed: index.html missing ${tag}`);
}
```

Together, these close the loop at build + publish gates, and the
next regression cannot reach `main`.

## Mental model

A blank-page regression has three layers:

```
1. Symptom layer  (browser shows blank, console has 1 anonymous error)
   └─► probes already covered by probe-blank-page.sh + jsdom-vue-mount-check.js

2. Fix layer      (insert one <script> tag, push, wait for Pages)
   └─► recipe in references/blank-page-missing-vue-script-20260709.md

3. Postmortem layer  (which commit, which author, what scope, what recovery)
   └─► THIS REFERENCE
```

When a future agent reports a blank page, step 1 → step 2 fixes the
user. But the **same agent** should also run step 3 *once* per
regression class — because every silent fix (like `960f5be`) is one
release away from re-breaking.

## Adjacent failure modes (not yet observed, watch for them)

| Mode | Detection |
|---|---|
| `js-yaml.min.js` removed (instead of Vue) | Probe shows YAML missing; `typeof jsyaml === 'undefined'`; index.js throws at line 2 with the same anonymous `exception` |
| `index.js` removed | `#app` empty; `typeof window.cardData`/`typeof window.cards` undefined; first page load shows raw template, second load shows nothing |
| Vue loaded but wrong version | Vue mounts but data binding fails silently; `home-index-data` length is right but `cardLinks = 0`; CSS works but no cards rendered |
| All three present but order wrong | Vue loaded *after* `index.js`; `Vue is not defined` at line 2 of index.js, identical symptom to "missing" |

The probe in Step 1 will catch all four. The CI guard proposed above
catches the first three; the fourth (order) needs a literal regex
check on load order, not yet implemented.