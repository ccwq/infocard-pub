# Open Design repository technical-analysis session notes

Date: 2026-06-06
Target repo: `https://github.com/nexu-io/open-design`

## Extraction pattern that worked

The repo README has a strong structure, so the card should not be a flat feature dump. The most useful reconstruction was:

1. **One-line judgment**
   - Open Design is a local-first design OS / agent studio, not a conventional design app.

2. **Resource/package structure**
   - Skills
   - DESIGN.md
   - Plugins
   - MCP / CLI

3. **Workflow chain**
   - brief → plugin → direction → design system → artifact → handoff → memory

4. **Artifact types**
   - Prototype / HTML preview
   - HyperFrame / MP4
   - Deck / PPTX + PDF
   - Image / brand assets

5. **Platform compatibility**
   - Claude Code, Codex, Cursor, Copilot, OpenClaw, Gemini, Kimi, OpenCode, Cline, Trae, Antigravity, etc.

6. **Quick start paths**
   - Desktop app
   - Agent install via `curl ... | sh -s <agent>`
   - Docker
   - Source build

7. **Boundary / suitability**
   - Good for agent-native teams and reusable pipelines
   - Not a conventional drag-and-drop canvas substitute

## Verification pattern that worked

- Public page and `/_index.yaml` were verified with HTTP checks.
- Mobile validation used a **390px viewport** and browser vision, not screenshot guessing.
- The final verdict was: **no obvious horizontal overflow**, **text slightly dense but readable**, **save button not covering正文**.

## Visual lesson

A single large hero image plus a local collage from the repo's own product visuals made the page feel anchored without depending on hotlinks.

## Reusable takeaway

For README-heavy open-source repos, prefer a **capability stack + entry points + boundary** analysis structure. This keeps the card high-density and avoids repeating the README line-by-line.