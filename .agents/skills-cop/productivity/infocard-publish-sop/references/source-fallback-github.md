# Source fallback for GitHub-backed infocards

Session notes for GitHub API failures and README-only fallback patterns.

## Useful fallback order

1. Try the requested process file or process note first.
2. If it is missing or empty, read `manifest.json` for repo-side metadata constraints.
3. Read the upstream README / raw README for product framing, deployment, SDK, and feature details.
4. If a GitHub API call for stars fails, extract the count from the repository HTML (`aria-label="... users starred this repository"`) or from a visible badge in the README page.
5. Preserve the fallback provenance in the wiki draft or source notes, not as a product claim.

## API 限流的三种严重程度（Humla 实录，2026-07-12）

| 程度 | 症状 | 处理 |
|------|------|------|
| 轻度 | 单字段失败，其他字段正常 | 降级获取（如从 README badge 取 Stars） |
| 中度 | 全字段返回 `null`/`N/A`，README 正常 | README-only 降级，卡片如实标注"GitHub 检索限流（未获取到实时数据）" |
| 重度 | API 返回 `{"message": "Not Found"}` 或 HTTP 404 | 项目不存在，停止操作并报告用户 |

**Humla 教训**：GitHub API 对 `michaelwilhelmsen/humla` 返回所有字段 N/A，但 README 本身读取正常（16,392 字节）。此时中度降级即可——README 内容完整，卡片只需在来源说明中标注 Stars 未获取。

**Browser 降级路径**：当 curl/wget README 失败时：
```
browser_navigate("https://github.com/owner/repo")
browser_console({expression: "document.querySelector('[data-testid=\"stars\"]')?.textContent"})
```

## What this helped with

- OpeniLink Hub：process note 缺失 → README 补充降级。
- Emil Kowalski Skills：curl README 静默失败 → browser_navigate + browser_console 提取 Stars=10,135。
- Humla：GitHub API 全字段 N/A → README-only 降级，标注 Stars 未获取。
- 每次降级都已在卡片来源说明中如实记录，不捏造数字。
