# AI 模型对比卡主题选型规则

## 规则（2026-07-26 实战沉淀）

AI 模型对比横评（两个以上模型的性能/能力/生态对比）→ `hardblue`（硬核蓝手册风）

| 适用内容 | 原因 |
|---|---|
| 模型对比表（LTX-2.3 vs Wan2.1） | 对比列高密度、VBench 评分、stats 行 |
| benchmark 评分卡 | 数字醒目、红色强调分数差异 |
| 多模型横评（3+ 模型） | Pro/Con 多栏、硬边框分隔 |

> `redswiss` 用于开源工具生态对比（CLI/API/Agent）；模型横评有评分表和性能数据，用 `hardblue`。

## 对比表组件设计要点（hardblue）

```css
.compare-table th{background:var(--hb-accent);color:#fff}
.compare-ltx{background:rgba(0,81,168,.04)}
.compare-wan{background:rgba(168,117,0,.04)}
.winner{font-weight:700;color:var(--hb-green)}
```

## 案例

| 卡片 | 主题 | commit |
|---|---|---|
| LTX-2.3 vs Wan2.1 视频生成模型对比 | hardblue | `288c47d` |
