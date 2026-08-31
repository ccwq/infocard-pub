# Dotfile / Config-Framework Repo Card Pattern

Use this pattern when the GitHub repo is a **configuration package** that wraps another tool
(shell, editor, terminal multiplexer, etc.) rather than a standalone tool or library.

Canonical examples: `gpakosz/.tmux` (Oh my tmux!), `ohmyzsh/ohmyzsh`, `sorin-ionescu/prezto`,
`amix/vimrc`, dotfile bundles, shell prompt frameworks (starship configs), neovim distros
(LazyVim, AstroNvim).

## How to recognize it

A repo qualifies as a "config framework" if it has all three:

1. A canonical user-facing **shim file** (`.tmux.conf`, `.zshrc`, `init.lua`, etc.) that gets
   symlinked into a well-known location.
2. A **local override file** (`.tmux.conf.local`, `.zshrc.local`, custom directory) that the
   user is expected to edit instead of the main file.
3. An **install script** (curl|bash, or a Makefile/Justfile) that automates symlinking,
   backup, and clone-target path management.

If the repo is a tool/library (its README says "import X" or "run X command"), this
pattern is the wrong default — use the standard repo card pattern.

## Default chapter skeleton (8 sections)

The reader of this card is a candidate user deciding whether to install it, plus an existing
user looking up keybindings. Both jobs must be done by the card.

1. **Hero / identity** — repo name, one-line value statement, stars/forks/license,
   compat range (e.g. `tmux ≥ 2.6`), supported OS matrix, optional `terminal` block showing
   the one-liner install command and 2–3 most common keystrokes.
2. **vs. the bare tool** — two-column comparison: "what the underlying tool gives you out
   of the box" vs "what this config layer adds". This is the most-read section for a
   prospective adopter and must come early.
3. **Core features** — 6–9 small cards (3-col grid on desktop, 2-col on tablet, 1-col on
   mobile) tagged by area (`prefix` / `theme` / `pane` / `copy` / `mouse` / `ssh` / `path`
   / `url` / `tpm`). Each card: one bold sentence + one explanatory sentence.
4. **Install** — all install paths the project supports, in `route` step cards. For each
   path: the exact command block, where files land, where the backup goes. Lead with the
   automatic / recommended path; follow with manual variants. End with a hard rule callout
   (e.g. "never edit the main config file").
5. **Uninstall / restore** — **always include this section**, even if the project has no
   `uninstall.sh`. Most config frameworks do not ship one; the card must reconstruct the
   cleanup from the install script's behaviour:
   - what symlinks to remove
   - what clone directory to remove
   - what backup-suffixed files to `mv` back
   - what plugin directories to also clear if relevant
   - the kill-server / kill-session step needed before cleanup so nothing is held open
6. **Primary keybindings** — full 2-column keybinding table(s). Use `.kbtbl` style.
   Split into reasonable column pairs (session/window left, pane right; or alphabetical).
   Include the prefix convention sentence at the top so newcomers understand `<prefix> x`
   notation.
7. **Secondary keybindings + plugin-manager differences** — copy-mode / visual-mode
   bindings, plus any plugin-manager keys the framework overrides (TPM, antigen, zinit).
   Call out the "don't write X" warnings the upstream doc emphasises.
8. **Tunable variables + boundaries / troubleshooting** — the most-used config knobs from
   the `.local` override file (don't dump the entire variable list; pick what real users
   actually flip), plus a short troubleshooting / pitfalls split into "warn" vs "alert"
   boxes.

Always include the project's compatibility matrix (tool version, OS list) somewhere
visible — config frameworks live or die by their support range.

## Theme selection

`darkgreen` is a strong default: terminal-aesthetic, monitor-panel vibe, fits the dotfile
/ shell / tmux mental model.

`hardblue` works for IDE-style configs (vim/neovim distros, IDE keybinding packs).

Do NOT use `pixelstack`, `scrapbook`, `wood`, `paper-warm` for config frameworks — the
visual register is wrong (too playful / book-like) for a reference card the user will
keep open while configuring their shell.

## Source-collection notes

- README usually has Installation + Bindings + Configuration sections; pull them whole.
- ALSO fetch `install.sh` (or equivalent) via GitHub Contents API and skim it for the
  actual backup/symlink behaviour — README's install instructions usually compress this.
  This is the source of truth for the uninstall section (since there is no uninstall
  script, you reconstruct it from what install does).
- ALSO fetch the `.local` template (e.g. `.tmux.conf.local`) and skim the tunable
  variables — the README usually only mentions a handful, the `.local` file is the
  complete list.
- Examples & GIFs in the README can be linked but do not need to be localised unless the
  card visual layout calls for a hero image. The terminal block in the hero pane usually
  does the job.

## Acceptance gates specific to this pattern

- Uninstall section MUST exist, even if the project doesn't ship one. Reconstruct it.
- Keybinding tables MUST be 2-column-friendly on desktop and stack cleanly on mobile.
- The "vs. bare tool" comparison MUST be a two-column layout, not a flat bullet list.
- The terminal hero block MUST use real, runnable commands from the project — not
  invented placeholders.

## Reference release

`docs/20260622-oh-my-tmux.html` (darkgreen) is the canonical reference card for this
pattern as of 2026-06-22. Reuse its structure for the next config-framework card.
