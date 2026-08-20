# 发布门禁首轮实战：范围、事实与暂存

## 适用

首次把多道发布门禁应用到真实信息卡，或用户同时要求“发布并验证提升”时。

## 关键结论

1. **先锁停止点。** 流水线改造应逐 Task 交付；用户未明确授权时，不应自动把后续 roadmap 一路执行。
2. **过程文件必须被排除。** `.tmp/` 的 facts/research/bundle、`artifacts/mobile/` 截图、`.hermes/` 计划都应在 `stage-publish-batch` 中显示为 `unrelated_changes`，而非进入 commit。
3. **门禁匹配不能牺牲事实精度。** 内容验证器若只按字符串命中，不能把 Agent1 的完整、带来源归因的 claims 缩短为页面词组来换取 PASS。应保留完整事实包；后续优化 verifier 的关键词/片段匹配或卡片中的准确归因。
4. **空资产是有效交付。** 文章或仓库没有可明确归属、适合复用的图时，写空 manifest 和具体原因；用 CSS/SVG 结构表达，不下载装饰素材。
5. **发布验收要分层。** build/index → 390px CDP（宽度、断图、截图）→ 精确暂存 → commit/push → HTTP 关键词 → Wiki raw/concept/index/log。

## 风险提示

- `npm run build` 可能对历史 sidecar 输出既有 slug warning；只要本次 sidecar、索引验证与 allowlist 正确，不把历史 warning误报为本次卡失败。
- GitHub Pages 首次轮询可能短暂 404；用有上限的轮询和 cache-busting URL，再确认关键词。
- 不要把子智能体的“已通过”当证据；主线程必须重跑门禁并检查实际 staged set。
