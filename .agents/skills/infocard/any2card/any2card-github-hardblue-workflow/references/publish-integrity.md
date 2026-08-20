# Infocard publishing integrity notes

## Why a two-layer verification is required

A release machine can be behind `origin/main` while GitHub Pages already serves a newer card. A verifier that requires local sidecar metadata will then report a false release failure even if the deployed card and remote workflow are healthy.

Keep verification split:

1. **Pre-push/local**: validate the working-tree card bundle, generated index, content, assets, metadata timestamps, images, and mobile rendering.
2. **Post-publish/remote**: verify the exact pushed commit or `slug` using the deployed card URL and deployed `_index.yaml`; do not depend on the local sidecar being present.

## Release failure modes worth catching

- `HEAD` is behind `origin/<branch>`: stop and synchronize/rebase before using local state as a publication source.
- The index declaration count differs from actual card entries: release must fail; a passing index validator that misses this is insufficient.
- GitHub Pages deployment passes but card-specific content/assets/mobile checks were never part of the gate: report deployment as infrastructure-success only, not content-release acceptance.
- An “audit” commit message without a stored report or machine-readable check result is not evidence of a completed audit.

## Evidence to retain in the final report

- source commit SHA and target branch;
- GitHub Actions URLs and conclusions;
- exact deployed card URL HTTP result;
- deployed `_index.yaml` inclusion of the card slug/path;
- whether post-publish verification was performed against the exact remote ref or merely the local working tree.
