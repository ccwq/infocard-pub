# Public-change truthfulness and repair loop

## Why this exists

A local card can look repaired while the public Pages URL still serves the old HTML. A local build, HTTP 200, or a commit is not proof that the online card changed.

## Required sequence

1. Build and run repository static gates.
2. Commit the exact card and generated index artifacts.
3. Push the exact release commit to the intended remote branch.
4. Wait for Pages propagation; do not treat the first post-push response as final.
5. Fetch the exact public card URL with a cache-busting query.
6. Verify response identity and new markers, such as:
   - expected title and slug;
   - expected `data-theme`;
   - expected structural class/token markers;
   - changed response size or `last-modified` when useful.
7. Reopen that exact public URL at desktop and 390px.
8. Capture fresh screenshots from the public URL, not from localhost or an old browser tab.
9. Run DOM geometry checks and visual review.
10. Deliver the actual PNG paths and report the final commit/public URL/evidence together.

## State language

Use precise terminal states:

- `LOCAL_ONLY`: local worktree/build only; no push.
- `PUSHED_AWAITING_PAGES`: commit pushed; public deployment not yet verified.
- `PUBLIC_HTML_UPDATED`: public HTML contains the intended new markers and identity.
- `VISUAL_PENDING`: public content is updated but required screenshot/vision evidence is missing or inconclusive.
- `PUBLISHED`: public HTML, static gates, and required visual evidence all pass.

Never call a local-only repair “published” or “verified”.

## Repair-loop invalidation

Any HTML/CSS/structure change invalidates previous screenshots and visual conclusions. For every repair after a `major` defect:

- rebuild;
- rerun static gates;
- create a new commit;
- push;
- refetch the exact public URL with cache-busting;
- capture fresh desktop/mobile screenshots;
- re-run visual review;
- retain only final-state evidence in closeout.

## Mobile overflow acceptance

At 390px, check both page-level and component-level geometry:

```js
{
  pageScrollWidth: document.documentElement.scrollWidth,
  pageClientWidth: document.documentElement.clientWidth,
  bodyScrollWidth: document.body.scrollWidth,
  bodyClientWidth: document.body.clientWidth,
  table: (() => {
    const el = document.querySelector('.search-table-wrap');
    return el ? {
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      overflowX: getComputedStyle(el).overflowX
    } : null;
  })()
}
```

Accept only when page-level widths are equal (or within the tested browser's exact viewport normalization), while a genuinely wide table/code component is constrained by `max-width:100%` and `overflow-x:auto`. The screenshot must show the scroll affordance confined to that component. DOM equality alone is not a visual pass; fresh public screenshot evidence is required.

## Evidence delivery

For each final viewport, record:

- exact public URL and cache-bust;
- viewport size;
- screenshot absolute path;
- page identity/title;
- `critical / major / minor` disposition;
- commit SHA.

Send the real PNG path to the user. Do not send a supervisor's virtual screenshot path or a localhost screenshot as proof of public release.
