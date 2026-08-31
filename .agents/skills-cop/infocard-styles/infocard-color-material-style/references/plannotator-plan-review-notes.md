# Plannotator plan-review notes

## Session takeaway

Plannotator.ai is a strong fit for Color Material because it is not just a diff viewer; it is a **plan review control plane**.

### Core framing

- Input: plans, specs, markdown, HTML artifacts, URLs, diffs, PRs, MRs
- Output: structured annotations, review comments, feedback sent back to the agent
- Collaboration: encrypted share links, team review, cross-tool workflows
- Supported agents: Claude Code, Copilot CLI, Gemini CLI, OpenCode, Pi, Codex, Droid, Amp

### Layout hints that map well to Color Material

- Left/center: title, value proposition, control-plane summary
- Dark central panel: review loop / annotate → review → feedback
- Right rail: compatibility matrix, versions, stats, key commands
- Bottom strip: lifecycle sequence `plan → annotate → review → feedback → share`
- Color nodes: plan / review / html / share / AI built-in

### Useful signals from the repo

- `package.json` shows a monorepo with `apps/*` and `packages/*`
- Key user-facing commands:
  - `/plannotator-annotate`
  - `/plannotator-review`
  - `/plannotator-last`
- The project explicitly supports HTML artifact review and plan-mode workflows
- Public package version observed in this session: `0.20.1`
- The landing page and docs emphasize plan review, diff review, and agent feedback loops

### Styling guidance for future cards

- Treat Plannotator as a **workflow orchestration / review infrastructure** product
- Prefer a central synthesis block + right summary rail
- Use colorful nodes to distinguish plan, review, HTML, share, AI, and team scopes
- Do not present it as a plain diff tool; emphasize the feedback loop and agent coordination layer
