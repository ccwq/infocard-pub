# Mobile width regression notes for infocards

## Symptom
A card looks like a narrow centered column on phone-sized viewports, even when there is no obvious horizontal overflow.

## Common cause found in session
- Mobile media query set `.page { width: calc(100vw - 7rem); }` or another artificially reduced width.
- Large side padding on the main wrappers, e.g. `padding-right: 5rem`, can make the page feel like a desktop card squeezed into mobile.
- The result is not necessarily `scrollWidth > clientWidth`; the page can be internally consistent but visually too narrow.

## Fix pattern
1. In `@media (max-width: ...)`, set the main container back to `width: 100%; max-width: 100%;`.
2. Reduce wrapper side padding to normal mobile values (`~0.9rem-1rem`).
3. Keep the grid collapse (`2-col -> 1-col`) and font-size changes, but do not shrink the content column itself.

## Verification pattern
- Check both visual appearance and computed width.
- Useful probe:
  - `window.innerWidth`
  - `.page.getBoundingClientRect().width`
  - `document.body.scrollWidth` / `clientWidth`
- If the page is visually narrow but not overflowing, inspect the mobile media query first.

## Pitfall
Do not confuse “mobile-safe margins” with “page narrowed for no reason.” The latter is a layout bug even when the page still fits the viewport.
