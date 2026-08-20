# meta.yaml frontmatter 格式陷阱（2026-07-07 实录）

## 症状

```
Error: expected a single document in the stream
```

或 CI `verify-meta-timestamps` 报错：
```
<file>: date must be quoted, got 2026-07-07 23:40:07
<file>: date must be Asia/Shanghai wall-clock "YYYY-MM-DD HH:MM:SS", got 2026-07-07 23:40:07
<file>: missing required updated; changed/new cards must carry both date and updated
```

## 根因：裸日期未加引号

`verify-meta-timestamps.js` 检查：
1. `date` 和 `updated` 字段必须存在
2. **值必须加引号**（单引号或双引号）
3. 格式必须是 `YYYY-MM-DD HH:MM:SS`（不是 ISO 格式）

## 正确格式

```yaml
---
slug: 20260707-opendisplay
path: docs/20260707-opendisplay.html
category: 效率工具
title: "OpenDisplay：闲置 iPhone 变 Mac 副屏"
date: "2026-07-07 23:40:07"
updated: "2026-07-07 23:40:07"
tags:
  - Mac
  - iOS
source_url: https://github.com/peetzweg/opendisplay
note: ""
desc: "描述"
---
```

关键规则：
- `date` 和 `updated` 必须**同时存在**（`updated` 经常被漏掉）
- 两个时间值都必须**加引号**
- 不能是裸日期 `date: 2026-07-07`（无时分秒）
- 不能是 ISO 格式 `date: "2026-07-07T23:40:07+08:00"`（带 T 或时区后缀）

## 时间戳生成

```bash
TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"
# 输出：2026-07-07 23:40:07
```

然后填入 meta.yaml 时加双引号。

## 验证脚本

```bash
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const data = yaml.load(fs.readFileSync('docs/<slug>.meta.yaml', 'utf8'));
const ts = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
console.log('date:', data.date, '→ ok:', ts.test(String(data.date)));
console.log('updated:', data.updated, '→ ok:', ts.test(String(data.updated)));
"
```

## 子智能体接手时的关键步骤

当接手子智能体超时的任务时，必须检查 meta.yaml：

1. 是否有 `updated` 字段（没有则加上）
2. `date` 和 `updated` 是否加引号（没有则补上）
3. 时间格式是否正确

然后再运行 `npm run build`。

## 已知案例

| 日期 | 问题 | 修复 |
|------|------|------|
| 2026-07-07 | 子智能体写 meta.yaml 时漏了 `updated` 字段 | 补上 `"2026-07-07 HH:MM:SS"` |
| 2026-07-07 | 时间值未加引号（`date: 2026-07-07 23:40:07`） | 改为 `date: "2026-07-07 23:40:07"` |
