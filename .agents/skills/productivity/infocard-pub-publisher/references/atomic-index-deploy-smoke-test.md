# Atomic index deploy + smoke test (2026-05-30)

## Problem pattern
A card detail page can be live while the homepage list still misses it. This happens when:
1. the card HTML + `.meta.yaml` are pushed,
2. Pages deploys that commit immediately,
3. `_index.yaml` is regenerated later (or in another workflow),
4. the deployed artifact still contains the old `_index.yaml`.

This is a **publish/index race**, not just a browser cache problem.

## Durable fix
Treat `_index.yaml` as a build artifact that must be regenerated **inside the Pages deploy workflow before artifact upload**.

### Required controls
- Use one shared generator script for both `index.yml` and `pages.yml`.
- Run a verification script before deploy that fails on:
  - missing required meta fields (`slug`, `path`, `category`, `title`, `date`, `tags`)
  - meta pointing to a missing HTML file
  - `_index.yaml` missing cards / duplicate slugs / field mismatches / bad `_count`
- After `deploy-pages`, smoke-test the public `/_index.yaml` until it matches the locally built one.

## Why this matters
`cache: no-store`, timestamp query params, and service-worker network-first rules help with stale clients, but they do **not** fix a bad deploy artifact. The artifact itself must already contain the correct `_index.yaml`.

## Rebase recovery rule
If `_index.yaml` conflicts during `git rebase`, do not hand-merge conflict markers. Rebuild `_index.yaml` from all `*.meta.yaml`, re-stage it, then continue the rebase.

## Recommended smoke test shape
At minimum compare:
- remote `_count` == local `_count`
- remote top slug == local top slug

Stronger variant for a new-card release:
- verify the specific newly published slug exists in remote `/_index.yaml` before declaring success.
