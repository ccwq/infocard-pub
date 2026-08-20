# Repository-first discovery notes

## Reproduction from the Grok Build card session

The publish repository contained an existing unrelated uncommitted card and temporary files. Before dispatching the dependent authoring agent, the main thread recorded the worktree and froze those paths as out of scope. The repository's actual `package.json` used `python -m http.server 4173 -d dist` for production preview and `npx live-server --port=7786 --host=127.0.0.1 --no-browser` for live source preview, while older skill guidance referenced another LAN port. The actual repository scripts and `dist/scripts/verify-bundle.js` were therefore treated as authoritative.

## Durable rule

Do not treat a loaded skill's historical port, path, or command as current repository truth. Read the live repository contract first, then use the real command and report any discrepancy. Keep search snippets and secondary articles as leads only; preserve attribution and uncertainty when the primary repository cannot be independently confirmed.

## Why this matters

- prevents stale skill instructions from driving the wrong preview surface;
- prevents generated `dist/` artifacts from being mistaken for source staging paths;
- prevents a card's exact staging step from sweeping unrelated `.tmp/` and asset changes into the commit;
- keeps facts/research honest when external search returns noisy and future-dated results.
