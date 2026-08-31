# GitHub repo security/workflow bundle card pattern

## When to use
Use this pattern for GitHub repos that package a workflow system rather than a single tool: security skill bundles, agentic workflow packs, red-team kits, plugin ecosystems, or installable command/skill registries.

## What to surface first
1. **What the bundle is for**: name the operational outcome in one sentence.
2. **Authorization / scope boundary**: say clearly what is in scope and what is deliberately out of scope.
3. **Bundle structure**: quantify the bundle (skills, commands, patterns, categories, harnesses, etc.).
4. **Access paths**: list install/usage paths in recommended order (for example: plugin → MCP → CLI).
5. **Workflow chain**: show the steps the bundle encodes, not just the folder tree.
6. **Delivery / reporting layer**: explain what gets produced at the end (report, artifact, file, review, etc.).

## Visual heuristics
- Treat hero media as evidence of the bundle's operating mode, not decoration.
- If the repo ships multiple diagrams/images, localize the most representative one and use it as the top anchor.
- Include a workflow diagram when the repo has multiple harnesses or access modes.

## Copy heuristics
- Prefer结论型标题: “把 X 变成 Y” / “把 A 编成 B 的工作流层”.
- Avoid listing features without grouping them into a chain.
- If the repo is security-related, make the boundary explicit before describing capabilities.
- If the repo is for authorized use only, say so plainly and avoid hype language that blurs scope.

## Verification notes
- For publish flows, verify the detail page, index inclusion, and homepage search after Pages deploy.
- If the repo has an associated wiki, treat wiki sync as part of publish completion for high-value cards.
