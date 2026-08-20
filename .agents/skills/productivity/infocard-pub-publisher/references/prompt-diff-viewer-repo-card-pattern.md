# Prompt-diff / version-history repo card pattern

Use this pattern when the source project is a repository or site whose value comes from tracking prompt evolution, config diffs, or versioned CLI behavior.

## Core narrative spine

1. **Behavior interface** — explain that the prompt or config is the machine-facing contract.
2. **Capture pipeline** — show how the project extracts or records the artifact (CLI install → capture → normalize → archive).
3. **Evidence layers** — separate reader-facing snapshots, raw trace evidence, and metadata/index files.
4. **Diff/viewer layer** — the UI is for inspection; the archive/index is the source of truth.
5. **Long-running maintenance** — note the automation cadence and what gets refreshed on each new version.

## Recommended section order for a technical-manual card

- Core claim
- Capture chain / pipeline
- Artifact triad (readable snapshot / raw trace / metadata)
- Supported agents or targets
- Real interface screenshot
- Fit / not fit

## Style rules

- Prefer a manual/ops tone over a marketing tone.
- Use a short code block or flow diagram to show the capture chain.
- Include one screenshot of the diff or viewer UI if the repo has one.
- Call out why the repo is useful to auditors, maintainers, or future comparisons.

## Pitfalls

- Do not describe it as a generic landing page if the project is fundamentally an archive or diff viewer.
- Do not bury the evidence model behind feature lists.
- Do not omit the source URLs / repo URL when the card is meant to be auditable.
- When the project has a UI screenshot, keep a local copy under `docs/assets/images/<slug>/` and reference that file from HTML.
