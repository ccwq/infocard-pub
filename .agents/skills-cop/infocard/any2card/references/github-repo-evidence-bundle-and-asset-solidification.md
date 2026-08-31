# GitHub repo evidence bundles and asset solidification

Use this pattern when turning a GitHub repository README into a technical/share card, especially when the repo ships charts, screenshots, hero images, or an adjacent benchmark repository.

## Evidence order
1. **README / raw README** — primary claim source.
2. **Benchmark or sister repo** — use for metrics, charts, or validation artifacts.
3. **Docs / feature pages / release notes** — for install flows, modes, and limits.
4. **Public HTML / browser DOM** — for verifying visible claims and images.

## Asset solidification
- If the README references a hero image, chart, or screenshot, download it locally into `docs/assets/images/<slug>/`.
- Prefer direct raw URLs when the image is already in the repo; otherwise fetch from the public page and save locally.
- Use the local relative path in the published HTML; do not hot-link GitHub user-attachments or remote chart URLs.
- When the repo README uses multiple visual assets, keep the first-fold image representative of the repo's main claim, not just the logo.

## Card framing
- If the repo bundles code + outputs + demo + benchmark, frame it as a **resource pack** or **workflow bundle**, not as a flat directory listing.
- Keep the title aligned to the repo's actual claim.
- In the first fold, answer: what it solves, how to start, what the outputs are, and what the limits are.

## Verification
- If GitHub API requests are rate-limited or return 403, fall back to raw README and public HTML.
- Verify the public card page and the public index separately after publish.
- For image-heavy repo cards, do a browser check that the local asset paths render before committing.
