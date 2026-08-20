# Tool-card authoring notes

## Metadata shape

The infocard repository runs a metadata-shape pass over all sidecars. For a dated HTML file such as `docs/20260729-alacritty.html`, use `docs/20260729-alacritty.html.meta.yaml` and set:

```yaml
slug: 20260729-alacritty
path: docs/20260729-alacritty.html
```

A short project-only slug can produce a `slug mismatch` warning even when the card itself is valid.

## Verification behavior

`npm run check-leak` can finish cleanly while the full `npm run build` continues through repository-wide scans. Run the build with a sufficiently long timeout or as a tracked background process, then poll it to completion. A timeout is not a successful build.

When a build reports `fatal: path ... exists on disk, but not in 'HEAD'`, treat that as repository baseline/tracking state to inspect, not as evidence that the new HTML is malformed. Do not claim a publish-ready build until the process exits successfully.

## Content hygiene

For a CLI/tool card, keep the visual structure rich but distinguish official facts from estimates. GitHub star counts, memory figures, and startup benchmarks should be dated or marked approximate unless freshly verified from an authoritative source. Official README/docs are the preferred source for supported platforms, license, configuration, and feature boundaries.
