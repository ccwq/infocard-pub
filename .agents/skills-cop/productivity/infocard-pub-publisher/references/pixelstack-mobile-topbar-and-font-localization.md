# Pixelstack mobile topbar and font localization

Use this reference when a pixelstack card needs mobile hardening or a stronger pixel-art language.

## Trigger signals
- user reports topbar dots touching or overlapping text on mobile
- user wants stronger pixelstack / pixelized feel
- user asks to localize English fonts but leave Chinese fonts unchanged

## Proven fix pattern
1. Keep the card's existing Chinese text stack unchanged.
2. Self-host the English display and mono fonts in `assets/fonts/` and reference them with `@font-face`.
3. Use the display font for English headlines, numbers, and key labels.
4. Use the mono font for meta rows, tags, and technical labels.
5. Add a subtle pixel-grid overlay inside the hero/stage area, not a global heavy noise layer.
6. On mobile, convert the topbar to a stacked layout and give the left brand row a fixed separation from the pixel-dot trio.
   - recommended mobile layout:
     - `.topbar { flex-direction: column; align-items: flex-start; }`
     - `.topbar > div:first-child { display: grid; grid-template-columns: max-content minmax(0, 1fr); column-gap: 34px; }`
     - `.topbar .pixel-dot { margin-right: 0; }`
7. Verify with a 390px screenshot and a desktop screenshot before publishing.

## Why this works
- The 34px gap clears the full visual width of the 3-dot box-shadow chain on narrow viewports.
- Local fonts let the pixelstack family keep a stable visual identity across future cards.
- Keeping Chinese fonts unchanged avoids introducing unnecessary glyph regressions.

## Avoid
- Do not treat the pixel-dot trio as mere decoration; it is layout-affecting.
- Do not “fix” the issue by shrinking all text globally.
- Do not swap in a new Chinese font unless the user explicitly asks.
- Do not call the card fixed until the rendered mobile screenshot is clean.
