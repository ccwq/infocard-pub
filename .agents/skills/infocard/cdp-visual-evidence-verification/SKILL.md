---
name: cdp-visual-evidence-verification
description: "Use when verifying CDP screenshots and vision findings."
tags: [cdp, visual, verification, screenshot, vision, infocard]
---

# CDP Visual Evidence Verification

## Purpose

Screenshots and vision-model findings are **evidence only after verification**. This skill covers two failure classes observed in production (2026-08-12, Qwen-MM-Plugins infocard run):

1. **Screenshot misdelivery**: the capture command returned a DIFFERENT page than the target.
2. **Vision false positives**: the vision model reported defects that did not exist in the artifact.

Both failures, if uncaught, either block a valid publish or pass an invalid one. This skill is the cross-check protocol.

## 1. Screenshot identity verification (shared runtime-configured CDP endpoint)

On a shared runtime-provided CDP endpoint Chrome, `agent-browser screenshot` can capture a DIFFERENT tab than the one `open` returned. Observed wrong captures: a ChatGPT 404 login page and a Trigger.dev preview page, both while the target card was open in another tab.

**Byte-size is NOT identity.** A wrong-page capture and the correct card measured identical 281167 bytes in the same session. Never infer page identity from file size, dimensions, or a successful exit code.

### Mandatory protocol before trusting any screenshot

1. Bind the session with `--pin-tab` from the FIRST command; keep the same `--session` + runtime-provided CDP endpoint + `--pin-tab` flags on `open`, `set viewport`, and `screenshot`.
2. `Runtime.evaluate` on the pinned `targetId` (via CDP or `--json eval`):
   - `location.href` must match the target URL
   - `document.title` must match the target title
   - `scrollWidth == clientWidth` (mechanical no-horizontal-overflow evidence; NOT visual pass)
3. Only after identity confirms, analyze/save the screenshot.

### Finding the right target

Use CDP `Target.getTargets` to enumerate `type="page"` entries. Multiple tabs may share the same title; match on URL prefix, not title alone. Iframe targets (`type="iframe"`) cannot be screenshotted directly.

## 2. Vision findings are hypotheses, not verdicts

A vision model report of a typo, layout asymmetry, missing element, or color mismatch must be checked against the artifact BEFORE acting. Observed false positives (2026-08-12):

| Vision report | Reality after check |
|---|---|
| `ARCHITURE` spelling error (critical) | HTML contained correct `ARCHITECTURE` (grep confirmed) |
| Blue quote block "right edge flush / asymmetric" (major) | `getBoundingClientRect()`: gapLeft=gapRight=14, symmetric |

### Verification mapping

| Vision claim | Check method |
|---|---|
| Text typo / wrong copy | `grep -o "PATTERN" docs/<slug>.html` (or search_files) |
| Layout asymmetry / element position | `getBoundingClientRect()` on element AND parent; compare left/right gaps |
| Missing / truncated content | DOM presence check (`document.querySelector`), element count |
| Color / theme mismatch | grep CSS variables in the file against the declared theme |

Record only **verified** defects as `critical`/`major`. Do not block publish on an unverified claim, and do not dismiss a real defect without the same check.

## 3. Vision API failure handling

- **503 `chat_admission_busy` / `structure_limit`**: infrastructure, not content. Wait (20–30s) and retry. Do not treat as a verdict.
- **400 `invalid_request_error` on `image_url`**: image too large for the API. Shrink to ≤1400px width, JPEG quality ~82, then retry. Full-page mobile captures (e.g. 375×11457) MUST be downscaled before analysis.
- **Screenshot captured but analysis failed**: keep the screenshot file; retry analysis after resizing.
- Differentiated retries: after the retry budget is exhausted, record `VISUAL_PENDING` — never promote static/DOM checks to visual PASS.

## 4. Build timeout ≠ build failure

`npm run build` (or any long build) can exceed the terminal cap (e.g. 600s) while still completing successfully. After a timeout, verify before re-running:

```bash
grep -c "<slug>" _index.yaml   # index contains the card?
ls -la docs/<slug>.html*        # artifact mtimes current?
```

If both confirm, the build finished despite the timeout; proceed to commit/push. Re-running is a fallback, not the first step.

## Pitfalls

- Never `git remote set-url` with a hand-typed placeholder token — tool output redaction hides the real value; overwriting pushurl with a placeholder silently breaks the next push. Restore the token from `~/.git-credentials` via a script that READS the file (Python/shell), never echo it: set BOTH `origin` (fetch) and `--push origin` URLs, because `set-url --push` alone leaves fetch on SSH → `Permission denied (publickey)`.
- agent-browser `tabs` command can hang on a busy shared browser; prefer CDP `Target.getTargets` via `browser_cdp`.
- After visual work, close ONLY the owned preview tabs (`Target.closeTarget` with exact targetId), then re-enumerate to confirm absence.

## References

- `references/2026-08-12-qwen-mm-plugins-evidence.md` — 完整实录：截错 tab、视觉误报、vision API 失败形态、build 超时、git 凭据恢复（含命令）

## Related

- `infocard-publish-sop` (user-owned): visual gate, screenshot manifest, publish discipline
- `browser-core` (user-owned): Tab ownership and lifecycle contract
- `any2card` (user-owned): visual evidence production for cards
