# 发布时间 vs 新闻时间（infocard-pub）

## 结论
- 信息卡的 `date` / `updated` 应写**发布时间（release time）**，不是新闻原始时间。
- 列表页首页渲染优先读取 `updated > date > _modified_date`。
- 列表展示会按前端格式化结果显示到分钟级；正文底部可单独写“发布时间”。

## 操作约定
1. 重新发布卡片时，先取当前 Asia/Shanghai 壁钟时间。
2. 同步更新：
   - `docs/{slug}.html.meta.yaml` 的 `date`
   - `docs/{slug}.html.meta.yaml` 的 `updated`
   - 卡片正文/页脚里的“发布时间”标注
3. 重新 `npm run build && npm run verify`。
4. 提交并 push 后，再验收线上 `_index.yaml` 和详情页。

## 典型坑点
- 只改 HTML 里的时间说明、没改 meta，会导致列表页仍显示旧值。
- 只改 `date` 不改 `updated`，首页通常仍可能按 `updated` 走，造成展示不一致。
- 重新发布后，Pages 可能有传播延迟；先确认 raw repo，再确认 Pages。