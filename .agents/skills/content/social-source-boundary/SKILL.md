---
name: social-source-boundary
description: Use for social-source infocards. Separate claim layers.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, social-media, evidence-boundary, source-attribution, x-post]
    related_skills: [any2card, infocard-creation-preview-standards]
---

# social-source-boundary

## Overview

Use this class-level skill when a card starts from a social-post recommendation rather than an explicit repository announcement. Preserve claim boundaries across three evidence planes:

1. **Trigger layer** — what the post explicitly says and links to.
2. **Tutorial layer** — the downstream notes/repository that supplies curriculum, chapters, licenses, and mirrors.
3. **Official upstream layer** — the upstream product/repository architecture, interfaces, limits, and security model.

## Mandatory boundaries

### Do not collapse identity

- Do not rewrite an entry-page recommendation as a direct GitHub repository mention.
- If the post points to an entry page and the repository is inferred by content matching, write: **“内容与目标教程体系高度一致 / 交叉匹配”**.
- Only say the post names a repository when the post itself explicitly names it and that identity is independently visible.

### Keep the three planes visible

A card should have explicit sections or equivalent blocks for:

- `post_identity`: author, time, excerpt, recommendation URL.
- `tutorial_layer`: curriculum, dual-language versions, public/closed materials, license.
- `upstream_layer`: official architecture, modes, permissions, and sandbox boundaries.

### OCR and image policy

- Treat attached screenshots and OCR as visible evidence, not a substitute for first-party text.
- Label image-derived claims as “图像提取 / OCR 对齐”.
- Do not use OCR alone to assert ownership, authorization, official endorsement, or complete code availability.

## Safe phrase bank

Prefer:

- “原帖推荐指向教程入口，不能直接据此断言仓库身份。”
- “配图展示的章节序列与教程正文交叉匹配。”
- “教程为阅读型材料，部分课程实战代码未公开。”
- “该表述属于教程定位，不等于官方发布层背书。”
- “官方项目与教程是上游关系，不应混写为同一来源。”

Avoid:

- “原帖直接点名 GitHub 仓库”（when it did not）。
- “全部课程代码公开”（when README says otherwise）。
- “官方认证可直接上线” or “默认安全隔离”。
- Equating a tutorial’s Python comparison version with an official Python SDK.

## Authoring workflow

1. Read the frozen bundle and all research handoffs before writing.
2. Build a fact table with the source plane for each claim.
3. Structure the card as `post_identity → image_ocr_summary → tutorial_identity → upstream_identity → evidence_levels → claim_boundaries`.
4. Place boundary language next to every high-risk claim, not only in a footer.
5. If the card is under `docs/`, use an absolute image URL or an inline data image; avoid relative paths that can 404 on GitHub Pages.
6. Run a forbidden-conflation scan for repository identity, official endorsement, Python implementation, and code-publication claims.

## Acceptance checklist

- [ ] Recommendation link, tutorial repository, and official upstream are separated.
- [ ] “高度一致 / 交叉匹配” wording is used for inferred matching.
- [ ] OCR/image evidence is labeled and does not overclaim.
- [ ] Public-scope limits, including unpublished course code, are visible.
- [ ] Permission and sandbox limits are accurate and not softened into generic safety claims.
- [ ] Visual evidence uses an absolute URL or inline data path from `docs/`.
- [ ] Only the declared card artifacts are written; no bundle/build/commit/push.

## References

- `references/social-source-recommendation-boundary-template.md` — reusable section taxonomy, phrase bank, and risk checklist for social-triggered tutorial cards.
