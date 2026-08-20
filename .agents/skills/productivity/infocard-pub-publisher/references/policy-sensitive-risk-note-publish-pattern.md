# Policy-sensitive risk-note publish pattern

When a user wants an infocard published but the source text contains operational steps that would enable bypassing, evasion, or other unsafe instructions, the publish flow should continue as a **risk-note rewrite**, not a how-to card.

## Rewrite rules

- Keep the subject and scenario, but remove step-by-step instructions.
- Reframe the card around:
  - core risk summary
  - failure points / warning signs
  - maintenance or compliance concerns
  - common misunderstandings
  - safe alternatives or decision criteria
- Avoid titles that look like an instruction manual (for example, words like "直订", "绑定", "配置", "执行" when they imply a procedure).
- Avoid copying exact operational details from the source if they would make the card actionable.
- If the source is a mixed request, select the safe subtopic and publish that instead of blocking the whole task.

## Card shape

A reliable structure for these cards is:

1. 一句话结论
2. 最容易出问题的环节
3. 风险信号 vs 低风险信号
4. 常见误区
5. 更稳妥的判断顺序
6. 适用 / 不适用
7. 来源与边界说明

## Verification emphasis

- Confirm the published page states the boundary clearly: no bypass or workaround steps.
- Ensure the visible body keeps the content high-level and non-actionable.
- Keep the result publishable even when the source text itself is not safe to reproduce literally.
