# Session Notes: Infocard build/rebuild rules

## What the user corrected
- "Rebuild" means **from-scratch structural/visual reconstruction**, not adding more content to an old layout.
- The user later clarified this is more broadly a **build skill**: use the same template for first-time construction and full reconstruction.
- The user is sensitive to visible residual bugs: changing content without fixing the underlying layout/CSS is considered a failed rebuild.

## Strong preferences to encode
- Use a **Swiss red-black high-density style** for repo and technical-analysis infocards.
- Keep the **chapter organization** stable across cards; only insert 1–2 topic-specific modules when necessary.
- Before drafting, run **grill-me with at most 3 questions**.
- Ask **one question at a time**.
- Prefer A/B/C options with a short recommended answer.

## Acceptance rules that repeatedly mattered
- Do not let content accidentally shrink during rebuilds.
- Verify mobile render; do not rely on code diff alone.
- If publishing is requested, verify the public URL after push.
- For info-card tasks, end with a clean worktree if possible.
- **Image count must match user specification** — e.g., "insert 1 image" means exactly 1 image in the output. Verify with a quick regex after writing.

## Common failure mode to avoid
- Treating rebuild as "expanding the old card" instead of re-authoring the structure, spacing, and visual hierarchy.
- Hiding an issue with spacing tweaks while the deeper module structure is still wrong.

## Useful heuristic
- When the layout is fundamentally wrong on mobile, prefer **structural replacement** over incremental patching.

## Verified patterns (this session)

### Subdirectory card paths
Cards can live in subdirectories: `docs/20260531-agent-debt-feature-contract-fork/index.html`.
Meta goes alongside: `docs/20260531-agent-debt-feature-contract-fork/index.html.meta.yaml`.
Path in meta.yaml must match the actual file location exactly.

### Content parity check
```python
import re; from pathlib import Path
html = Path('docs/...').read_text()
text = re.sub(r'<(script|style|noscript)[^>]*>[\s\S]*?</\1>', '', html, flags=re.I)
text = re.sub(r'<[^>]+>', ' ', text); text = re.sub(r'\s+', ' ', text).strip()
print(len(text))  # compare before vs after rebuild
```

### Image count verification
```python
imgs = re.findall(r'<img[^>]+src=["\'](.*?)["\']', html)
print('img count:', len(imgs), [u for u in imgs])
```

### Mobile verification command
```bash
python scripts/verify_mobile_infocard.py <file-or-url> --browser
```

### Git push conflict resolution (infocard-pub)
When remote has new commits (index.yml CI auto-commits `_index.yaml`):
```bash
git fetch origin main && git rebase origin/main
# if _index.yaml conflicts:
python scripts/rebuild_index.py && git add _index.yaml && GIT_EDITOR=true git rebase --continue && git push
```

## Layout patterns observed
- `.gallery { grid-template-columns: repeat(2,1fr) }` for 2-column image grids.
- `figure.fig.alt { grid-column:1/-1 }` for full-width spanning.
- `.grid4` for 4-column step/card grids.
- `.summary-grid { grid-template-columns:repeat(3,1fr) }` for verdict summaries.
- Mobile collapse: all multi-column grids to `1fr` at `@media (max-width:760px)`.

## What NOT to capture
- Git push conflicts are a workflow artifact, not a durable rule — but the resolution pattern is worth keeping since it recurs every session.
- Temporary tool errors that resolved during the session.