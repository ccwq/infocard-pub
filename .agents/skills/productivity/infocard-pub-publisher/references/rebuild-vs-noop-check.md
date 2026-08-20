# Rebuild vs Noop Check

When the user asks to "redo in X style" or "recreate", always do this check before regenerating:

## Checklist

1. **List existing slugs** in `_index.yaml` that match the topic
2. **Fetch the published HTML** via `curl -s https://ccwq.github.io/infocard-pub/docs/<slug>.html`
3. **Inspect the style** — check CSS variables, color tokens, font stack, layout pattern
4. **Compare against requested style**:
   - Swiss red-black: look for `--red:#E60012`, `.bar` header, `--black:#000`
   - Q style: look for `--paper:#f8efd9`, `--radius:22px`, `.pill` chips
   - Green style: look for `--green:#5db075` or similar

## Decision tree

| Finding | Action |
|---|---|
| Card already exists AND matches requested style | Report finding; ask user "still rebuild?" |
| Card exists but wrong style | Proceed with rebuild |
| Card does not exist | Proceed with generate |
| Multiple cards exist for same topic | Report both; ask which to keep |

## Quick verify command

```bash
# Check if a slug already exists and what style it uses
curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | grep "<slug>"
curl -s "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | grep -o '"--red\|--paper\|--green"'
```