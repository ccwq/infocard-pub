# Dense Source-List Cards: Chinese-first link + intro pattern

Session pattern captured from republishing `17 Free Claude Guides`.

## When this pattern applies
- The card is mainly a list of external resources.
- The user asks to "make it Chinese", "use links for each item", or "add one sentence introduction for each item".
- The source list is dense enough that plain titles/URLs are not enough for quick scanning.

## Durable pattern
1. Translate visible UI text into Chinese first:
   - title
   - subhead / kicker
   - section headings
   - stats labels
   - footer labels
2. Keep each list item clickable.
3. Add a one-sentence intro under each item explaining:
   - who it is for
   - what problem it solves
   - why it belongs in the set
4. If the source is truncated or incomplete, do **not** invent certainty.
   - Keep the item clickable if a safe canonical source exists.
   - Mark the item as a placeholder / 待核实 if the exact link or title cannot be recovered.
5. Keep the first fold short and high-signal.
   - A Chinese summary line should tell the user what the card is in one glance.
   - Dense detail belongs in the list body, not in the headline.

## Good item shape
- `title` as the clickable label
- `url` or domain line as a second-line reference
- `intro` as a single sentence

Example intent:
- `Claude Code` — a link to the post
- `讲的是如何把 Claude 放进终端和开发流程里，提升编程协作效率。`

## Pitfall
- Do not leave the card in a purely English / raw-source state when the user explicitly asked for中文化.
- Do not expand every item into a paragraph; keep the one-sentence intro compact.
- Do not silently replace truncated source entries with guessed exact URLs.
