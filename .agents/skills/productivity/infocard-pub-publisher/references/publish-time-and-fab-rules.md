# 发布时间字段与 FAB 按钮规则

## 时间字段语义
- `date`：信息卡的**原始来源时间 / 创建时间**。若用户要求“按这次发布重发”，也不要随手把旧卡的 `date` 改成当前时间。
- `updated`：仅表示**内容有实质更新**时的最后更新时间，不应在仅重建索引、仅改样式、仅重发时自动覆盖为当前时间。
- 首页列表会优先显示 `updated` / `updated_at`，其次才看 `date`；因此如果 `updated` 被写成当前时间，会让列表看起来像“刚刚更新”。
- 以 Asia/Shanghai 墙钟时间写入 `date` / `updated` / `_modified_date`，避免 UTC 造成 8 小时偏差。

## FAB 保存按钮规则
- `position:fixed` 的保存 PNG 按钮不需要 `fab-spacer` 占位，也不需要 `fab-dock` 包裹。
- 按钮应直接放在 `.card` 末尾、紧贴闭合标签之后；fixed 元素不会占用文档流。
- 任何 `.fab-spacer` / `.fab-dock` 都属于冗余结构，会在页面底部制造大块空白，属于高优先级缺陷。
- 生成或 patch 完后，必须检查：`grep -n "save-btn\|</button>" <file>`，确保按钮、`saveCard()` 和 `💾 保存 PNG` 都还在。
