# VS Code Marketplace 2026 card build notes

This note captures the session-specific learnings from the `vscode-marketplace-extensions-2026` card so future infocard authoring can reuse the same workflow without re-discovering the details.

## Source mix used successfully

- **L1 market snapshot**: `extensionstats.dev` for installs / ratings / 7-day growth on VS Code Marketplace.
- **L1 open-registry snapshot**: `vsx-pulse.org` for Open VSX 30-day download counts.
- **L1 registry / infrastructure context**: Eclipse Open VSX announcement and Visual Studio Magazine coverage for registry scale and role.
- **L2 trend context**: LinkedIn analysis (`marinelamiclea`) for four-year install tracking and the Copilot-free-plan growth acceleration claim.
- **User-provided verified snapshot**: install / rating / growth figures for the top extensions.

## What worked

1. **Write HTML directly, then write meta sidecar, then build**.
2. **Use `overflow-x:auto` wrappers around dense tables** so the mobile layout stays readable.
3. **Keep every number bound to a source label in the prose or table footnote**; don’t leave isolated “hero metrics” without provenance.
4. **Use a red/black diagonal hero for marketplace/tool-ecosystem cards**; it fits multi-tool comparison better than a single-product mockup.

## Build / commit behavior to remember

- Fresh cards may trigger a build log line like `path ... exists on disk, but not in 'HEAD'` for the new sidecar before the first commit. That is normal for an untracked card and **not** a failure by itself.
- `npm run build` can succeed even if the repo emits unrelated pre-existing `fix-meta-shape` warnings for old cards. Treat those as ambient repo noise unless the current card is affected.
- After build, commit the HTML, sidecar, `_index.yaml`, and `index.html` together.
- If you need to inspect build output for a fresh card, verify the new HTML path, the sidecar path, and the generated index files rather than chasing unrelated warnings.

## Good structure for future marketplace cards

- Section 1: market overview and registry split.
- Section 2: AI tool leaderboard with installs / rating / 7-day growth / one-line interpretation.
- Section 3: stable developer tools.
- Section 4: language / LSP ecosystem.
- Section 5: comparison matrix with capability axes.
- Section 6: trend signals.
- Section 7: data provenance and evidence layering.

## Reusable reminder

If a card mixes Marketplace and Open VSX data, explicitly distinguish:

- **distribution reach** (Marketplace)
- **vendor-neutral compatibility** (Open VSX)
- **trend interpretation** (third-party / community analysis)

That separation keeps provenance clean and avoids blending infrastructure facts with commentary.