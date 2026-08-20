# Infocard wiki missing-card backfill

Use this when you need to ingest **all infocard-pub cards that are not yet represented in the wiki**.

## Canonical workflow
1. Read the repo metadata under `infocard-pub/docs/**/*.meta.yaml`.
2. Read the wiki raw corpus under `wiki/raw/articles/*.md`.
3. Build the candidate set by comparing **`source_url` values**:
   - repo meta source URLs minus wiki raw source URLs = missing cards
4. Batch-create for each missing card:
   - `raw/articles/YYYY-MM-DD-infocard-<slug>.md`
   - `concepts/` or `queries/` page based on content type
5. Rebuild `index.md` once from current page frontmatter.
6. Append a single log entry for the batch.
7. Verify again until missing-count becomes zero.

## Important pitfalls

- Do not use page count as a proxy for completeness.
- Do not trust memory of what has already been ingested; diff the source URL sets.
- Keep raw files versionable and include `source_url`, `infocard_url`, `slug`, `ingested`, and `sha256`.
- Compute `sha256` over the body only, after the frontmatter fence.
- When doing a large backfill, create all raw/page pairs first, then rebuild navigation once.
- **Create wiki page 前先查 index.md**：index.md 已有 260+ 历史条目，同名主题可能已存在。AI DevKit 已在 `concepts/20260612-ai-devkit.md`，不要再创 `concepts/ai-devkit-workflow.md`。用 `search_files(path=WIKI/index.md, pattern='<关键词>')` 确认无重复后再写。
- **execute_code 被阻止**：批量写 8+ 个 wiki 文件时 `execute_code` 超时被阻断。用 `write_file` 每批 ≤4 张并行写。
- **日志路径以实际落盘为准**：`write_file` 返回的 `resolved_path` 是真实路径，不要凭假设写日志。

## Verification recipe
- Re-scan repo `source_url` values against wiki raw `source_url` values.
- Confirm `missing_count = 0`.
- Confirm `index.md` total pages matches the page corpus.
- Spot-check a few raw files by recomputing body hashes.