# Cross-platform investigation card: reusable closeout notes

## Evidence and content boundaries

For public-figure opinion investigations, split the report into three layers:

- **A**: official notices, institutional materials, or authoritative media clearly relaying first-party material.
- **B**: media reports and public platform samples.
- **C**: unverified online claims, anonymous allegations, and emotional accusations.

Keep platform samples descriptive rather than inferential. Record the observation window and platform limitations; do not turn search-page visibility into total volume, ranking, sentiment share, or representative public opinion. Separate a confirmed institutional action from older controversy labels and do not use one to prove the other. Strong claims such as nepotism, resource exchange, backstage manipulation, or ghostwriting require independent first-party evidence; otherwise label them as unverified narratives.

## Release and Wiki closeout checklist

1. Create the card and same-directory Markdown report.
2. Build and verify the card; inspect generated `_index.yaml`, `index.html`, and all unrelated diffs.
3. Run leak scanning and content keyword checks.
4. Commit and push the card, then verify the public URL with `curl` and required keywords.
5. For a requested report/archive, create all four Wiki artifacts:
   - `raw/articles/YYYY-MM-DD-infocard-<slug>.md`
   - `entities/<entity>.md`
   - `index.md` entry
   - `log.md` entry
6. Commit and push Wiki separately; verify both files and clean status.
7. Record visual evidence honestly. Static checks and HTTP 200 are not visual acceptance; use `VISUAL_PENDING` when real mobile capture was not obtained.
8. Stop temporary servers and remove only the verified temporary worktree. Re-run `git worktree list` and `git status -sb`.

## Recovery patterns

- If a repository-wide taxonomy fixer crashes on legacy metadata or produces unrelated rewrites, restore those unrelated files and avoid committing the spillover. Run card-scoped checks instead.
- If the build auto-updates a new sidecar timestamp, re-read and review the sidecar before the audit commit; do not leave the release metadata stale.
- A Pages push can succeed while Wiki is still absent. Treat the two repositories as independent terminal states and report them separately.

## Evidence wording

Use wording such as:

- “公开搜索页在采集窗口内可见……”
- “未获得足以支持该强指控的一手材料……”
- “机构性处理结果可进入高等级事实链，但不反向证明所有旧传言……”
- “视觉证据未取得，状态为 VISUAL_PENDING。”

Avoid wording such as “全网舆情显示”“平台普遍认为” unless a reproducible, representative sampling method supports it.
