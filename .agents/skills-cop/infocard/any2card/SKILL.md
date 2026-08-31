---
name: any2card
description: Use when authoring an infocard from declared facts or when producing its desktop and mobile visual evidence before release.
version: 3.0.0
---

# Any2Card

## Purpose

The leading word is **evidence**. This skill owns card artifacts and visual evidence. It does not research beyond declared facts, create a worktree, build repository indexes, commit, push, or synchronize Wiki.

Load `infocard-publish-sop/references/infocard-publish-protocol-v3.md` before authoring or reviewing.

## Meta YAML Format Gate (critical — causes silent build failures if violated)

Every card needs a `.meta.yaml` sidecar. The build gate requires `requiredFields = ["slug", "path", "category", "title", "date", "tags", "desc"]`. Violations cause `Index build failed: expected a single document in the stream` or missing-field errors that silently break GitHub Pages deploy.

**Correct format** (slug on line 1, path inside YAML document body):

```yaml
slug: 20260725-xhs-huawei-supply-chain-panic
title: "小红书华为停产舆情调查"
desc: "一句话描述，含来源和日期。"
date: "2026-07-25 00:55:00"
updated: "2026-07-25 00:55:00"
tags:
  - 华为
  - 供应链
category: 舆情调查
author: Hermes Agent
source: 小红书
source_url: https://www.xiaohongshu.com/explore/...
style: hardblue
path: docs/20260725-xhs-huawei-supply-chain-panic.html
```

**Wrong patterns to avoid:**
- `path` before `---` on line 1 (sits outside YAML document → multi-doc error)
- `description` instead of `desc` (legacy, prefer `desc` explicitly)
- Date as bare `2026-07-25` without time component
- Missing `updated` field (required for new/changed cards)
- Missing `category` or `path` fields

## 1. Author declared artifacts

1. Read the Protocol v3 run bundle. Honor its facts, evidence boundaries, asset policy, paths, required visible claims, and required sections.
2. Create only the declared HTML, `.meta.yaml`, and asset manifest. Keep claims attributable and use no undeclared external assets.
3. Write identity, artifact paths, artifact hashes, and content/asset gate results into the bundle.

Completion criterion: every declared artifact exists; required text is visible; every asset complies with the bundle policy; and no artifact falls outside the declared allowlist.

## X-status source workflow

When the primary source is an X (Twitter) status URL, the full extraction pipeline is:

1. **Extract via agent-browser + CDP** (primary, with login state):
   ```bash
   AB=/home/ccwq/.npm/_npx/6de2aa2fded2970c/node_modules/.bin/agent-browser
   NS=x-extract-$(date +%s)
   "$AB" --namespace "$NS" --session "x-extract" --cdp 9222 \
     --json open "https://x.com/i/status/<STATUS_ID>"
   ```
   Then `Runtime.evaluate` to read article text, author, datetime, engagement stats.

2. **Cross-verify via api.fxtwitter.com** (no login required):
   ```bash
   curl -L --max-time 20 "https://api.fxtwitter.com/status/<STATUS_ID>" -o /tmp/fxtweet.json
   ```
   **Two response shapes** — always check both:
   - **Short-form** (≤ 280 chars): content in `tweet.raw_text.text`
     ```python
     import json
     d = json.load(open('/tmp/fxtweet.json'))
     t = d.get('tweet', {})
     rt = t.get('raw_text') or {}
     print(rt.get('text', ''))  # full post text
     print(t.get('likes'), t.get('retweets'), t.get('views'))
     ```
   - **Long-form article** (X Articles): content in `tweet.article.content.blocks[].text`
     ```python
     art = t.get('article') or {}
     print('title:', art.get('title'))
     for b in (art.get('content') or {}).get('blocks', []):
         tx = b.get('text', '').strip()
         if tx: print(f'[{b.get("type","unstyled")}] {tx}')
     ```
   A post that appears to have no `raw_text` may be a long-form article. Missing this causes silent data loss.

3. **Extract image**: the `media[]` array from fxtwitter or the first `img` in the article DOM. Download with:
   ```bash
   curl -L --fail --silent --show-error --max-time 30 \
     "https://pbs.twimg.com/media/?name=orig" \
     -o assets/img/<slug>/x-post.jpg
   ```

4. **Author card content** — must prominently display:
   - Author display name and `@handle`
   - X status ID and full URL
   - Engagement stats (views, likes, reposts, bookmarks)
   - X-sourced image with source attribution
   - Strict "X 帖子称" vs "已验证事实" distinction for claims

See `references/x-status-content-extraction.md` and `references/x-status-article-preview-guideline.md` for extraction commands and content rules.

