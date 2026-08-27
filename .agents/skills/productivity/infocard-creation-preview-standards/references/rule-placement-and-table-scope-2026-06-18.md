# Rule Placement & Wide-Table Scope Note (2026-06-18)

## What changed

The user clarified two things about infocard standards:

1. The LAN preview rule (`live-server` + `10.6.8.14:5588`) is **not mobile-only** — it applies to both PC and mobile preview.
2. The wide-table rule is **style-agnostic** and must be treated as a **creation-time constraint**, not only a mobile QA fix.

## Canonical placement

Store these as follows:

- Put the canonical rule in `infocard-creation-preview-standards`.
- Let `infocard-pub-publisher` and `infocard-mobile-verifier` reference that umbrella skill rather than redefining the same rule in parallel.

## Why this matters

Without this placement discipline, the same rule drifts into three failure modes:

- preview conventions split between PC and mobile
- wide-table handling is remembered only as a mobile verification trick
- downstream skills start carrying conflicting copies of the same rule

## Operational takeaway

When the user says a rule is:
- independent of visual style,
- needed during creation rather than only verification, or
- shared across PC + mobile preview,

it belongs in the cross-theme creation/preview umbrella first.

Downstream skills should only retain the execution-specific reminder.
