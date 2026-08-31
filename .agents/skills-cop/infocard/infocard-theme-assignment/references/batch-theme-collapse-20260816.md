# Batch theme collapse — 2026-08-16（历史参考）

> 本文件仅保留历史背景，不是当前发布指令。新卡统一使用 `theme-decision.json`；不得按本文旧四行记录创建新卡。

## Incident

Two independently shaped cards were published in one batch with the same `redswiss` theme. OpenMausBot was an agent/tool ecosystem card; Gemini 3.7 Flash was a single-model technical manual. The latter had a research handoff recommending `hardblue`, but the batch authoring path silently reused the first card's theme.

## Root cause

Theme selection was treated as a batch-level convenience instead of a per-card content-shape decision. `meta.yaml.style` and `data-theme` agreed, so shallow mechanical checks passed, but the editorial assignment was wrong.

## Correct disposition

- OpenMausBot → `redswiss`: multi-agent workspace / tool ecosystem / capability matrix.
- Gemini 3.7 Flash → `hardblue`: single-model technical manual with specifications, benchmark conditions, pricing windows, tools, and limits.

## Required prevention

1. 历史记录曾使用 `content_shape`、`theme_primary`、`theme_fallback` 和 `theme_reject` 四行；当前流程改用 `theme-decision.json`。
2. For batches of two or more, block same-theme reuse unless a `same_theme_exception` records identical shape, reader scenario, and information density, or the user explicitly authorizes a monochrome batch.
3. Treat a research/author theme recommendation as an input that cannot be silently overridden.
4. Verify implementation, not only metadata: `meta.style`, HTML `data-theme`, token signature, and at least two structural signatures must agree.
5. Re-run local and public visual review after any retheme; prior screenshots are invalid.
