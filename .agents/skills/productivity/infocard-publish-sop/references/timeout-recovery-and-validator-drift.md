# Timeout Recovery and Validator Drift

## Why this exists

A delegated infocard agent can time out after writing useful artifacts, and repository validators can enforce fields not obvious from the high-level bundle contract. Treat both as evidence and compatibility problems, not as reasons to discard work.

## Bounded recovery checklist

1. Inspect the shared worktree first:
   - `git status --short --untracked-files=all`
   - target files and byte sizes
   - candidate-specific diff/status
2. Confirm whether the agent respected its role boundary: no HTML/meta/Wiki for Agent1; no build/commit/push for either upstream agent unless explicitly authorized.
3. Read and run the repository's actual validators. Do not infer behavior solely from the SOP text.
4. If usable artifacts exist, reuse them. Repair only the smallest missing file or field.
5. Re-run both the bundle gate and the agent delivery gate before starting the dependent stage.
6. Keep unrelated uncommitted cards, generated indexes, `.tmp/`, screenshots, and assets outside the current candidate's allowlist.

## Validator compatibility drift

A richer facts schema may contain `claim_records`, provenance, source tiers, inferences, and unverified items while an older or local validator still requires a simple top-level `claims` string array. Add a derived compatibility field from the already-supported facts; do not replace the richer records or shorten claims merely to satisfy the matcher.

The same pattern applies to missing `source_url`, explicit empty asset manifests, or mechanically required paths: preserve semantic fields and add the minimum validator-facing representation.

## Evidence order after timeout

Use this order before retrying or reporting failure:

```text
worktree status/diff → target files → actual gate scripts → gate output → local commit/log → remote/public URL
```

If target artifacts or a candidate commit exist, reuse the partial result and perform the smallest bounded repair. Do not redelegate the same card until this inspection proves there is no reusable output.

A timeout is not PASS and is not proof of zero output. The final status comes only from fresh file inspection and real gate output.
