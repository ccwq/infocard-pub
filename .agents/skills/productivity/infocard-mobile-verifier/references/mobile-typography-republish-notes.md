# Mobile typography republish notes

Session-specific notes for info-card mobile verification and republish debugging.

## What happened
- A published infocard could pass a quick visual check yet still have **mobile text that is too small** on the public Pages URL.
- In this session, the page looked structurally fine on 390px width, but computed styles showed the **tool-body text remained around 13px**, which was not enough for the user’s readability target.

## Practical lesson
When the user says the card should be:
- **文字大小合适**
- **不可缩放**
- **内容完整**
- **布局精美**

Do not stop at:
- “no overflow”
- “no clipping”
- “the layout looks okay”

Also verify:
- root `font-size`
- headline vs body size ratio
- body copy in long sections (`.tool-body p`, comments, notes, footer/source)
- whether mobile rules are actually taking effect on the public URL

## Verification pattern
Use a 390px viewport and check computed styles for at least:
- title
- subtitle
- summary body
- comment text
- tool body text
- footer/source text

A page should be considered **too small** if body text is still visually phone-readable only after zooming.

## Effective fix pattern
A safe first-pass mobile readability bump is:
- increase mobile root font size with a floor, not a purely proportional shrink
- enlarge long-form body text more than metadata chips
- keep the layout single-column where needed, but do not rely on layout changes alone to fix readability
- reduce padding only after typography is legible

## Pitfall
A browser snapshot can show the right structure while computed styles still reveal a desktop-leaning scale.
In that case, treat it as a **typography failure**, not a layout failure.

## Related checks
- Public Pages URL vs raw source may differ because of caching; verify both when typography appears unchanged.
- If the user’s complaint is specifically about small text, prioritize typography adjustments before any broader redesign.
