# Tech product investigation release notes

Session-derived release pattern for publishing investigation cards about software products, repos, and platforms.

## Scope
Use when the source is a mix of:
- GitHub repository README / docs / release notes
- npm registry or package metadata
- official website copy or product docs
- runtime / install / CLI evidence

## Recommended output bundle
For investigation-style publish requests, produce a *paired bundle* in the same dated slug directory:
- `report.md` — concise evidence-based writeup
- `index.html` — public info card
- `index.html.meta.yaml` — required sidecar

Suggested layout:
- `docs/{YYYYMMDD}-{slug}/report.md`
- `docs/{YYYYMMDD}-{slug}/index.html`
- `docs/{YYYYMMDD}-{slug}/index.html.meta.yaml`

## Evidence-gathering pattern
1. Verify official positioning from the product/repo homepage.
2. Cross-check the README for scope, supported platforms, and primary workflow.
3. Check package metadata or release metadata when available.
4. Keep only claims that are explicit in public sources.
5. If pricing is absent, label it as not publicly confirmed instead of guessing.

## Card content pattern
Investigation cards should usually include:
- one-line conclusion
- official positioning
- evidence chain
- what it solves
- who it is for / not for
- risks or constraints
- final judgment

## Publish / verify pattern
- Rebuild `_index.yaml` from all sidecars before pushing.
- If `git push` is rejected, `git pull --rebase`, rebuild the index again if it conflicted, then continue the rebase.
- After push, verify both:
  - raw GitHub content is present
  - public Pages URL is 200
  - the deployed `_index.yaml` contains the new slug

## When to preserve a report alongside the card
If the user says the task should include a “report” or the source requires non-trivial reasoning, always persist the report as `report.md` next to the public HTML. Do not discard the working notes into chat only.

## Common pitfalls
- A card without a sidecar may exist locally but be missing from the index.
- A detail page 200 is not enough if the homepage index is client-rendered.
- If the public page 404s briefly after push, retry before declaring failure.
- For investigation cards, do not publish only the card and forget the report bundle.
- If the project is clearly product/repo oriented, prefer this release pattern over a generic info-card-only publish.
