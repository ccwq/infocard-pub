# Agent2 bundle 写卡：字面 claim coverage 与最小修复

## 适用场景

上游 Agent 已提供 `publish-bundle.json`、`facts.json` 和 `research.md`；当前 Agent 只被授权写卡片 HTML、同名 meta 与本地 Wiki 草稿，并明确禁止调研、下载资产、build 和 Git 交付。

## 必做读取顺序

1. bundle：确认 `slug`、`html_path`、`meta_path`、`asset_dir`、`manifest_path`、style、category、wiki 输出位置与 `asset_policy`。
2. facts：确认 `required_sections`、`claims`、`min_claim_coverage`、sources、未核实项和证据等级。
3. research：只作为语言组织和边界提醒；不得用其中额外叙述绕过 facts 的范围。
4. taxonomy：只使用允许的 taxonomy 维度与标签。

## 关键验证器行为

`verify-card-content.js` 会：

- 要求 hero 中出现身份文本；
- 从 heading / section landmark 中匹配 `required_sections`；
- 将 HTML 可见文本规范化（去标点、压缩空白、小写）后，用 `text.includes(normalize(claim))` 做 claims 的**字面包含**检查；
- 要求 viewport 与至少一个 responsive media rule。

所以“同义概括”不够。例如 facts 的 claim 包含“截至2026年7月16日，本次核查未获得……”，若 HTML 改写为“截至核查日未见后续材料”，会导致 coverage 失败。

## 最小且可读的解决法

在“来源 / 核查边界”末尾增加一个可见的小节，如 `事实包逐条陈述`，逐项列出 `facts.claims` 原文。这样同时：

- 使 claim coverage 可验证；
- 让读者看到核查结论的精确措辞；
- 避免在正文为迎合校验而反复堆砌原句。

## 空资产包

`asset_policy.mode: empty` 时，不写任何 `img`、外链字体、stylesheet、script、iframe 或 CSS `url()`。`verify-local-assets.js` 成功时应输出：

```json
{"valid":true,"errors":[],"references":[]}
```

## 交付前最小门禁

在仓库根目录运行（不涉及 build）：

```bash
node scripts/verify-bundle.js --bundle .tmp/publish-bundles/<slug>.json
node scripts/verify-card-content.js --bundle .tmp/publish-bundles/<slug>.json
node scripts/verify-local-assets.js --bundle .tmp/publish-bundles/<slug>.json
```

若第一轮只有 `claims` coverage 失败：补入逐字 claims，重跑三项；不要借此补充调研、变更主题或扩大交付范围。
