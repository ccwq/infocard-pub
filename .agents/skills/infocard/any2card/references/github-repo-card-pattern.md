# GitHub Repository → Information Card Pattern

Use this when the input is a GitHub repo URL and the goal is a publishable infocard.

## Source priority
1. README.md — positioning, quick start, features, screenshots.
2. Package metadata — `pyproject.toml`, `package.json`, `Cargo.toml`, etc.
3. Repo tree — confirms actual modules, entrypoints, CLI, APIs, workflows.
4. Workflow/docs files — only for validation of claims, not for headline positioning.

## Extraction pattern
- **One-line conclusion**: what the repo is really doing in plain language.
- **Capability matrix**: 3–6 concrete capabilities or differentiators.
- **How it works**: translate the architecture into a short flow.
- **Quick start**: the minimum commands or setup path.
- **Who it is for**: target users / use cases.
- **Risks / tradeoffs**: deployment cost, dependencies, operational complexity, lock-in.
- **Source strip**: name the authoritative files used.
- **Claim/evidence separation for X-linked repos**: if the card starts from an X post, explicitly separate the post's claim, repository-confirmed facts, and screenshot/media evidence. If the post claims a list of N repos but only public text for one repo is retrievable, state that boundary instead of inventing the missing entries.

## Good card shape
- Hero: repo name + short conclusion + stack/target platform.
- Middle: capability matrix + workflow diagram or flow steps.
- Lower: quick start + risk assessment + concrete source notes.
- Footer: source list and date.

## Common pitfalls
- Do not summarize only README marketing language; verify against metadata and tree.
- Do not call it a generic “tool” if the repo is a proxy/router/SDK/framework with a sharper role.
- If README claims feature support, confirm the entrypoint or module exists in the tree.
- If package metadata and README disagree, prefer the code tree plus explicit docs over headline copy.

## Useful output template
- Title: `<repo name>：<plain-language role>`
- Subtitle: `<stack> · <target> · <key constraint>`
- Sections: `一句话结论 / 关键能力矩阵 / 它怎么工作 / 适合谁 / 风险与定位 / 核心来源`
- Tags: include the repo’s primary stack and user-facing domain.
