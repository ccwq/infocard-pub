# Infocard adapter maintenance

Session-derived guidance for integrating the generic visual-review orchestration layer with `infocard-publish-sop`.

## Ownership boundary

- The upper-level SOP owns review timing, frozen screenshots, required regions, static/page-identity gates, and the publish decision.
- The orchestrator owns capability probing, per-image execution through the public executor contract, result aggregation, redacted evidence, and temporary-chat cleanup.
- The upper-level SOP must not call or modify `chatgpt-web-skill` directly.

## Routing state machine

1. Native vision first.
2. Native `VISUAL_PASSED` or a real `critical`/`major` defect is terminal; do not request a ChatGPT Web second opinion.
3. Only after differentiated native-infrastructure retries are exhausted and static/page-identity/viewport gates are green may the orchestrator fallback run.
4. One card/article run creates one new temporary chat in the verified project. Never reuse an existing chat or silently fall back when creation fails.
5. Review one frozen screenshot at a time and aggregate required images failure-first: blocked > pending > passed.
6. Write and verify redacted evidence before cleanup. Delete only the run-created, ownership-verified chat and re-enumerate it. Return `CHAT_CLEANUP_PENDING` or `CHAT_DELETE_BLOCKED` when deletion is unverified.
7. Any HTML/CSS/structure change invalidates earlier visual evidence. For infocards, perform local pre-publish review, then a fresh post-publish public review only after exact public HTML/index and new-content identity are confirmed.

## Why this reference exists

Keep session-specific integration detail here rather than expanding the generic skill with card-specific publishing logic. See `visual-review-orchestration/SKILL.md` for the durable class-level contract.
