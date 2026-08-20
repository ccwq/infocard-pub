# Hardblue technical-share routing notes

This note captures a recurring pattern from a technical-share session.

## When to use infocard-hardblue-style
Use `infocard-hardblue-style` when the input is a social post or short link that is *sharing* a repo, skill, workflow, course, or tool and the user wants a technical-share card rather than an evidence/controversy card.

Typical signals:
- The post links to a GitHub repo, README, course, or toolkit.
- The user says "技术分享", "资讯分享", "经验分享", or similar.
- The goal is to explain what it is, how it works, and why it matters.

## Routing rule
- X/status = discovery surface.
- Repo / README / docs / examples = substance surface.
- If the source artifact is the real object of value, make the card repo-centric.
- Do not let the X shell dominate the narrative unless the user explicitly wants an X evidence card.

## Hardblue first-fold pattern
For dense technical-sharing cards, the first fold should surface:
1. What this is.
2. Who it is for.
3. What problem it solves.
4. How to start or what the entry path is.
5. One concise outcome/benefit statement.

## Practical guardrails
- Keep the title oriented around capability or learning value, not the status ID.
- Use the source post as supporting context, not the main narrative.
- Preserve the repo/course/package vocabulary when it is more precise than the post wording.
- If the user asks for a technical-share card and names `infocard-hardblue-style`, treat that as a strong style signal, not a decorative hint.

## GitHub repo tool/card routing: hardblue vs Q-style

When the user gives a GitHub repo/tool URL and names a style, use this table to pick the right one:

| Condition | Choose hardblue | Choose Q-style |
|---|---|---|
| Content is a tool or CLI | ✅ | |
| Content has 2-4 capability pillars with stats | ✅ | |
| Content has method framework / 6+ knowledge blocks | | ✅ |
| Content has multiple learning paths (3+) | | ✅ |
| Source has "scene-grid" / "method-grid" natural structure | | ✅ |
| Content is a course / learning system | | ✅ |
| Content needs strong workflow flow arrows | ✅ | |

**Examples from session 2026-06-06:**
- `curl.md` → hardblue (tool, stats, 4 entry paths, workflow steps)
- `bryanyzhu/agentic-ai-system-course` → Q-style (22 chapters, 5 learning paths, 4 reference systems, method-card with theory+use per block)
- `AppFlowy-IO/AppFlowy` → Q-style (product showcase with 6 knowledge blocks, 3 core values, 5 feature modules, install/platform matrix, suitable/not-suitable comparison grid — fits Q-style's multi-chapter knowledge card structure even though it's a product tool, because the README content naturally maps to method-cards with theory+use layers)

When the user explicitly names a style, that overrides the routing table. When neither table applies, default to hardblue for tool/product cards and Q-style for course/methodology cards.
