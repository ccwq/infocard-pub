# Theme gallery visibility + link delivery note

Session lesson captured from a BigWhite/OpenPi publish run.

## What happened

- A new infocard theme was added locally and the theme preview page existed in the repo.
- The public `themes.html` did not show the new theme until the generated artifacts were rebuilt and committed.
- A Pages workflow failed with `_index.yaml is out of date`, which blocked public visibility until `npm run build` regenerated `_index.yaml` and `index.html` and the new commit was pushed.

## Durable rules

1. When creating a new theme, update both the style skill and `_themes.yaml`, then rebuild `themes.html`.
2. If the public theme gallery is missing the new theme, check the generated index commit and Pages deployment before touching theme CSS again.
3. For infocard-related user-facing links, prefer Markdown clickable links instead of bare URLs.
4. Use the user's preferred LAN host when giving preview links: `10.6.8.14`.

## Verification cues

- Theme gallery page contains the new `infocard-*-style` entry.
- Public Pages workflow reports success for both verify and deploy.
- Public `_index.yaml` and `index.html` match the latest commit.
