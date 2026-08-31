# Pitfall: meta.yaml `date` / `updated` 必须是发布时间，不能用内容原始日期

**症状**：CDN 验收 200，但首页 `_index.yaml` 里新卡的 `date` 是内容原始日期（如 `2026-07-19`）而非发布时间（`2026-07-28`），导致首页排序错位——新卡不在顶部，按 `_sort_ts` 排序后被同日更早的卡挤到中间或更靠后。

**根因**：子智能体写卡时把 `date` 理解为"内容创作日期"，而不是"信息卡创建/发布时间"。

**正解**（V3 发布协议补充，2026-07-28 复盘）：

1. **写卡阶段**：子智能体必须把 `date` 和 `updated` 都设为**写卡那一刻的 UTC 时间**，格式 `"YYYY-MM-DD HH:MM:SS"`。禁止用：
   - 内容原始发布时间（如 X post 本身的发布日）
   - 模糊日期（仅日期不带时间）

2. **构建阶段**（主线程 orchestrator）：merge 之前，orchestrator 必须把所有新 meta.yaml 的 `date` / `updated` 强制重写为**当前合并时刻**（`date -u +"%Y-%m-%d %H:%M:%S"`），覆盖子智能体的初值。这是 `npm run build` 之前的硬步骤。

3. **示例 bash（合并前批量重写）**：
   ```bash
   NOW="$(date -u +"%Y-%m-%d %H:%M:%S")"
   for meta in docs/20260728-*.meta.yaml; do
     sed -i "s/^date:.*/date: \"$NOW\"/; s/^updated:.*/updated: \"$NOW\"/" "$meta"
   done
   ```

4. **验收**：`curl -s https://ccwq.github.io/infocard-pub/_index.yaml` 必须包含新卡的 `date: "YYYY-MM-DD HH:MM:SS"`，且与推送时刻前后相差 < 1 小时。

5. **同时检查 `local main == origin main`**：publish 推送前必须跑：
   ```bash
   git fetch origin main
   git diff --stat origin/main
   ```
   不应有任何意外分叉。如果分叉，先 `git reset --hard origin/main` 再合并 5 分支。

**相关参考**：
- `references/atomic-meta-write-and-review-boundaries.md` — meta 字段顺序
- `references/2026-07-25-meta-yaml-format-guide.md` — YAML 格式
- `references/build-index-sync-gotcha.md` — 索引同步陷阱