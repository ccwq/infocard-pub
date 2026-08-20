# Publish Batch Manifest

## Purpose

Freeze the candidate set before a shared-worktree batch build. The manifest prevents stale files, failed cards, and unrelated edits from entering the build or staged set.

## Location and lifecycle

Write the manifest under `.tmp/publish-batches/<batch-id>.json`. It is process evidence and is never staged or committed.

Create it only after each candidate has:

1. a passed bundle gate;
2. a passed agent2 local card gate; and
3. an individual local commit.

## Minimum shape

```json
{
  "batch_id": "20260716-143000",
  "candidates": [
    {
      "slug": "example-card",
      "bundle_path": ".tmp/publish-bundles/example-card.json",
      "agent2_gate": {"command": "node scripts/verify-card-content.js --bundle ...", "exit_code": 0},
      "local_commit": "abc1234",
      "allowlist": [
        "docs/20260716-example-card.html",
        "docs/20260716-example-card.html.meta.yaml",
        "assets/img/example-card/manifest.json"
      ]
    }
  ],
  "excluded": [
    {"slug": "failed-card", "phase": "agent1", "reason": "manifest assets missing"}
  ]
}
```

Paths must be repository-relative, normalized, and free of absolute paths or `..` traversal. `allowlist` comes from the validated bundle. The generated `_index.yaml` and `index.html` are added only after build; they are shared batch artifacts, not per-card inputs.

## Two validations

### Before build

For every candidate:

- re-run `verify-bundle`;
- confirm the recorded local commit still contains its allowed source files;
- confirm agent2's recorded gate exit code is 0; and
- confirm no excluded slug appears in candidates.

### Before exact stage and push

Repeat the above and verify that the actual staged paths equal:

```text
union(candidate allowlists) + _index.yaml + index.html
```

`assets/img/<slug>/**` is permitted only for the candidate that declared that asset directory. `.tmp/`, artifacts/screenshots, `.hermes/`, and unrelated dirty files always remain outside the staged set.

## Failure disposition

- Candidate mismatch: remove that card from the frozen set, record the reason, and repeat validation for the remaining cards.
- Shared generated-artifact mismatch: rebuild once from the frozen candidates; if it persists, stop the batch.
- An excluded card becoming green after freeze does not join the current batch. It enters the next batch.

## Completion criterion

The manifest is valid twice, the candidate set is unchanged between validations, and the staged set has no path outside the computed allowlist.
