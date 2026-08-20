# Batch `content.json` Authoring Contract

## Purpose

Use this contract for multi-card infocard batches when stable, predictable recovery matters more than maximizing the number of concurrent HTML writers.

The Author owns **content only**. The main thread owns deterministic rendering, metadata, build, integration, release, verification, and cleanup.

## Ownership

| Owner | Writes | Must not write |
|---|---|---|
| Research | compact facts handoff, source verdicts | card prose, theme HTML, Git state |
| Author | one run-local `content.json` | HTML, Markdown, meta YAML, indexes, timestamps, Git |
| Main renderer | HTML, Markdown, meta YAML, declared manifest | new unsupported facts |
| Publisher | generated indexes, commits, push, public evidence, audit | author prose expansion |

One target file has one writer at a time. The Author and main renderer never write the same file.

## Location

```text
/tmp/infocard-runs/<run-id>/<slug>/author/content.json
```

This file is run evidence and input to rendering. It is not copied into the published repository unless a bundle explicitly declares it as a public artifact.

## Minimal schema

The Author must persist this minimal valid document before adding detail:

```json
{
  "schema_version": 1,
  "slug": "example-tool",
  "title": "Example Tool：一句清楚的中文定位",
  "summary": "一句话说明解决的问题、核心机制与适用对象。",
  "sections": [],
  "code_blocks": [],
  "comparison_rows": [],
  "source_claim_ids": [],
  "boundaries": [],
  "status": "PARTIAL"
}
```

Required types:

- `schema_version`: integer, currently `1`
- `slug`, `title`, `summary`: non-empty strings
- `sections`, `code_blocks`, `comparison_rows`, `source_claim_ids`, `boundaries`: arrays
- `status`: `PARTIAL` or `COMPLETE`

The renderer must reject a slug that differs from the frozen bundle.

## Complete schema example

```json
{
  "schema_version": 1,
  "slug": "example-tool",
  "title": "Example Tool：把重复配置收束成一条工作流",
  "summary": "面向开发者的工具说明卡，解释机制、上手路径、边界和适用场景。",
  "hero": {
    "kicker": "DEVELOPER TOOL · WORKFLOW",
    "badges": ["Open Source", "Local First"]
  },
  "sections": [
    {
      "id": "problem",
      "heading": "它解决什么问题",
      "body": ["第一段。", "第二段。"],
      "claim_ids": ["claim-01"]
    },
    {
      "id": "workflow",
      "heading": "工作流",
      "steps": ["配置", "运行", "验证"]
    }
  ],
  "code_blocks": [
    {
      "language": "bash",
      "label": "Quick start",
      "code": "example --help",
      "claim_ids": ["claim-02"]
    }
  ],
  "comparison_rows": [
    {"dimension": "配置", "before": "多个入口", "after": "统一入口"}
  ],
  "source_claim_ids": ["claim-01", "claim-02"],
  "boundaries": ["基准数字来自项目官方说明，不能写成普遍保证。"],
  "status": "COMPLETE"
}
```

## Author sequence

1. Read only the frozen bundle and compact facts handoff. Do not read the full theme HTML.
2. Write the minimal valid `content.json` immediately with `status: PARTIAL`.
3. Add sections incrementally. Rewrite the whole JSON atomically after each meaningful section so the file is always parseable.
4. Reference facts through bundle claim IDs. Do not introduce unsupported metrics, release claims, security promises, or license conclusions.
5. Set `status: COMPLETE` only after every bundle-required section and boundary is represented.
6. Return the absolute file path, byte size, mtime, status, and missing fields. Do not report “done” without those handles.

## Deterministic renderer contract

The main renderer receives:

```text
content.json + publish-bundle.json + registered theme
```

It produces in the unique integration worktree:

- declared HTML;
- companion Markdown;
- repository-compatible sidecar metadata;
- declared manifest/assets;
- no generated index until the batch artifact gate is green.

Renderer rules:

1. Validate `content.json` before creating any artifact.
2. Resolve all `source_claim_ids` against the frozen bundle; unresolved IDs block rendering.
3. Escape HTML content and preserve code blocks exactly.
4. Apply mobile behavior from the registered theme/renderer, not free-form Author CSS.
5. Do not accept publication timestamps from `content.json`; final date/updated values come from the single integration build.
6. Render all cards first, then run one batch build to regenerate `_index.yaml` and `index.html`.

## Timeout recovery tree

```text
Author timeout
├─ content.json exists and schema-valid
│  ├─ status COMPLETE → render normally
│  └─ status PARTIAL → identify missing required fields and minimally complete them
├─ content.json exists but invalid JSON
│  ├─ recent valid backup/atomic temp exists → restore and continue
│  └─ no valid form → extract only clearly recoverable fields, then rewrite once
└─ no content.json
   └─ main thread generates it from the frozen facts; do not re-dispatch by default
```

Before takeover, record:

- path;
- byte size;
- mtime;
- JSON parse result;
- `status`;
- present and missing required sections.

Never create a second Author for the same `content.json` while the first still has write authority.

## Batch integration

For a multi-card release:

1. Research/Author work may run in parallel.
2. Only one integration/publish worktree is created from fresh `origin/main`.
3. The main renderer creates all declared card artifacts there.
4. Run one build, one verify/taxonomy/leak pass, one consolidated diff audit, and one staged allowlist check.
5. Apply per-card conditional visual gates before push.
6. Make one content commit and one push for the batch unless a repository rule requires otherwise.
7. Verify each public HTML identity, public index slug/path, and final sidecar timestamp.
8. Run Wiki as a separate explicitly requested state and report it independently.

## Efficiency metrics to record

Keep these as run-local evidence, not permanent memory:

- Author dispatch to first valid `content.json`;
- Author completion or takeover time;
- number of cards requiring main-thread completion;
- renderer duration for the full batch;
- build/verify duration;
- number of rejected out-of-allowlist files;
- push to first verified public content;
- rework count by cause.

The target is not merely lower elapsed time. A good batch has one authoritative content handoff per card, one renderer, one integration worktree, one generated-index pass, and no duplicate writing.
