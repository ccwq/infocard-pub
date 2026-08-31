# Codex Multi-agent V2 layout incident (2026-07-30)

## Symptom
A desktop screenshot showed the second and third cards in a three-card section with headings inside their borders but descriptions rendered outside: one to the right, one below. Mobile screenshots could look acceptable while desktop remained broken.

## Root cause
The affected markup had prematurely closed card content, so the description `<p>` became a sibling of the card instead of a child. CSS changes such as `overflow-wrap`, `max-width`, `overflow:hidden`, and `min-width:0` could not reliably repair DOM ownership.

## Diagnosis and repair
1. Inspect the exact rendered screenshot and identify the card whose heading/content ownership is broken.
2. Inspect the exact section source or browser `parentElement`; verify each card owns its heading and paragraph.
3. If the paragraph is a sibling, repair/rewrite the HTML block first; do not spend repeated iterations on overflow CSS.
4. Prefer a known-good sibling structure (`.grid-3` + `<article class="card">` with nested `<h3>` and `<p>`) over a new layout variant.
5. Re-screenshot desktop and mobile after the structural repair.

## Publishing lessons
A feature worktree can contain a card while the public `main` branch does not. Verify `git log origin/main`, the committed path on `main`, and the exact public URL independently. If the primary checkout is dirty or a worktree is stale, create a fresh worktree from current `origin/main`; do not force-reset an occupied worktree or merge generated indexes blindly. A local build/commit is not evidence of Pages availability; wait for propagation and verify `/docs/<slug>.html?cb=<commit>` with HTTP 200.
