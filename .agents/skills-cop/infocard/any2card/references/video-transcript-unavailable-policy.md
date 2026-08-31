# Video transcript unavailable policy

Use this note when a user asks to turn a YouTube/video URL into an information card.

## Decision rule
- If transcript/subtitles are available: extract them and convert to the requested format.
- If transcript/subtitles are unavailable or empty: do **not** reconstruct operational steps from the title, search snippets, or metadata.
- In that case, either:
  1. ask the user for a transcript, notes, or口播要点, or
  2. produce a bounded summary / risk note using only public signals that are actually visible.

## Safe outputs when transcript is missing
Prefer one of these shapes:
- 一句话结论 → 风险点 → 常见误区 → 适用边界 → 来源说明
- 公开可见信息 → 能确认的事实 → 不可确认项 → 建议下一步

## Pitfall
- Do not write “步骤概览” that silently turns into a guessed how-to.
- Do not imply the video was fully extracted if the transcript was disabled.
- If the user later supplies transcript text, re-run the card as a proper step-based summary.
