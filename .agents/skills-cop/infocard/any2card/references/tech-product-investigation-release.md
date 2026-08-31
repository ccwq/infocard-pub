# Tech product investigation release pattern

## Purpose
A compact playbook for publishing a *research report + public info card* bundle for GitHub / npm / official-product investigations.

## When to use
Use this pattern when the user asks to investigate and publish a software product, repo, CLI, plugin, or platform where evidence comes from:
- GitHub README / repo structure
- official website or docs pages
- package registry metadata when available
- release notes / tags / changelog

## Bundle contract
For these tasks, treat the output as one release bundle:
- `report.md` = full investigation report
- `index.html` = public card
- `index.html.meta.yaml` = required sidecar

All three should live in the same dated slug directory:
- `docs/YYYYMMDD-slug/report.md`
- `docs/YYYYMMDD-slug/index.html`
- `docs/YYYYMMDD-slug/index.html.meta.yaml`

## Research flow
1. Capture the official positioning from the repo or website.
2. Extract explicit features from README/docs; do not infer unsupported claims.
3. Note installation/runtime requirements if they are visible.
4. Identify the main workflow, target user, and boundary conditions.
5. Write the report first, then condense the same facts into the card.

## Card-writing guidance
- The card should be a decision aid, not a brochure.
- Include:
  - what it is
  - who it is for
  - what problem it solves
  - key features / modules
  - quick start / usage path
  - caveats / non-goals
- If the source has a strong slogan, keep it, but rewrite the title as a conclusion.
- If the source is clearly developer-focused, make the card feel like a technical brief, not marketing copy.

## Publication steps
1. Write `report.md`, `index.html`, and the `.meta.yaml` sidecar.
2. Rebuild `_index.yaml` with the repo script.
3. Verify the generated index before pushing.
4. If push is rejected, `git pull --rebase`, rebuild `_index.yaml` again if it conflicted, then continue the rebase.
5. After push, verify both:
   - raw source URL returns 200
   - public Pages detail page returns 200
   - the card is present in the deployed `_index.yaml`

## Common pitfalls
- Do not publish only the card and skip the report when the user explicitly asked for a report.
- Do not invent pricing, licensing, or business model details unless they are explicitly published.
- Do not call it “done” until both the report and the card are in the repo and the public path is reachable.
- If the repo homepage is client-rendered, verify the deployed index file and the rendered homepage separately.

## Support files
- `references/republish-rebase-recovery.md` — rebase and `_index.yaml` conflict recovery recipe.
- `references/card-vs-report-audit.md` — checklist for checking that the report and card stay aligned.
