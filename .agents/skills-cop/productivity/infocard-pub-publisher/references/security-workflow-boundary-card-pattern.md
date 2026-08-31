# Security workflow / boundary card pattern

Use this pattern when publishing cards for authorized security tools, pentest frameworks, red-team kits, or vuln research repos.

## Card shape

1. Lead with the authorization boundary.
2. Explain the workflow as a defensive / audit / verification chain.
3. Highlight evidence, reporting, and reviewability.
4. State suitable / unsuitable scenarios explicitly.
5. Avoid step-by-step exploitation details, payload recipes, or bypass instructions.

## Good section order

- 一句话结论
- 授权边界 / 风险提醒
- 工作流链路（收集 → 发现 → 验证 → 报告）
- 证据与复核
- 适用场景 / 不适用场景
- 来源与边界说明

## Visual / style guidance

- Prefer `black-head` for security workflow cards.
- Use red for risk, blue/green for supporting categories.
- Make the first fold read as a professional workflow card, not an attack tutorial.

## Copy guidance

- Say “已授权 / 可审计 / 可复核” early.
- Say “仅用于授权目标” more than once if the repo is security-sensitive.
- Reframe “利用” as “验证” or “复核” unless the source explicitly presents a safe, high-level description.
- If the repo returns PoC or exploit artifacts, mention them as outputs of the workflow, not as instructions.
