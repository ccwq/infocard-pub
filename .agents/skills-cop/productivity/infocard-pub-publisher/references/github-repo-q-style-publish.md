# GitHub repo Q-style publish pattern

Session note: published a Q-style technical infocard for `revfactory/harness`.

## Use case
Use this pattern when the source is a GitHub repository and the user wants a high-density, editorial Q-style infocard rather than a plain repo summary.

## Source-of-truth order
1. Repository README / raw repo files
2. GitHub API metadata if available
3. Public rendered repo page as fallback evidence

Do not let the visual style override the repo facts. The card should still answer:
- what the repo is for
- what problem it solves
- how to use it
- what makes it noteworthy
- who should care

## Q-style composition for repo cards
- Hero: repo name + one-line positioning + visual accent
- Fact chips: language / framework / maintainer / stars or activity if relevant
- Core sections: overview, workflow, best use cases, caveats, and quick start
- Keep the layout dense but readable; do not flatten it into a generic product poster
- If the repo is tool- or workflow-heavy, prefer recipe cards / grouped blocks over long prose

## Publish checks
- Public detail page reachable after deploy
- `/_index.yaml` contains the new slug
- Homepage renders the new entry after deploy
- 390px viewport has no horizontal overflow
- Worktree is clean before closing

## Notes
- Q-style is a visual system, not a license to blur technical details.
- For repo cards, preserve exact repo identity and source links in the first fold.
- If the repo card includes screenshots or diagrams, solidify local assets before publishing.
