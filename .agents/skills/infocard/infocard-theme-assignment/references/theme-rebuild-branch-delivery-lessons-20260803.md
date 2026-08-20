# Theme rebuild and branch-delivery lessons — 2026-08-03

## Use case

Republishing an existing infocard after a theme mismatch, especially when the user asks to execute and push.

## Verified workflow

1. Start from a fresh named worktree based on `origin/main`; do not use the dirty integration checkout as the release candidate.
2. Preserve factual content, but rebuild HTML around the selected theme's actual skeleton, tokens, and signature components. Changing only `meta.style` or a few colors is not a theme correction.
3. Keep the implementation declaration aligned:
   - HTML: `data-theme="<bare-slug>"`
   - sidecar: `style: infocard-<bare-slug>-style`
4. For an existing-card republish, update `date` and `updated` according to the approved publish timestamp policy before build; inspect build-generated rewrites.
5. Run build and static gates. Generated `_index.yaml` and `index.html` belong in the same commit as the card and sidecar changes.
6. At 390px, use CDP and record `innerWidth`, `scrollWidth`, `document.body.scrollHeight`, and page-level overflow for each changed card.
7. Push a named branch. Verify the remote ref and raw GitHub content before reporting delivery.

## Delivery boundary

A pushed branch is not a GitHub Pages release. If the branch is not merged/deployed to the Pages source branch, report the exact split:

- branch and commit pushed;
- raw branch content available;
- Pages URL still serves the prior deployment, if verified;
- PR/merge/deployment remains outstanding.

Use “已推送分支，公网主站待合并/部署”, not “已发布”.

## Visual evidence boundary

DOM checks, theme markers, computed styles, mobile overflow metrics, and screenshot bytes are mechanical evidence only. A screenshot must receive a critical/major/minor review before visual PASS. If screenshot capture or vision analysis is unavailable, report `VISUAL_PENDING` with the exact reason.

## Minimal evidence record

```text
branch: <named branch>
commit: <sha>
raw files: HTTP 200 + expected data-theme
pages files: HTTP status + whether content matches commit
static: build / verify-index / tests / leak scan
mobile: width / scrollWidth / overflow / height per card
visual: screenshot + critical/major/minor review, or VISUAL_PENDING
```

## Pitfalls

- Do not stage unrelated ambient changes from the primary checkout.
- Do not infer visual pass from page load, DOM correctness, or screenshot API bytes.
- Do not use a failed generic browser wrapper as evidence that the page is broken; when an existing CDP session is authorized and reachable, use CDP directly and record the limitation separately.
