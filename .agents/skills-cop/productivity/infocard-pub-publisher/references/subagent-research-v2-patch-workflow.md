# Subagent Research → Full Card → v2 Patch Workflow

> **Learned 2026-07-04**：子智能体调研完成后，发现比预期更丰富的内容时，不能只更新 wiki 就了事，必须把细节 patch 回卡片主 HTML，再做第二次 commit+push。子智能体是增强，不是尾声。

## The problem

- Sub-agents return richer technical detail (GRPO advantage formula `A_i = ...`, reward functions, derivative projects, vLLM API code) after the initial card was already committed and pushed
- I reported "发布完成" after the first push, but then noticed the sub-agent results had gold that wasn't in the card
- I did a second commit+push with `update: ... - [enriched content]` — which is correct, but the principle wasn't codified

## The correct pattern

```
1. 立即分发并行子智能体（不等待）
2. 主线程：读 README / 抓 logo / 写 HTML → build → verify → commit → push
3. 轮询 Pages HTTP 200
4. 子智能体结果回来 → 分析是否比已有内容更丰富
5. 如果是 → patch HTML 加新模块 → build → verify → commit → push（v2）
6. wiki 同步写入 v2 内容（含衍生项目/额外命令/补充数据）
7. 报告：v1 已上线 + v2 patch 说明
```

**不能**：子智能体回来后只更新 wiki 就停止
**不能**：报告"发布完成"而不等子智能体结果
**应该**：并行写卡 + 子智能体异步调研，合并增强后再收尾

## When to patch vs when to leave it

| Condition | Action |
|---|---|
| 子智能体返回了 README 中没有的额外数据（衍生项目/评测对比/命令变体） | patch 回卡片，做 v2 commit |
| 子智能体返回内容与已写卡片基本一致 | 仅更新 wiki，不用再 push |
| 用户提供了截图素材 | 截图含完整文案时，直接基于素材写卡，不用等子智能体重试 |

## v2 commit message convention

```
update: <slug> - <brief description of new modules>
```

Examples:
```
update: Open R1 - GRPO formula详解/奖励函数/OlympicCoder+vLLM API部署+衍生项目
update: Ansible Collaborative - MCP config examples, Lightspeed VS Code setup, 6-stage learning path
```

## What subagents typically add that card authors miss

- **Technical depth**：GRPO advantage formula, specific benchmark numbers, reward function types
- **Derivative ecosystem**：related projects, community forks, benchmark comparisons
- **Usage edge cases**：specific CLI flags, error conditions, hardware limits
- **vLLM / deployment code**：API server commands, Python client snippets
- **Alternative commands**：Makefile targets, Slurm job scripts, YAML configs

These are high-value additions that belong in the card, not just the wiki.
