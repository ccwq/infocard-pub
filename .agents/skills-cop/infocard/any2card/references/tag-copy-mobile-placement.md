# Tag copy + mobile placement notes

This note captures a pattern discovered while building prompt-expansion cards:

## When to use
Use this pattern when the card contains a *keyword pool* or *prompt expansion tags* that users are likely to copy individually.

## Required UX
- Render each tag as a real `<button>` or clickable control, not a plain `<span>`.
- Support both **single click** and **touch** copy.
- Put the copy payload in `data-copy`.
- Give immediate feedback: `✅ 已复制` / `❌ 失败`, then restore the label.
- Use `touch-action: manipulation` so mobile taps feel responsive.
- Add a short `dataset.copying` guard to prevent duplicate clipboard writes from rapid taps.

## Copy target rules
- If the tag already contains bilingual text (`EN / CN`), copy the combined string unless the user explicitly wants a language split.
- Prefer concise, reusable phrases, not long prose.
- Use the same tag text on-screen and in the copied payload when possible; if they differ, keep the copied payload in `data-copy`.

## Placement rule
If the keyword pool is the primary working surface of the card, place it **near the top**:
- after the hero / stats area
- before long explanatory blocks and template examples

This is especially important on mobile, where users need the reusable terms immediately visible without scrolling through long narrative sections.

## Common pitfall
Do not leave the keyword pool buried after the long template section. That makes the “copy-first” surface harder to reach and breaks the user’s expected reading/copy order.

## Minimal example
```html
<button class="copy-tag blue" data-copy="natural lighting / 自然光" onclick="copyTag(this)">
  natural lighting / 自然光
</button>
```

```css
.copy-tag {
  touch-action: manipulation;
  cursor: pointer;
}
```

```js
function copyTag(btn) {
  const text = btn.getAttribute('data-copy');
  if (!text || btn.dataset.copying === '1') return;
  btn.dataset.copying = '1';
  navigator.clipboard.writeText(text)
    .then(() => { /* update label */ })
    .finally(() => { btn.dataset.copying = '0'; });
}
```
