# Command boundary and delivery discipline

This reference captures a durable correction from a session where a report request was incorrectly escalated into an information-card publish flow and a failed Weixin delivery was incorrectly rerouted.

## Core rule

A report request is not publish authorization.

If the user asks for “调查 / 报告 / 总结 / 结果”, produce the report and return it in the current conversation or the explicitly requested channel. Do not create HTML, write to `infocard-pub`, push to GitHub, or create a public URL unless the user explicitly asks for publication.

## Safe escalation pattern

After returning the report, it is OK to ask:

> 是否需要我继续创建并发布信息卡？

Do not start the publish workflow until the user answers yes or gives an equivalent explicit instruction.

## Explicit publish signals

Treat these as sufficient authorization:

- “发布信息卡”
- “放到 infocard-pub”
- “生成并发布卡片”
- “调查并发布”
- “把报告和信息卡一起放进仓库”

Ambiguous wording like “调查一下”, “把结果发给我”, or “王记者” is not enough.

## Delivery platform rule

If the user names a platform, deliver only to that platform.

If the target platform fails or rate-limits, report the failure and ask whether to retry later or switch platforms. Do not silently reroute to Feishu, Telegram, WeCom, etc.

## Complete investigation-publish bundle

When the user does explicitly authorize an investigation-card publication, publish the bundle, not just the HTML:

- `report.md` for the full investigation report
- `index.html` or `{slug}.html` for the public card
- matching `.meta.yaml` sidecar
- regenerated `_index.yaml`
- public Pages detail URL verified 200
- public `_index.yaml` verified to contain the slug

A detail page that opens but is absent from the list/index is incomplete.
