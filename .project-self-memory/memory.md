<!-- <psm-store version="1" next_id="0002" group_dimension="" /> -->
<!-- <psm id="0001" type="fact" status="active" positive="0" negative="0" created_at="2026-08-31T06:11:46Z" last_scored_at="" /> -->
普通单来源低风险信息卡的 light route 由 scripts/run-infocard-light-route.js 编排：authoring 前执行 project-brief/facts/theme/sidecar/manifest preflight；promotion、visual_capture、visual_review、static_gates 分阶段计时；targeted taxonomy/leak/visual gate 绑定当前卡；单调墙钟达到 20 分钟时终止为 PUBLISHED_VERIFIED、PAGES_PENDING、PUSH_FAILED 或 BLOCKED_AT_LOCAL_GATE。诊断 JSONL schema v2 仅在显式 diagnosticsPath 时创建，Pages 等待单列 deployment_wait。SLA fixture smoke 必须实际覆盖 preflight、promotion、视觉 manifest、定向 leak、closeout 和 JSONL summary，不能只汇总预算常量。

