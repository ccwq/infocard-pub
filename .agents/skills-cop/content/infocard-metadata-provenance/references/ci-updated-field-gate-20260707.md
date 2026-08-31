# CI Gate: `updated` Field Required for Changed/New Cards (2026-07-07)

## Trigger

`npm run verify` 报错：
```
docs/YYYYMMDD-xxx.html.meta.yaml: missing required updated
```

## Root Cause

2026-07-07 CI 升级 `verify-meta-timestamps.js`，开始检查 changed/new cards 必须同时有 `date` 和 `updated` 字段。

## Correct Format

```yaml
date: "2026-07-07 07:10:00"
updated: "2026-07-07 07:10:00"
```

## Which Cards Need `updated`

| 情况 | 需要 updated？ |
|------|------|
| 本次新建的卡 | ✅ 必须 |
| 本次修改的卡 | ✅ 必须 |
| 未修改的旧卡 | ❌ 不需要 |

## Recovery When CI Fails

1. 读取报错的 meta.yaml
2. `patch` 添加 `updated: "<与 date 同值>"`
3. `git add` 该 meta.yaml → 合并到当前 commit
4. `git push`

## Subagent Created Cards

子智能体创建的 meta.yaml 经常缺少 `updated` 字段，接手后检查并补上。
