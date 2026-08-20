# Info-card release contract for investigation-style cards

This note captures a repeatable release convention that emerged from the LLM pricing comparison card.

## Useful when
- The card is a comparison / investigation / survey summary.
- The user explicitly wants a published infocard, not just a text answer.
- Some fields are fully verified while other fields are only partially verified.

## Release contract
For every published comparison card, the final visual should pair:
1. **Strategy / method** — how the product is priced or operated.
2. **Fee / concrete numbers** — public unit prices, quota examples, or a clearly labeled lack of public pricing.

This avoids a common failure mode: listing pricing strategy without any actual fee information.

## Reporting rule
If an item has no stable public monthly/annual subscription price, the card should explicitly say one of:
- `未公开`
- `未稳定核到`
- `仅公开按量/配额策略`

Do not fill missing pricing fields with assumed values.

## Layout rule
For dense comparison cards:
- keep a compact top-line summary
- include one table for strategy visibility
- include a second section for concrete fees
- end with a short selection guide

## Why this matters
The user treats “strategy + fee” as a hard conclusion constraint for pricing investigations. The card should therefore surface both dimensions together rather than burying fee details in prose.
