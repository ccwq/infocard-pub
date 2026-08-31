# Infocard Pub Publish Compact Verification

Session notes for publishing high-density repository info cards to `infocard-pub`.

## What this adds
- Prioritize the repository's own README / AGENTS / docs as source of truth.
- Collapse the card into a few high-signal sections: what it is, core principles, scale, use cases, and one-line conclusion.
- After push, verify both the detail page and `/_index.yaml` entry; accept a short 404→200 propagation window during Pages deploy.
- If rebase conflicts hit `_index.yaml`, rebuild it from sidecars instead of hand-editing conflict markers.

## Useful cues from this session
- The repo described itself as a production-ready AI coding plugin with 63 agents, 249 skills, 79 commands, hooks, and cross-harness support.
- The published card worked best as a dense technical brief rather than a broad marketing summary.
- The publish flow completed only after rebase recovery and index verification.
