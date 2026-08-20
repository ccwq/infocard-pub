# Revfactory/harness Q-style publish pattern

Session-derived publish recipe for GitHub repo technical cards rendered in Q-style.

## Core pattern
- Treat the repo URL as the source of truth for the technical card.
- Use `any2card` to build the visual card; do not fork a parallel infocard generation path.
- Keep repo facts and source links in the first fold.
- For repo cards, prefer a structure that explains: what it is, how it works, how to start, and what to watch out for.
- If the repo is being published to `infocard-pub`, verify three layers before declaring success:
  1. Public detail page is reachable.
  2. Public `/_index.yaml` contains the slug/path entry.
  3. Mobile screenshot shows the Q-style layout is readable and not clipped.

## Verification notes
- A detail page being 200 is not enough if the index is missing.
- A rendered homepage entry is not enough if the detail page is stale.
- For Q-style repo cards, mobile readability is part of acceptance, not a nice-to-have.
