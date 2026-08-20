# Delegated publish timeout recovery（2026-06-29）

This note captures a useful recovery pattern observed while publishing the X-thread toolchain card.

## Symptom

A delegated publish subagent timed out after doing most of the work. The parent session had to decide whether to restart or continue from the current repository state.

## Recovery pattern

1. **Do not assume the publish failed** just because the subagent timed out.
2. Inspect the target repository directly:
   - `git status -sb`
   - `git log --oneline -1`
   - `git ls-remote origin refs/heads/main`
3. Check whether the card is already on GitHub Pages.
4. Search the wiki repo for the slug/source URL before creating any new wiki pages.
5. If the card already exists, **sync the wiki only** instead of generating a duplicate card.

## Why this matters

Timeouts can happen after a successful commit/push but before the subagent returns a summary. The safe move is to verify repository and public state first, then continue from the latest grounded state.

## Verification checklist

- Published infocard commit exists locally and on origin
- Public Pages URL returns `HTTP 200`
- Wiki raw/concept pages exist and are pushed
- Index/log updated
- Worktrees are clean
