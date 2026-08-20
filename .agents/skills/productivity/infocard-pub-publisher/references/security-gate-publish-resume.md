# Infocard Publish Interruption & Security Gate Pattern

## Trigger

Use this note when an infocard publish flow is interrupted by a tool security gate after the user has already said `go` / `直接发货` / `继续`.

## Lesson

A security-gated command can stop the publish pipeline mid-flight even when the user has already broadly authorized the task. The durable lesson is not that the command is broken; it is how to resume without losing task state or duplicating work.

## Correct recovery pattern

1. **State exactly where the pipeline stopped.**
   - Example: `已完成 HTML/meta/report + 删除旧目录 + build/verify，卡在本地 HTTP/移动端验收前。`
2. **Do not re-plan from scratch.** Continue from the last verified phase.
3. **Do not claim publish success.** Local build/verify is not public deployment.
4. **If the tool explicitly says to wait for user response, stop and ask for `go`.** Do not route around it with a different command.
5. **After user replies `go`, resume from the blocked phase**, not from the beginning.
6. **Keep the task ledger updated**: mark completed phases completed and leave publish/wiki pending until verified.

## What to report during the pause

A compact pause report should include:

- completed artifacts
- last passing checks
- exact blocked phase
- next actions after confirmation

Example:

```text
已完成：新 HTML/meta/report、旧目录删除、build/verify/filter 通过。
卡点：HTTP/移动端验收命令被安全门拦截，工具要求等待确认。
回复 go 后继续：本地验收 → commit/push → 公网 200 → wiki 同步。
```

## Pitfalls

- Do not treat `npm run verify` as publish success.
- Do not silently skip mobile/HTTP checks because the security gate interrupted them.
- Do not restart content generation and risk changing the already verified artifact.
- Do not preserve unrelated metadata changes caused by helper scripts; isolate them before staging.
