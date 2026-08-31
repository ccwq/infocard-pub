# High-density skill-registry cards

Session-derived pattern for GitHub repos that are actually **skill / workflow registries** (e.g. Codex skills, Claude skills, agent plugins, tool ecosystems).

## What to treat the source as
- Not a plain “awesome list”.
- Not a blog-style product explainer.
- Treat it as a **workflow distribution layer**: installable units, metadata-triggered activation, category lattice, and onboarding path.

## Extraction order
1. **Repo tagline / one-line promise**
   - Convert to a title-level conclusion, not a neutral repo name.
2. **Install path**
   - First thing a reader needs is “how do I add this to my agent?”.
3. **Trigger mechanism**
   - Usually `description`, metadata frontmatter, or installer behavior.
4. **Category map**
   - Collapse the directory tree into 4–6 functional groups.
5. **First installs**
   - Surface the 6–10 highest-leverage skills first; don’t flatten everything into one list.
6. **Boundary / non-goals**
   - Spell out what the registry is good for and what it should not be used for.

## Density recipe
Use a high-density but readable first fold:
- Title = conclusion
- Subtitle = why it matters
- 4 stats = install method / trigger / main entry / category count
- Section 1 = core judgment
- Section 2 = category map
- Section 3 = recommended first installs
- Section 4 = official links / boundary

## Visual emphasis
- Prefer a compact 2×2 stat block on top.
- Make the first section say **why this registry exists**.
- Keep item cards small: `name + one-sentence role`.
- If the page feels too dense, compress per-item copy before shrinking typography.

## Common pitfall
- A registry card that only lists categories and links feels like a directory dump.
- The fix is to surface the **workflow semantics**: what gets installed, what triggers it, and what should be used first.

## Source-specific note
When the repo’s canonical README lives on a non-default branch or a raw URL path 404s, match the branch/path shown on the repository page instead of assuming `main`.
