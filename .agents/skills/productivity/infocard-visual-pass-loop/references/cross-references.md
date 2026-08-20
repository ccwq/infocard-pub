# Cross-references

This skill is the visual verification hard gate that complements (but does not edit) the protected `infocard-publish-sop`.

## Companion SKILLs

- `productivity/infocard-publish-sop` — authoritative orchestrator entry point. Treats this loop as **step 7 (visual disposition)** and as the **🚨 Visual verification HARD gate (2026-07-28)** clause.
- `productivity/theme-visual-reference-workflow` — covers Puppeteer screenshotting of all available themes (used to compare rendered primary color against requested theme).
- `content/infocard-creation-preview-standards` — preview standards referenced before the loop is run.
- `content/infocard-mobile-verifier` — mobile-specific verification patterns referenced for the 720px screenshot pass.

## Triggers to load this skill

- User reports: "样式丢了" / "主题不对" / "看起来像长文" / "hero bar 没出来" / "卡片没背景".
- `npm run build` succeeds AND `curl -I <url>` returns 200, but the agent is unsure the theme is actually applied.
- User asks "为什么跳过了视觉验证".
- Previous session left the card as `PUBLISHED_PENDING_VISUAL` and a re-run is requested.