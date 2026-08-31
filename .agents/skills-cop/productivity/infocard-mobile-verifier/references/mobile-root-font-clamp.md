# Mobile readability case: API mid-station investigation card

## What happened
A published infocard looked fine on desktop but on 390px mobile the text was still too small.

## Root cause
The page set the root font size as:
```css
html { font-size: calc(100vw / 72); }
```
That ties the whole page typography to viewport width, so on narrow screens the entire card shrinks too much.

## Fix pattern
Replace viewport-linear root sizing with a bounded clamp:
```css
html { font-size: clamp(15px, 3.8vw, 16px); }
```
Then bump mobile typography in the narrow-screen media query:
- title: ~1.8rem or larger
- body: ~1rem
- list / note text: ~1rem
- section spacing: compress a bit, but do not reduce readability

## Verification
On 390px mobile:
- title computed font size was 24px
- body / subtext / lead text were 15px
- `document.documentElement.scrollWidth` stayed within the viewport
- visual check showed no obvious horizontal clipping

## Takeaway
For infocards, “responsive” is not enough. Mobile legibility must be verified with actual computed font sizes, not just layout structure.