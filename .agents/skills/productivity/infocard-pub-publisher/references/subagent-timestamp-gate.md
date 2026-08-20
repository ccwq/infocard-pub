# Subagent Timestamp Gate for Infocard Publishing

## Trigger

Use this reference whenever delegating `发布信息卡` / infocard creation to subagents, especially when several cards run in parallel or the user expects homepage dates to be sorted and displayed by Asia/Shanghai time.

## Problem captured

A subagent prompt that says `当前时间戳: 2026-07-07 10:30:00` or embeds a fixed `date:` value causes the subagent to copy that stale value into `docs/*.meta.yaml`. The homepage then correctly reads `_index.yaml` but displays the wrong release time. This is not a frontend cache or sorting bug; it is bad sidecar provenance.

## Required rule

Never hardcode a release timestamp in the delegated prompt. Instead, require the subagent to generate it at write time:

```bash
publish_ts=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')
```

Then write metadata as quoted wall-clock strings:

```yaml
date: "${publish_ts}"
updated: "${publish_ts}"
```

For first publish, `date` and `updated` are identical. For later rebuilds or content revisions, preserve `date` unless the user explicitly says this is a republish/new issue; update `updated` to the new `publish_ts`.

## Forbidden shapes

Do not emit any of these in meta sidecars:

```yaml
date: 2026-07-07
date: 2026-07-07 10:30:00
date: "2026-07-07T10:30:00+08:00"
date: "2026-07-07T02:30:00Z"
```

Reason:
- bare YAML dates/timestamps may be coerced by YAML parsers;
- ISO strings with timezone mix source-time semantics with release-time semantics;
- hardcoded timestamps become stale when subagents run later.

## Verification gate before commit

Before committing a new or updated card, check changed sidecars:

```bash
git diff --name-only -- 'docs/*.meta.yaml' | while read -r f; do
  grep -nE '^(date|updated):' "$f"
done
```

Every changed `date` / `updated` line must match:

```regex
^(date|updated): "[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}"$
```

If not, fix the sidecar before `npm run build` and commit.

## execFileSync glob bug (2026-07-07)

Node.js `execFileSync` does **not** expand shell globs:
```
// WRONG — git receives literal "docs/**/*.meta.yaml", matches zero files
git(["diff", "--name-only", "HEAD", "--", "docs/**/*.meta.yaml"])

// CORRECT — get all diff files, then filter in JS
const allFiles = git(["diff", "--name-only", "HEAD"]).split(/\r?\n/).filter(Boolean)
return allFiles.filter(f => f.startsWith("docs/") && f.endsWith(".meta.yaml"))
```

This caused `scripts/verify-meta-timestamps.js` to silently pass even with bad timestamps. Caught by negative test (bad meta injected, gate still said OK). Fixed by switching to JS-level filtering.

## Homepage semantics

The homepage index sorts by `updated || date`, interpreted as Asia/Shanghai wall-clock time. Therefore the sidecar values are the source of truth for both homepage ordering and visible time labels.

If a user complains that homepage times are wrong:
1. inspect `docs/<slug>.html.meta.yaml` first;
2. compare against `git log --format="%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- docs/<slug>.html`;
3. fix sidecar provenance, then rebuild `_index.yaml` and `index.html`;
4. avoid blaming frontend rendering unless sidecar and index are already correct.
