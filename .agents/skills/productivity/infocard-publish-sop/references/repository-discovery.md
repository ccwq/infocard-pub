# Repository discovery

Run this before selecting a route or creating a worktree. Treat the live repository, not an older skill, as the source of operational commands.

1. Confirm repository root, branch, remote, complete worktree status, and every pre-existing dirty path.
2. Read `AGENTS.md`, package manifest, relevant build/verify scripts, active bundle validator, and style registry.
3. Record actual build, verify, taxonomy, leak, preview, public-route commands, plus validator compatibility fields, in the run bundle.
4. Inspect whether live commands need local packages:
   - If they do, confirm a validated primary-worktree `node_modules` exists for a later worktree symlink.
   - If they do not, record `local_dependencies: none`.
5. Keep pre-existing dirty paths immutable. A new run never stages, resets, stashes, or repairs them.

## Completion criterion

Before authoring or Git writes, the run bundle identifies live commands, compatibility fields, immutable pre-existing paths, and one dependency disposition: `symlinked` or `none`.
