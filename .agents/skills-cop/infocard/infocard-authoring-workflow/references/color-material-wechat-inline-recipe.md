# Color Material → WeChat inline recipe

## Scope

Use when converting a Color Material editorial/web preview into HTML that can be pasted into the WeChat editor. Preserve the visual grammar while removing browser-only layout dependencies.

## Verified recipe

1. Keep the visual anchors: warm paper background, dark console hero, colored capability nodes, lifecycle block, dark summary rail.
2. Replace the web preview's grid/flex-heavy layout with natural document flow:
   - capability nodes become single-column `section` cards;
   - lifecycle steps become a vertical sequence inside a dark panel;
   - use explicit margins, borders, padding, and background colors rather than responsive CSS.
3. Use only inline styles. Do not carry over `<style>`, `<script>`, `class`, `id`, CSS variables, media queries, gradients, transforms, positioned elements, `grid`, `min-width`, or negative margins.
4. Use a conservative tag set: `section`, `span`, `strong`, `h3`, and `h4`. Use `span` for body text instead of relying on browser defaults from `p`.
5. Add `leaf=""` to every `span`, including labels, arrows, metrics, and editorial notes.
6. Make contrast semantic: dark panels use `#F7FAFC` for body text; light cards use `#2D3748` or darker. Do not use muted gray for long body copy.
7. Root wrapper should use `width:100%;max-width:677px` plus safe horizontal padding.

## Deterministic checks

Run a parser check that verifies:

- all tags are closed;
- only the conservative tag set is used;
- `span_count == leaf_count`;
- every `span` has `leaf=""`;
- only `style` and `leaf` attributes appear;
- no forbidden browser-only terms occur.

The checked artifact from the reference session was `/tmp/redswiss-stage/color-material-editorial.wechat.html`; it parsed with zero errors after adding missing `leaf=""` markers to all spans. The initial draft had only 58 leaf markers for 91 spans, so count equality is a useful guard against silent omissions.

## Pitfalls

- Do not mistake the preview HTML's structural CSS for the paste-ready artifact. A preview can legitimately use classes, variables, media queries, and flex; the WeChat body cannot rely on them.
- A single-column mobile fallback is not a theme failure if the semantic anchors remain visible; it is the safer compatibility form.
- Static parser checks do not prove visual rendering. Keep visual preview and static compatibility as separate gates when the publishing workflow requires screenshots.
