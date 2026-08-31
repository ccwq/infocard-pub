# Social-source attribution matching

## Trigger

Use when a social post recommends or shows a project/book/tool but does not explicitly name the canonical repository, while the attached image or OCR contains distinctive structural evidence.

## Proven workflow

1. Extract the social post's exact body, author, timestamp, engagement snapshot, media URLs, and quoted-post metadata. Keep quoted-post content separate from the current post.
2. OCR the attached image and retain high-signal fingerprints: exact section names, item counts, chapter codes, code-line/read-time figures, version labels, author names, and visible links.
3. Search first-party sources only for candidate matching. Prefer official repositories, README files, project sites, package metadata, and documented reading/download entrances.
4. Compare candidates by multiple independent signals, not a title-only resemblance. A strong match normally includes at least two or three of: identical section sequence, identical counts, identical numeric metadata, matching version structure, matching author/project identity, and matching public links.
5. If one candidate matches strongly, continue without asking the user to select from all candidates. In the bundle and public card, state the boundary explicitly: “原帖未点名；根据配图 OCR 与公开 README 交叉匹配，本文聚焦该项目（高置信度）。”
6. Preserve source layers:
   - Social post: what the recommender actually said.
   - Image/OCR: what the attached visual shows.
   - First-party repository: project identity, features, license, and reading entrances.
   - Official upstream: the underlying framework/tool facts.
7. Keep superficially similar rejected candidates internal unless comparison was requested. Do not silently merge their facts into the selected candidate.
8. Ask one clarification only when the remaining ambiguity could materially change the artifact or when no candidate has a strong multi-signal match. Existing explicit publish authorization is not reset by a solvable attribution gap.

## Acceptance checks

- Current post and quoted post are not conflated.
- The card does not claim the social author explicitly named a project when they did not.
- The selected candidate has traceable first-party URLs.
- OCR-derived claims are labelled as image evidence, not official project facts.
- Strong marketing phrases such as “生产级”“可上线”“替代 Claude Code” are attributed or softened unless independently supported.
- The repository's code/document license split is preserved; do not collapse different licenses into one.

## Pi Agent example from 2026-08

The post “给大家推荐一本非常值得阅读的 Pi Agent 电子书” omitted the book/repository name. The attached image showed 10 modules M01–M10, TypeScript/Python dual versions, and distinctive chapter names including Agent Loop, three-layer architecture, context engineering, context compaction, and session management. The `buchidonggua/dg-ai-notes` README matched the sequence and dual-version structure, and therefore was a high-confidence match; the correct response was to proceed with explicit attribution boundaries, not pause for a five-way candidate choice.

## What not to do

- Do not treat every search result for the generic phrase “Pi Agent book” as equally plausible.
- Do not turn a terse recommendation into a fully attributed endorsement without a matching first-party source.
- Do not make the user repeat a decision already implied by the image evidence and explicit publish request.
- Do not use a social post's quoted-post object as evidence for the current post's topic.
