# Repo narrative enrichment + wiki standard flow

## When a repo card is driven by a GitHub URL plus extra user copy

Do **not** keep the supplementary text as a detached quote block. Instead, fold it into the card's reader-facing narrative layers:

- **为什么值得看**：把用户给的情绪钩子、数据点、星标 / 星数、作者背景、场景痛点合成一段开场
- **一句话**：压缩成“它是什么 + 解决什么 + 为什么重要”
- **核心机制 / 原理**：把用户补充内容里的比喻、坑位、流程、架构语言织进主叙事
- **使用 / 安装 / 入口**：优先从 README 或公开文档提取；用户补充文本若提供了更强的操作口径，可把它写成示例指令或步骤说明

### Canonical examples from 2026-06-21
- **LoopFlow**：用户补充的帖子内容被改写成“三个坑 + 加餐”叙事，而不是原样引用
- **RLM**：用户补充的 long-context 论断被吸收到“为什么值得看 / 一句话 / 范式对比”中，而不是单独挂在末尾
- **html-ppt-skill**：用户补充的吐槽句被用作开场钩子，随后接安装、演讲者模式和边界说明

## Wiki sync is a standard release step, not a question

For high-value infocards, the release order is:

1. Build / verify / commit / push the public card
2. Confirm the public page returns HTTP 200
3. **Immediately sync wiki raw + knowledge page + index + log**
4. Verify wiki files exist and, if the wiki is a git repo, commit/push them too
5. Report completion only after both public and wiki sides are done

Do not ask the user whether wiki sync should happen when the task is a standard publish flow. Treat it as part of the same release envelope unless the user explicitly says “不要同步 wiki” or similar.

## Practical writing rule

When the repo is a workflow bundle / skill bundle / agent framework, the card should read like an operations brief:

- what the bundle does
- how to install or invoke it
- what the core loop / architecture is
- where the boundaries and costs are
- why it is worth adopting now

Avoid ending with a bare source URL only; always convert it into a usable release narrative.
