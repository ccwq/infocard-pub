# RedSwiss rebuild verification note — Open Design 2026-06-16

## Context

A hardblue Open Design card was rebuilt from current GitHub README/API/Releases using `infocard-redswiss-style`. The rebuild exposed two reusable checks for future RedSwiss cards.

## Durable lessons

1. **Template font sizes are not release-safe by default**
   - RedSwiss examples may use 8–10px meta subtitles and table labels.
   - For published cards, all visible text should be `>= 11.2px`, including `.sub`, `.kicker`, `.tagline`, table headers, flow captions, and small metadata pills.
   - Verify with a computed-style DOM audit at 390px, not by reading CSS manually.

2. **Pure red/black requires a literal token audit**
   - Search the final HTML/CSS for `--blue` and accidental blue/yellow/green helper variables.
   - Passing visual inspection is not enough; a stale variable can survive even if the page looks red/black.

3. **Local and public 390px checks should use the same fields**
   - `innerWidth`
   - `document.documentElement.scrollWidth`
   - `document.body.scrollWidth`
   - `overflow = scrollWidth > innerWidth`
   - `minFont`
   - list of small text nodes `< 11.2`
   - image natural dimensions and `complete` state

## Example CDP expression

```js
new Promise(r => setTimeout(() => {
  const els = [...document.querySelectorAll('body *')];
  let min = 99, small = [];
  for (const el of els) {
    const text = (el.innerText || '').trim();
    if (!text) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < min) min = fs;
    if (fs < 11.2) small.push({
      tag: el.tagName,
      cls: String(el.className),
      fs,
      text: text.slice(0, 60)
    });
  }
  r({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyW: document.body.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    minFont: min,
    small: small.slice(0, 20),
    imgs: [...document.images].map(img => ({
      src: img.currentSrc || img.src,
      w: img.naturalWidth,
      h: img.naturalHeight,
      complete: img.complete
    }))
  });
}, 1200));
```
