# Create-card vs publish boundary

## CRITICAL UPDATE (2026-06-19): Default = Execute, not confirm

用户说"发布信息卡 + URL + 风格"时，**默认直接执行完整发布链路**，不中途询问、不停在草稿阶段、不问"是否继续"。

这是本会话验证过的正确工作流：
- `发布信息卡 + URL + 风格` → 立即采集事实 → 写卡 → build → verify → preview → 截图验收 → commit → push → 公网验证 → wiki 同步 → 报告完成
- 中途发现不确定性 → 自己查，不问用户
- 发现可安全推进的部分 → 直接推进，不等授权
- 只有在"方向完全不清会发错卡"时才追问一次

**本规则优先级高于所有"先确认"的默认提示。**

## Trigger patterns

### "创建信息卡 / 做成信息卡 / 生成卡片"（无"发布"字样）
→ 创建本地草稿，预览后报告，未 commit/push/Wiki 同步。

### "发布信息卡 / 发布 / push"（含发布意图）
→ 执行完整链路：采集事实 → 写卡 → build → verify → preview → 截图 → commit → push → 公网验证 → wiki 同步 → 报告完成。

## Default execution (create draft)