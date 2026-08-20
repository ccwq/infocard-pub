# Batch Topic-Card Lessons (2026-07)

## Scope

For X-driven multi-card publishing where topics are selected first and publication is explicitly authorized later.

## Reusable rules

1. Freeze the research boundary before authoring. For claims sourced from X, require the original post plus at least one primary dataset, official statement, or reputable primary report where the claim is quantitative, causal, or safety-related. Treat search snippets and low-engagement X posts as leads, not proof.
2. Split the cards by claim class before writing: observed metric, mechanism hypothesis, and risk/event verification. Keep one card's uncertain claim from becoming another card's fact.
3. Use one fresh integration worktree for a batch. Generate `_index.yaml` and `index.html` exactly once after all three HTML/meta pairs exist. Never cherry-pick child-generated generated indexes.
4. Date consistency is a hard gate: the filename, meta `path`, public URL, `date`/`updated`, and visible research date must agree. When the system date changes from the topic-selection date, rename the artifact before build rather than patching only the sidecar.
5. Hardblue visual acceptance is screenshot-led. Do not infer theme compliance from CSS variables alone: inspect the rendered screenshot for dominant color, section completeness, mobile stacking, and readable code/list blocks. A red-dominant result fails a hardblue request even if blue tokens exist.
6. Leak scanning sees example email addresses in appeal templates as real PII. Use neutral placeholders such as `&lt;YOUR_EMAIL&gt;` and `&lt;YOUR_NAME&gt;` in published HTML, then rerun the scanner; do not bypass a HIGH finding.
7. If one research worker is late, preserve the worktree and wait/inspect its handoff; do not publish the available card as a complete batch or convert an unverified safety incident into a factual headline.

## Evidence language

Use “X上流传/用户称/媒体报道” for social evidence, “研究估计/数据显示” for a primary study, and “已确认” only when the original official or primary source is directly accessible. For causal employment claims and AI-control incidents, include an explicit “不能据此推出” boundary.
