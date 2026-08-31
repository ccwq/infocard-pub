# GitHub repo → handline-style card workflow

Session pattern: `Claude-Code-Game-Studios`.

## What worked

1. Use the GitHub API first for structured facts.
   - stars, forks, license, description, topics, updated_at, pushed_at, default_branch
2. Read the README for the narrative layer.
   - Use the opening paragraphs to derive the lead if the API description is weak or generic.
3. For workflow / orchestration / agent-studio repos, prefer `infocard-handline-style` when the repo story is about roles, coordination, and process maps.
4. Build the card around a few strong blocks rather than a feature dump:
   - hero + summary
   - compare box (ordinary single session vs studio/process system)
   - step/process stack
   - studio hierarchy or role map
   - include a short “how it works” section
5. If the visual hero is unnecessary or brittle, use pure CSS/SVG handline composition instead of external images.
6. Publish via the standard repo flow:
   - write HTML + meta
   - `npm run build`
   - `npm run verify`
   - commit
   - `GIT_HTTP_VERSION=HTTP/1.1 git push`
   - wait for Pages propagation
   - verify the live URL returns `HTTP 200`
   - confirm `_index.yaml` contains the slug

## Practical notes

- This style is especially good for “many roles, many steps, clear coordination” products.
- Keep the card legibility-first; the hand-drawn frame should support structure, not obscure it.
- The live verification should include the index file, not just the detail page.