## 2. Produce visual evidence

1. Read the repository's actual preview command and route; do not assume a port or path.
2. Start or reuse preview according to repository instructions, then verify the expected identity before review.
3. Inspect desktop `1440×900` and mobile `390×844` independently.
4. If a completed visual result reports `critical` or `major`, record `VISUAL_BLOCKED`. Apply only a targeted authoring repair for a reported issue, then invalidate and replace the prior evidence.
5. If capture infrastructure fails, use `visual-infrastructure-failure.md`. Retry infrastructure only, at most four times after the initial attempt.
6. Write exactly one current disposition to the bundle: `VISUAL_PASSED`, `VISUAL_BLOCKED`, or `VISUAL_PENDING`.

Completion criterion: the bundle contains current evidence for both viewports, a blocking result, or five infrastructure-only failures recorded as pending.

## Boundaries

- Never represent static DOM/CSS checks as visual PASS.
- Do not install dependencies, run repository build/index generation, stage files, commit, push, or write Wiki.
- A card-file change invalidates visual evidence; the publisher must consume the latest bundle disposition only.

## CDP session reuse for visual evidence

Before launching an `agent-browser` session for a local infocard preview, probe the workstation Chrome DevTools endpoint on port `9222`. When it is available, attach with `--cdp 9222` (or the repository `ab` alias) rather than creating a separate browser session. Preserve unrelated user tabs; create and later close only the preview tab. This is especially important when browser navigation wrappers reject private preview URLs but the attached Chrome can reach them.

**Reliability checks:** a successful `/json/version` response does not prove WebSocket usability. If `agent-browser` reports a `Page.enable` timeout, use a fresh namespace/session instead of the stale default daemon. If the WebSocket handshake returns HTTP 403 mentioning `remote-allow-origins`, restart the dedicated automation Chrome with an explicit local-client allowlist such as `http://127.0.0.1:9222,http://localhost:9222`, then re-probe. Do not claim visual evidence until `tab list`, local-preview `open`, and `get url` all succeed. See `references/agent-browser-cdp-9222-visual-evidence.md`.

**X-source identity gate:** when a supplied X status URL redirects to a canonical profile/status URL or exposes only a shell, preserve the original status ID but do not infer the author from the redirect, profile URL, page title, or search snippets alone. Confirm display name and handle from a rendered post/API payload and record source/confidence in the bundle. If the body is unavailable, mark content pending/blocked and do not author a detailed card from the URL alone. See `infocard-publish-sop/references/x-tweet-content-extraction.md`.

## Upstream: Research → Fact Pack

Before authoring, use `references/primary-research-fact-pack-methodology.md` when the task is a new topic requiring primary-source fact gathering. Also load `references/informal-framework-source-boundaries.md` when the subject is a named technique with a later community-originated classification, quantification, or maturity model (e.g. "L1-L5" levels, "five stages" checklists, or "levels of X"). The framework must be split into: (1) the underlying established concept, and (2) the attribution of the later model, with explicit status (formal / informal / unstandardized).

- A new topic requiring primary-source fact gathering (e.g., "调研 X / 调查 X / 搜集 X 资料")
- An open-source project, framework, or technology needing identity / author / mechanism / license / activity verification
- A subject where structured fact-pack output (✅/🔶/❓ verification tiers, source URL index, narrative angles) serves as upstream input to the three-file pipeline

This file supersedes ad-hoc research patterns and ensures social-media constraints, source-priority ordering, and verification-tier discipline are applied consistently.

## References

- `references/primary-research-fact-pack-methodology.md` — upstream fact-gathering pipeline: source-priority ordering, verification checklist, structured output format, and narrative-angle guidance
- `references/identity-preserving-multiview-card-boundaries.md` — 人物身份保持与多视角生成卡的来源优先级、术语边界、方案分层与验收清单；涉及 GPT Image、Gemini/Nano Banana、InstantID、PuLID 或 3D 脸部重建时先读。
- `references/research-to-infocard-three-file-pattern.md` — three-artifact pipeline (HTML + meta.yaml + wiki.md) for declared fact bundles
- `references/VISUAL_GATE.md` — dual-viewport review record and defect handling
- `infocard-publish-sop/references/infocard-publish-protocol-v3.md` — authoritative status and retry rules
- `infocard-publish-sop/references/visual-infrastructure-failure.md` — use only when screenshot infrastructure fails
- `references/pi-plugins-q-style-asset-manifest-lesson.md` — three-artifact completeness check (HTML + meta.yaml + manifest.json), Q-style hero image routing, manifest schema; always verify all three artifact paths before reporting completion
