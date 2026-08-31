# Rebuild vs Expand vs Republish

This note captures a user correction that changes how infocard work should be interpreted.

## Core rule

When the user says **“重建”**, interpret it as:
- rewrite the page structure and CSS from scratch if needed
- keep the existing content unless the user explicitly asks to add/remove material
- do **not** silently expand content just because the page is being rebuilt
- do **not** describe the task as successful if the visible bug remains

## Practical implications

- A rebuild is a **source-generation** decision, not a content-growth decision.
- If the page still shows the reported bug after a rebuild, continue iterating on structure/CSS rather than assuming the act of rebuilding itself was sufficient.
- For tasks where the user stresses “信息不变少 / 内容不减少”, verify the visible text length (or another stable content-count proxy) before and after the rebuild.
- If the user explicitly asks for both rebuild and expansion, treat them as two separate requirements and confirm the expansion is intentional; otherwise keep the content invariant.

## Verification pattern

1. Capture the current visible text length or item count.
2. Rebuild the page with a new structure/CSS baseline.
3. Recompute the same content proxy.
4. If the proxy changed unexpectedly, inspect for accidental omissions or unintended expansion.
5. Only then proceed to publish.

## Common failure mode

Layering new styling onto an old skeleton can preserve the original mobile bugs. If the user says the bug is still visible, treat that as evidence the rebuild was incomplete, not as a reason to start adding content.