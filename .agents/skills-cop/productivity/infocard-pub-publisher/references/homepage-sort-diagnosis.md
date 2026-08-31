# Homepage sort diagnosis (session note)

Use this note when a user reports that a newly published card is not appearing at the top of the `infocard-pub` homepage list.

## Observed behavior

- The homepage is client-rendered from `assets/home/index.js`.
- Cards are normalized and sorted in JavaScript before rendering.
- The sort key is not simply the display `date` field.

## Sort precedence observed in the current app logic

1. `updated` / `updated_at`
2. `date`
3. filesystem / source mtime via `_sort_ts` in `_index.yaml`
4. title / slug tie-breakers

In the current implementation, `_index.yaml` is built from source metadata and the homepage then sorts by the derived time metadata (`__time.ts`, `__time.rawTs`). That means a card can be “newly published” but still appear lower if its metadata date is older than other cards.

## Investigation recipe

When the user says “latest card did not go to the top”:

1. Verify the card exists in `_index.yaml` and note its rank.
2. Inspect the card’s `date`, `updated`, and `_sort_ts` values.
3. Check the homepage JS sort logic to determine whether it uses business time or publish time.
4. Distinguish between:
   - index not updated
   - homepage cache stale
   - sort key mismatch (most common when publish order and content date differ)

## Practical takeaway

If the product expectation is “publish time should always be top,” the fix is not in the sidecar alone; the homepage sort contract must be changed to use a publish-time source, and the current behavior should be documented so future investigations check the right layer first.
