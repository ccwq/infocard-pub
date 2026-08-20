# Full catalogue / resource-pack cards

Use this pattern when the source is a bounded but exhaustive inventory (palette library, icon set, font pack, component library, dataset manifest, tool registry, resource pack).

## When to apply
- The source README or master list claims completeness (e.g. "742 colours", "all icons", "complete pack").
- The user explicitly asks for "all", "complete", "full list", "每一个", "全部展开".
- The value of the card is the catalogue itself, not a sampled showcase.

## Rules
1. **Do not sample away the inventory.** If the source is exhaustive, the card must preserve the full item count and item order unless the user asks for a summary only.
2. **Keep a compact overview, but not at the expense of completeness.** Start with a short hero summary, then provide an indexed full list or grouped catalogue.
3. **Use authoritative counts.** Prefer README/master-list counts or parsed source totals over eyeballing visible sections.
4. **Preserve source order.** For palettes or libraries, order by the source list, not by aesthetic grouping, unless the user explicitly wants re-clustering.
5. **Provide navigation aids.** Add section anchors, index ranges, or grouped buckets so the large inventory remains usable on mobile.
6. **State the source of completeness.** Make it obvious whether the card is showing a complete catalogue, a curated subset, or a representative sample.

## Common pitfall
- Turning a complete inventory into a four-card sampler. That is acceptable only when the user asked for highlights or previews.

## Practical verification
- Check the rendered count against the parsed source count.
- If the source promises completeness, confirm the card title/body also reflects that completeness.
- If the source is huge, use grouped ranges rather than dropping items.
