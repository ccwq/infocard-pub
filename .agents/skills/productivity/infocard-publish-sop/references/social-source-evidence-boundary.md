# Social-source evidence boundary

## Trigger

Use this note when an information card combines social-platform discovery with implementation research, especially for Xiaohongshu, Reddit, X, or login-gated pages.

## Evidence matrix

| Evidence observed | What it can prove | What it cannot prove |
|---|---|---|
| Search result title | A topic or claimed direction exists in the public index | The post body, exact steps, effect numbers, screenshots, or code |
| Search snippet | A short indexed excerpt, if clearly attributed | The full argument, current state, or omitted caveats |
| Directly readable post body | The visible text at capture time | Claims hidden behind “展开”, deleted media, or inaccessible comments |
| Official docs / README | Documented behavior and intended setup | That a workflow succeeds in every environment |
| Source code / package manifest | Implemented primitives, defaults, and dependencies | Product-level quality or real-world effectiveness |
| Community comments | Reported experience or a lead for further research | A general guarantee or official support |

## Wording patterns

Prefer:

- “公开搜索结果显示，社区实践集中在……”
- “该实现的 README / 源码明确提供……”
- “Reddit 讨论提供了线索，以下能力已回到仓库源码核验……”
- “由于正文受登录态限制，不能据标题确认具体步骤或效果数字。”
- “第三方运行时实现了 X；这不等于上游工具原生内置 X。”

Avoid:

- “小红书教程证明了……” when only a title is visible.
- “社区已经验证……” when only search ranking or snippets were observed.
- “Codex 原生支持……” when the behavior comes from an external CLI or wrapper.
- Claiming exhaustive platform coverage after a partial or login-gated search.

## Implementation-card routing

When the user wants an implementation-oriented card:

1. Use social platforms to discover candidate topics, repositories, and recurring pain points.
2. Locate first-party docs, repositories, package manifests, examples, and source files.
3. Build the main narrative around the directly verifiable implementation.
4. Keep social findings in a separate “community signal / evidence boundary” section.
5. Put the access limitation in the bundle, sidecar provenance, and visible card copy when it materially affects confidence.
6. Preserve `retrieved_at` for dynamic data such as stars, post counts, and search snapshots.

## Minimal bundle fields

Record:

```json
{
  "source_access": {
    "platform": "xiaohongshu|reddit|x",
    "access": "public_body|search_only|login_gated|blocked",
    "retrieved_at": "ISO-8601",
    "limitations": ["..."],
    "claims_promoted_to_card": ["..."],
    "claims_not_promoted": ["..." ]
  }
}
```

The bundle remains the authority. A prose research note must not silently broaden the claims beyond the bundle.

## Session-derived example

For a Codex dynamic-workflow card, public Xiaohongshu search exposed titles covering architecture setup, scheduled tasks, plugins, Agent workflows, research, design, data analysis, frontend, and e-commerce. The post bodies were not reliably readable, so those items were reported as community directions only. Reddit search surfaced dynamic-workflow and subagent discussions; the implementation claims were promoted only after checking the two GitHub repositories and official AGENTS.md documentation.
