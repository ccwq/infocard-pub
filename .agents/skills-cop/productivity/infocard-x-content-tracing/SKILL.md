---
name: infocard-x-content-tracing
description: "X content to upstream project/author tracing."
version: 1.0.0
author: Hermes Agent
license: MIT
---

# X Content → Infocard Author Tracing

## Trigger

X/Twitter post contains: a code snippet, Rules block, prompt text, implementation guideline, or project recommendation — and the X post is a **mediator** (the author shared it), not the canonical source.

## Goal

Trace the actual upstream project/author, then author the card as a **project card**. The X post provides the discovery signal; the card credits the project/author as primary source.

## Step 1 — Identify canonical upstream

| Content type | Canonical source | Example |
|---|---|---|
| Rules/Prompts file | GitHub repo README/raw | `global.md`, `AGENTS.md`, implementation principles |
| Tool/framework | GitHub repo | DeepSeek Harness plugin, coding agent tool |
| Project collection | GitHub repo | awesome-list, curated toolkit |

**Search for Rules/Prompts**:
```
site:github.com "<unique phrase from the content>"
# e.g. "Fix the root cause with the smallest clear and debuggable change"
```

**Search for tools/projects**:
```
<project-name> GitHub stars 2026
```

## Step 2 — Extract author identity

From GitHub profile:
- Handle + display name
- Join date, follower/repo counts
- Related projects (often a trilogy)
- Stated motivation (README "项目初衷")
- License

**Verified example — `xstongxue/best-rules`**:
- Handle: `xstongxue` / 小帅同学 · Joined: 2024-05 · Followers: 27, repos: 16
- Related: best-prompts, best-skills
- Motivation: "在 Vibe Coding 时代，好的 Prompt 决定 AI 的输出质量"
- License: MIT

## Step 3 — Card structure for Rules/Prompts content

Card is about the **project**, not the X post:
1. Hero: name, stars, license, tagline
2. **Author block** (prominent, near top): GitHub handle, profile stats, related projects
3. Original prompt/Rules text (verbatim code block)
4. Project overview
5. With/without comparison (concrete examples)
6. How to use
7. Change log section if updating existing card

## Step 4 — Anti-patterns

- **Do NOT** publish a Rules card as anonymous content — author is first-class value
- **Do NOT** treat the X post as the source — it is discovery, not canonical
- **Do NOT** skip GitHub search for recognizable Rules/Prompts text — upstream repo almost always exists
- **Do NOT** guess the author — always verify from GitHub profile

## Step 5 — DSh/Plugin ecosystem cards

Include: plugin count, license (often CC0), official CLI install command, security caveat.

**Example — `awesome-dsh-plugin`**:
- Stars: 7,841 · License: CC0 · CLI: `dsh plugin add <owner/repo>`
- Security: plugins run locally, not sandboxed by Tool Approvals
