# Visual Review Contract

## Routing matrix

| Primary result | Primary failure class | Next action | Overall state |
|---|---|---|---|
| Real `critical`/`major` defect | N/A | Repair the artifact; do not seek a second opinion to bypass it | `VISUAL_BLOCKED` |
| Complete pass for all required checks | N/A | Continue the current SOP | `VISUAL_PASSED` |
| No result / timeout / provider / capacity / capture / parse failure | Infrastructure only, retry budget remains | Differentiate the next attempt | Not terminal |
| Infrastructure-only failures exhausted | Static and identity gates green | Invoke ChatGPT Web `visual-review` | Fallback |
| ChatGPT Web structured pass for every required image | Valid result | Continue the current SOP | `VISUAL_PASSED` |
| ChatGPT Web `critical`/`major` | Real visual defect | Repair and restart the full visual gate | `VISUAL_BLOCKED` |
| Upload, send, response, parse, evidence failure, or `无法可靠判断` | Fallback infrastructure/evidence failure | Preserve the uncertainty | `VISUAL_PENDING` |

## Information-card standards examples

Use stable IDs supplied by the upper-level SOP. A typical mobile card set may include:

- `S1`: page identity and reviewed version are visible and correct;
- `S2`: title and hero are complete, readable, and not overlapped or clipped;
- `S3`: ordinary body cards stack correctly with readable spacing;
- `S4`: tables/matrices are readable through a local scroll container or a clear mobile card representation;
- `S5`: no global horizontal overflow at the required mobile viewport;
- `S6`: fixed/floating controls do not obscure meaningful content;
- `S7`: page end and footer are complete, with no clipping.

The exact set belongs to the information-card SOP and should be adapted to the actual page.

## WeChat article standards examples

The WeChat SOP should define its own stable IDs, for example:

- `S1`: article title and draft identity match the intended version;
- `S2`: cover image is bound, visible, and cropped acceptably in the relevant preview;
- `S3`: body image count, order, size, and positions match the draft record;
- `S4`: typography, headings, paragraphs, quotes, tables, and code blocks remain legible;
- `S5`: mobile preview has no critical clipping, overlap, or blocked content;
- `S6`: final published page, when accessible, matches the verified draft identity and media set.

The exact set belongs to the WeChat publishing SOP.

## Aggregation pseudocode

```text
for each required viewport_or_region:
    result = executor.visual_review(image, standards, perfect_result)
    if result.status == VISUAL_BLOCKED:
        return VISUAL_BLOCKED
    if result.status == VISUAL_PENDING:
        pending = true

if pending:
    return VISUAL_PENDING
return VISUAL_PASSED
```

Aggregation must reject missing viewports, identity mismatches, malformed reports, incomplete standard coverage, and any result that is only a generic impression. `minor` defects remain in the evidence even when the aggregate state passes.

## Evidence minimum

Record only redacted operational facts:

- reviewer source;
- object identity/version;
- viewport/region;
- timestamp;
- standard IDs and results;
- defects and levels;
- aggregate state;
- screenshot hash;
- cleanup result.

Never persist prompts, cookies, account identifiers, private chat URLs, credentials, or full chat transcripts.
