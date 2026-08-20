# 时间戳自动填充（build 时刻写入）

## 机制

`npm run build` 时 `scripts/build-site.js` 在 build 最开始生成 Asia/Shanghai 墙上时间戳，通过 `scripts/sync-build-timestamps.js` 写入本次所有变更的 meta.yaml。

## 规则

| 场景 | `date` | `updated` |
|------|--------|-----------|
| 新卡 | = build 时刻 | = build 时刻 |
| 既有卡更新 | 保留首次发布时间 | = build 时刻 |
| 缺 date 的历史卡 | 自动补 build 时刻 | 刷新为 build 时刻 |

## 工具链调用顺序

```
build 开始
  → shanghaiBuildTimestamp() 生成 TS
  → sync-build-timestamps.js --timestamp <TS>  (写入 meta)
  → fix-meta-shape.js --write                 (格式修复)
  → verify-meta-timestamps.js                  (只读门禁)
  → buildIndexData()                          (生成索引)
  → writeGeneratedArtifacts()                  (写 _index.yaml)
```

## 与旧 fix-meta-date.js 的区别

旧脚本按 git 提交历史回填时间（首次提交或末次提交），与实际发布时刻无关，已废弃。
新脚本以 build 开始时刻为准，与 commit/push 时刻保持一致。

## agent2 规则

**禁止在 .meta.yaml 中手写 `date` / `updated`。** 写了也不会被覆盖（工具链只处理缺失字段），但会浪费 token。

## 主线程操作

`npm run build` 即可自动完成，无需额外命令。build 输出中 `[sync-build-timestamps]` 行显示每张卡的写入结果。
