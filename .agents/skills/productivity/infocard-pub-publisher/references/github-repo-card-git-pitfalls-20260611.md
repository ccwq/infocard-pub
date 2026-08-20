# GitHub Repo Card Git Pitfalls (2026-06-11)

Two critical git lessons from the Codex Orange Book card session that must govern all future GitHub repo card publishing.

---

## Pitfall 1: Always include the HTML file in the initial `git add`

**What happened**: While publishing the Codex card, the agent ran `git add` on the meta.yaml, report.md, avatar, `_index.yaml`, and `index.html` — but forgot to add `docs/20260611-codex.html`. A commit was created without the HTML file. Someone else then pushed a fix commit (`d431ad0`) that included the HTML. The local branch was now behind remote with a divergent commit that added the HTML. Any subsequent `git rebase` of the local branch against the fixed remote caused merge conflicts in the HTML file.

**Impact**: 404 on GitHub Pages for 3+ minutes while the fix propagated. Manual recovery required `git fetch && git reset --hard origin/main` followed by re-applying the content fix.

**The rule**: When publishing a new card, ALL files go into the same `git add` before the first commit:
```bash
git add docs/{slug}.html \
       docs/{slug}.html.meta.yaml \
       docs/{slug}/report.md \
       docs/assets/images/{slug}/avatar.png \
       _index.yaml \
       index.html
git commit -m "Add {slug} technical share card"
git push origin main
```
Do not run `npm run build` and then `git add` in two separate steps for a new card. The build modifies `_index.yaml` and `index.html`, but those changes must be committed alongside the HTML — in the same atomic commit.

---

## Pitfall 2: Remote divergence → `fetch + reset --hard`, NOT `stash + rebase`

**What happened**: When `git push` was rejected due to the remote having the fix commit (`d431ad0`), the agent attempted `git stash && git pull --rebase && git stash pop && git commit --amend`. This caused merge conflicts in `docs/20260611-codex.html` because both the local and remote branches had modified the same file.

**Why stash+rebase fails**: `git rebase` replays local commits on top of remote. If both branches modified the same file (the HTML), git cannot auto-merge — it pauses on the conflict and leaves the agent in a broken rebase state.

**The correct pattern**: when remote has diverged after you made changes, use the **fetch + reset + re-apply** pattern:
```bash
# Step 1: get the clean remote state
git fetch origin
git reset --hard origin/main

# Step 2: re-apply the fix (rewrite the HTML, or re-run the steps)
# ... your fix ...

# Step 3: commit and push (now that you're rebased on the correct remote)
git add docs/{slug}.html docs/{slug}.html.meta.yaml docs/{slug}/report.md \
       docs/assets/images/{slug} _index.yaml index.html
git commit -m "Update {slug} card with full content"
git push origin main
```
**When this applies**: When `git push` is rejected and you know the remote already has the fix (e.g., someone else pushed the HTML file you forgot). No need to rebase your local changes — just `fetch && reset --hard` to the correct remote state, verify the fix is already there, and move on.

**When to use `git rebase --continue`** instead: Only when you intentionally want to replay your local commits on top of a changed remote. In the GitHub repo card workflow, this almost never applies — the "fix" was just the missing HTML file, which is now already on remote.

---

## Bonus: GitHub API null handling for CC licenses

**Symptom**: `curl https://api.github.com/repos/{owner}/{repo}` returns `license: null` in Python when the repo uses a Creative Commons license (CC BY-NC-SA 4.0, etc.). GitHub API returns `None` for `license.spdx_id` on CC-licensed repos.

**Fix**: when extracting the license field, use a safe accessor:
```python
# ❌ Wrong: crashes on CC-licensed repos
license = d.get('license', {}).get('spdx_id')
# ✅ Correct: fallback for null
license = d.get('license', {}).get('spdx_id') or d.get('license', {}).get('name') or 'CC'
```

---

## Bonus: Subdirectory repo README path

When the target project is in a subdirectory of the repository (e.g., `yaojingang/yao-open-tools/tools/TokDoc`), the raw README URL requires URL encoding:

```
https://raw.githubusercontent.com/{owner}/{repo}/main/tools%2FTokDoc%2FREADME.md
```

`/` in paths becomes `%2F`. Always set `source_url` in meta.yaml to reflect the subdirectory path, not the repo root.