# Infocard Update Existing Card Pattern

## When to use

User says "补充信息卡 X" / "add content to card X" / "expand card X" / "补全信息卡" — i.e., patching an already-published card rather than creating a new one. This is a distinct workflow from create-from-scratch.

## Trigger conditions

- Card already exists in `infocard-pub` with a published GitHub Pages URL
- New content is additive (new sections, new data, new details) — NOT a rebuild/retheme
- Card style/theme remains the same; no CSS reconstruction
- Sidecar `.meta.yaml` already exists

## Two-commit pattern

**Commit 1 — Content**: the actual HTML changes
```
git add docs/<slug>.html _index.yaml index.html
git commit -m "feat(<name>): <brief change description> (YYYY-MM-DD)"
git push origin HEAD:main
```

**Commit 2 — Audit**: update `.meta.yaml` with `release_audit` block
```
# After public verification passes:
git add docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "audit: record <name> <brief change> public verification"
git push origin HEAD:main
```

## release_audit fields for updates (schema 1)

```yaml
release_audit:
  schema: 1
  published_commit: "<content commit SHA>"   # 回填内容 commit
  pages_url: "<full GitHub Pages URL>"
  verified_at: "<ISO timestamp>"
  visual_status: "VISUAL_PENDING"            # 截图异常时用此值
  added_sections: "07快捷键速查表,08场景化配置方式"  # 逗号分隔新章节
  content_delta: "+201 lines (shortcuts/config/keymap/plugins)"  # 简短变更说明
```

## HTML surgery pattern

When adding new numbered sections before an existing numbered section:

1. Read the file to find the target insertion point (the section you want to insert BEFORE)
2. Use `patch` with `old_string` = the section header line of the target section
3. New content goes BEFORE that `old_string`
4. Renumber subsequent sections: old section 07 → 12, etc. (increment by number of new sections added)

**Example** (from Fresh card, adding 5 sections before "README 预览" which was section 07):
```
old_string:  <div class="sec-head"><span class="num">07</span><span class="label">README 预览</span></div>
new_string:  [5 new section blocks]
             </section>

             <section class="section">
               <div class="sec-head"><span class="num">12</span><span class="label">README 预览</span></div>
```

## Research requirement for updates

Even though the card exists, updates need fresh research on the NEW content areas. Do NOT assume old research is still valid or sufficient.

**Required steps**:
1. Fetch current card source: `git show origin/main:docs/<slug>.html`
2. Identify what new factual content is needed
3. Research from primary sources (GitHub README, official docs, API docs)
4. Only write content that can be verified from sources — do not hallucinate details

**Example**: Fresh card update needed fresh research on:
- Fresh keybindings (from `docs/configuration/keyboard.md` in the Fresh repo)
- Plugin system (from `docs/plugins/index.md`)
- Settings sync, keymap download sources

## Capacity and workflow

- Worktree: same as create-from-scratch (`git worktree add /tmp/infocard-<slug>-update origin/main --detach`)
- Build → verify → leak scan → mobile check → commit → push → public verification → audit commit → cleanup
- If the card has existing `release_audit`, patch the YAML (do not duplicate the block — update `published_commit` to new content SHA and add new `added_sections` entry)

## Pitfalls

- **Renumbering miss**: After inserting N new sections before section X, all subsequent sections must be incremented by N. Always verify with browser console: `Array.from(document.querySelectorAll('.sec-head')).map(h => h.textContent.trim().replace(/\s+/g,' ')).join('\n')`
- **Audit commit contains content changes**: Audit commit should ONLY touch the `.meta.yaml` sidecar, `_index.yaml`, and `index.html` (build-generated). Never include HTML content changes in the audit commit.
- **Missing research**: Writing update content from memory without re-reading official docs is a common source of factual errors. Always research from primary sources even if you "know" the tool.
- **Missing `updated` field**: When patching an existing sidecar, also update the top-level `updated` field (not just inside `release_audit`).

## Visual verification for updates

Same as new card: 390px DOM check via browser console (`scrollWidth === 390`), then `browser_vision`. If vision tool returns unrelated content (historical issue with the tool), record `VISUAL_PENDING` — do not claim visual passed.
