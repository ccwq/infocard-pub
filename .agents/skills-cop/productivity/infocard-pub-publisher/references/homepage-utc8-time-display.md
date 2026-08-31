# Homepage time display: Asia/Shanghai / UTC+8

## What happened
The homepage list in `infocard-pub` renders the index field `_modified_date` directly. If `_modified_date` is generated in UTC, the visible list time appears 8 hours early for a user expecting East 8 time.

## Rule
- Generate `_modified_date` as **Asia/Shanghai wall time (UTC+8)**.
- Keep source `date` semantics separate from homepage display time.
- After changing the index generator, verify both:
  - local `_index.yaml`
  - public `https://ccwq.github.io/infocard-pub/_index.yaml`
  - rendered homepage list text via browser/CDP

## Verification pattern
1. Rebuild index.
2. Confirm the target card's `_modified_date` is local UTC+8 time.
3. Push and wait for Pages.
4. Reload the homepage with cache bypass.
5. Check that the visible card row time matches the expected UTC+8 clock.

## Pitfall
Do not “fix” the visible time by adjusting only the card `date` field if the homepage is actually driven by `_modified_date`.
