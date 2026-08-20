# hardcoded-timestamp-prevention.md

## 教训（2026-06-26）

Pinokio 信息卡发布时，meta.yaml 被硬编码为 `2026-06-26 11:00:00`，用户立即发现并纠正为实际时间 `2026-06-26 19:11:03`。

症状：meta.yaml 中 date/updated 与实际发布时间相差 8 小时。

根因：写 meta.yaml 时没有调用 `TZ=Asia/Shanghai date`，直接硬编码占位值。

## 正确做法

### 写 meta.yaml 时必须取实际时间

在创建 meta.yaml 的同一段代码执行流中，先调用：

```bash
PUBLISH_TS=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')
```

将 `$PUBLISH_TS` 写入：

```yaml
date: '2026-06-26 19:11:03'
updated: '2026-06-26 19:11:03'
```

### 裸时间必须加引号

裸 `2026-06-26 19:11:03` 会被 YAML 解析为 timestamp 对象，产生 +8h 时区漂移。必须加引号变字符串。

### 验证清单

push 前自检：

```bash
grep -E "date:|updated:" docs/<slug>.html.meta.yaml
```

出现 `11:00:00` / `00:00:00` 等固定占位值 = P0 问题，必须修复后再 push。
