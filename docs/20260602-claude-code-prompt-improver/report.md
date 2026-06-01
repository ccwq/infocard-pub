# Claude Code Prompt Improver：不是改写 prompt，而是把上下文注入到触发点

## 结论

这是一个 *hook 驱动的 prompt 优化器*，不是传统意义上的“提示词润色器”。它在 **prompt submit / tool use / subagent start** 这些触发点，按需注入上下文、路由和输出规范，让 Claude Code 在真正行动之前就拿到更完整的前提。

它的目标很明确：**提高首轮输出质量，减少返工轮次。**

## 这套系统的核心结构

- **Hook engine**：统一事件分发器，按事件触发规则。
- **JSON nudge registry**：能力不写死在 Python 里，而是放在 `nudges/*.json`。
- **Rules loader**：加载、校验、跳过无效规则，保证一条坏规则不会拖垮整体。
- **Builtins**：`improve` / `workflow` 等受控 handler，避免任意执行。
- **Prompt-improver skill**：当 prompt 真的模糊时，负责研究、澄清和问答逻辑。

## 关键判断

这个仓库最重要的点不是“能不能改 prompt”，而是：

1. **只在该出现的时候出现**：clear prompt 直接放行，vague prompt 才介入。
2. **把澄清前置**：在用户产生大量返工前就问清楚。
3. **把路由前置**：复杂任务先决定走 plan / subagent / orchestration。
4. **把输出标准前置**：长文输出提前压成结构化、可读、结论先行的形态。

## 7 个 nudges

- `improve`：每个 prompt 都会评估；只有真的模糊才问 1–6 个 grounded questions。
- `approach-assessment`：非平凡任务先选方法（plan / subagent / orchestration / 直接做）。
- `workflow`：多步骤工作流先规划，再分阶段路由。
- `output-readability`：长交付物先保证结论、结构和简洁度。
- `plan`：进入 plan mode 时输出短、清、可复核的计划。
- `background-exec`：长运行命令走后台，避免阻塞主线。
- `subagent-routing`：研究或规划子代理优先广度和结论，不要原始数据洪流。

## 安装方式

### 1) Marketplace

```bash
claude plugin marketplace add severity1/severity1-marketplace
claude plugin install prompt-improver@severity1-marketplace
```

### 2) Local plugin

```bash
git clone https://github.com/severity1/claude-code-prompt-improver.git
cd claude-code-prompt-improver
claude plugin marketplace add /absolute/path/to/claude-code-prompt-improver/.dev-marketplace/.claude-plugin/marketplace.json
claude plugin install prompt-improver@local-dev
```

### 3) Manual

```bash
mkdir -p ~/.claude/hooks/prompt-improver/scripts
cp scripts/engine.py scripts/rules.py scripts/nudge_builtins.py ~/.claude/hooks/prompt-improver/scripts/
cp -r nudges ~/.claude/hooks/prompt-improver/nudges
```

然后把 `UserPromptSubmit`、`PreToolUse`、`SubagentStart` 接到 `engine.py`。

## 为什么它有效

README 里给出的设计逻辑很一致：

- **少打扰**：大多数 prompt 直接通过。
- **误报便宜**：false fire 的成本很低，系统会自我取消。
- **问题少而准**：最多 1–6 个问题，避免问卷化。
- **透明**：注入的上下文是可见的，不是黑箱魔法。

另一个值得注意的数字是 README 中的 **31% token reduction** 叙述，说明它不是纯 UX 装饰，而是被当作“节省上下文与返工成本”的系统。

## 适合谁

- Claude Code 的重度使用者。
- 经常处理 bugfix、重构、迁移、multi-file 任务的人。
- 会起子代理、会做多步工作流、会长时间跑命令的人。
- 不想每次都在第二轮才补充约束的人。

## 不太适合谁

- 只想要“改写句子更顺”的 prompt 工具。
- 不接受 hook / plugin / settings.json 这类工作流改造的人。
- 不愿意为高质量首轮输出付出一次性安装成本的人。

## 证据与来源

- 仓库：`severity1/claude-code-prompt-improver`
- README 主张：*Intelligent prompt optimization for Claude Code*
- 兼容性：Claude Code `2.0.22+`
- 公开结构：`scripts/engine.py`、`scripts/rules.py`、`nudges/*.json`、`skills/prompt-improver/`
- 公开状态：MIT license，仓库首页可见 7 个 issues

## 备注

这张卡按“技术手册红黑”组织，重点不是讲故事，而是把：

- 触发点
- 组件
- 安装路径
- 使用边界
- 价值主张

一次讲清。
