# Branch Topic Alignment & Evidence Bundle

## What this reference captures
A lightweight rule for publish/debug sessions where the user corrects the main topic mid-stream.

## Rules
1. Re-anchor to the latest user message if the topic changes.
2. Do not reuse older repo artifacts or similar slugs just because they already exist.
3. For investigation-style releases, keep:
   - `docs/<slug>/index.html`
   - `docs/<slug>/report.md`
   in the same directory.
4. Treat the report + HTML + metadata as one bundle during commit, push, and verification.

## Why it matters
- Prevents cross-topic contamination.
- Keeps evidence and published output tied together.
- Makes later audits and re-publishes much safer.
