# Repo-local infocard skills migration

## Problem Statement

infocard-related skills are split across the global Hermes skill registry, while the `infocard-pub` repository already contains repo-specific conventions, publish gates, and visual recovery workflows. This makes the infocard workflow harder to maintain as a project-owned capability and mixes project-specific behavior with global reusable skills.

The repo should own its strongly coupled infocard workflows locally, so Hermes sessions launched inside `infocard-pub` can discover and prioritize them without requiring a global skill change.

## Solution

Use repo-local skills under `.agents/skills/` inside `infocard-pub` as the project-specific skill source.

Keep the project-local set focused on `infocard-pub` workflows, publishing gates, and visual recovery paths. Keep general-purpose cross-project skills in the global registry for now.

The migration should be done in two phases:

1. Add the repo-local skill directory and copy the strongly coupled infocard skills into it.
2. Verify Hermes can discover the project-local skills from inside the repo, then use `git-up -sP` to package the change set.

## User Stories

1. As a maintainer, I want infocard publish workflows to be available from inside the repository, so that project behavior stays close to the code it governs.
2. As a maintainer, I want strongly coupled infocard recovery skills to live beside the repo, so that fixes and conventions evolve with the repository.
3. As a maintainer, I want Hermes to prefer project-local skills over global duplicates inside this repo, so that repo-specific behavior is not shadowed.
4. As a maintainer, I want the global skill registry to stay focused on reusable cross-project workflows, so that common procedures remain sharable.
5. As a maintainer, I want the repo-local skills to use a stable discovery path, so that future sessions load them consistently.
6. As a maintainer, I want the migration to preserve the existing global copies initially, so that rollback is easy if discovery or loading behaves unexpectedly.
7. As a maintainer, I want the project-local skill set to be small and intentional, so that it does not become a second unbounded registry.
8. As a maintainer, I want the repo-local path to be compatible with Hermes project discovery, so that the current Hermes installation can resolve it without special-case tooling.
9. As a maintainer, I want the migration to be verifiable from the repository state alone, so that skill placement can be audited later.
10. As a maintainer, I want implementation work to happen after the spec is agreed, so that directory moves and workflow changes stay controlled.

## Implementation Decisions

- Use `.agents/skills/` as the repository-local skill root.
- Create the directory if it does not already exist.
- Migrate only infocard skills that are strongly coupled to `infocard-pub` behavior:
  - authoring workflow
  - theme assignment
  - publisher workflow
  - build/deploy workflow
  - mobile verification
  - visual evidence verification
  - CSS recovery
  - poster-shell rebuild
  - HTML structure debugging
  - grid/stripe collapse debugging
- Keep `any2card` and broad cross-project governance skills in the global layer for now.
- Do not delete the global copies during the first migration pass.
- Prefer a reversible copy-and-verify step before any cleanup.
- Do not introduce new skill names unless the repo-local copy needs a repo-specific name to avoid collisions.
- Do not rely on a non-existent `hermes skills trust` command; if project discovery is unavailable, use the repository-local discovery mechanism supported by the installed Hermes version and verify by loading from inside the repo.
- After migration, verify the repo contains the new local skill files and that the repository root is still cleanly identifiable as the project root.

## Testing Decisions

- Verify the repo contains `.agents/skills/` with the migrated skill directories.
- Verify the repo-local skill files exist and contain the expected content.
- Verify the repository can still be inspected by Hermes from inside `infocard-pub`.
- Verify the local skill set does not duplicate unrelated global skills.
- Verify the migration does not alter unrelated tracked content before commit.
- Use `git status --short` to confirm the intended file set before packaging with `git-up -sP`.

## Out of Scope

- Rewriting or deleting the global skill registry.
- Refactoring non-infocard shared workflows.
- Changing Hermes core behavior.
- Adding a new trust command.
- Publishing skills to an external registry.
- Changing the repository issue tracker format.

## Further Notes

- The repo already has an `AGENTS.md`, so project-local instructions can coexist with repo-local skills.
- The migration should preserve rollback safety by copying first and cleaning up later only if discovery is confirmed.
- The final packaging step is `git-up -sP`, as requested.
