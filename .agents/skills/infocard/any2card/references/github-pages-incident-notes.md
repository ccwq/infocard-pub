# GitHub Pages / Actions incident notes for infocard-pub

## Symptom pattern
- `pages.yml` run shows `Failed to queue workflow run. Please try again.` on manual dispatch.
- Pages URL returns 404 while the HTML file is present in `raw.githubusercontent.com`.
- GitHub Actions run details show `Internal server error` and annotations like:
  - `Failed to download archive 'https://codeload.github.com/actions/configure-pages/tar.gz/...` after 1 attempts
  - `An action could not be found at the URI 'https://codeload.github.com/actions/configure-pages/tar.gz/...'`
- GitHub Status incident page may report degraded performance for Actions and Pages and authentication issues leading to failed Actions starts/downloads.

## Diagnosis order
1. Confirm the HTML is present in `raw.githubusercontent.com`.
2. Check the latest Actions run for the deployed SHA and failure annotations.
3. Check GitHub Status for Actions/Pages incidents before changing the repo.
4. Treat a 404 on the Pages URL as a deployment/platform issue when raw content is correct.

## Recovery pattern
- Retry after GitHub recovers.
- Re-run the workflow or push a harmless commit only after the incident clears.
- Do not spend time rewriting the card if raw content already matches the intended HTML.

## Verification shortcuts
- `curl -I https://ccwq.github.io/infocard-pub/docs/<slug>.html`
- `curl -s https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/<slug>.html | head`
- `curl -s https://api.github.com/repos/ccwq/infocard-pub/actions/runs?per_page=5`
- GitHub Status page for Actions and Pages incidents
