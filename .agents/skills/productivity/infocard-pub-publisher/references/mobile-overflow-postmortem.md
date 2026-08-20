# Mobile overflow postmortem (infocard-pub)

Session lesson:
- For mobile clipping complaints, do not stop at `overflow-x: hidden` or smaller paddings.
- If the right edge still appears cut off on phones, reduce content density as well:
  - shorten long subtitles on mobile
  - stack grids earlier (`<= 720px`)
  - use smaller title/body typography for `<= 400px`
  - add a visible version pill in the header so cache can be ruled out quickly
- Prefer robust layout guards:
  - `min-width: 0` on grid children
  - `overflow-wrap: anywhere` for long labels/body copy
  - `width: 100%` with `max-width: min(780px, 100vw)` for the main page wrapper
  - `env(safe-area-inset-*)` on mobile padding when right-edge clipping persists
- When iterating on a page, verify the public GitHub Pages URL after pushing and compare version pill text to confirm the deployed asset is fresh.
