# 私人定制：两阶段发布编排

## 定位

此 SOP 服务于当前 infocard-pub 私人工作流。首要目标是提高子智能体吞吐、压缩无效 token、让失败可最小恢复；不引入面向陌生用户的授权、通用合规或跨仓库适配分支。

发布器只消费已就绪的最小 publish bundle，不负责调研、写卡或主题重建。

## 最小 publish bundle

每卡必须可定位以下产物：

- HTML
- 对应 meta.yaml
- `assets/img/<slug>/manifest.json`（允许显式空资产，并说明原因）
- `provenance`：
  - `kind: source_url`：必须给可访问来源 URL；
  - `kind: user_provided`：记录用户提供的原创文案/素材；
  - `kind: internal`：记录仓库内既有事实包或资产。
- raw Wiki 目标路径。

`high_value: true` 时，额外要求知识页、index、log 目标；普通卡不因缺少这些派生产物阻断。

## 固定职责

```text
agent1：准备并校验 bundle
agent2：只消费 PASS bundle 写 HTML/meta/Wiki 草稿，并运行本地内容/结构门禁
主线程：复验、build、索引、提交/推送、公网/移动端/Wiki 验收，以及最小恢复
```

- agent1 不写 HTML/meta/Wiki，不 build/commit。
- agent2 不再调研、下载素材或扩大范围。
- agent2 在主仓库共享工作区写入；其运行期间主线程只读。
- 仅 agent2 已完成、明确失败或超时后，主线程才检查文件与 Git 状态并接管。

## 容错预算

### agent1

1. bundle 门禁失败：允许一次仅针对结构化错误的补齐。
2. 第二次失败：不得启动 agent2。
3. 主线程按失败类型选择最小补齐、显式无素材降级或停止该卡；不得用 README/口头摘要绕过 bundle。

### agent2

1. 首次本地门禁失败：读取结构化错误，允许一次定向修复并重跑。
2. 第二次失败或超时：主线程检查现有 HTML/meta、bundle 与 Git 状态，只做最小修复；不得盲目重写整卡。
3. agent2 自报 PASS 不是最终证据；主线程必须重跑发布级门禁。

## 批量调度

每张卡独立推进：`agent1 → bundle PASS → agent2`。跨卡 agent1 可并行；单卡不得让 agent2 早于其 bundle PASS 启动。失败卡隔离，不阻塞已通过卡。主线程汇总合格卡后再统一 build/发布；失败卡保留结构化失败记录，不静默丢弃。

## 讨论与执行进度

在这个工作流的多步骤讨论、执行和恢复报告中，每次回复采用 `Step n / 约 total`。total 是可调整的预估，不伪装为精确计划。
