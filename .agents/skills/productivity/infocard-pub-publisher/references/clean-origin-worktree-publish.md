# Clean origin/main worktree publish isolation

Use this when publishing a new infocard but the main worktree is ahead of `origin/main` with unrelated local commits, dirty with another card, or otherwise risks bundling the wrong work into the push.

## Why

Infocard publishing is path-sensitive: a local branch may contain older/unrelated card commits. If you push from that branch, you can accidentally publish more than the current requested card. The safe pattern is to publish the current card from a clean worktree based on `origin/main`, copying only the current bundle.

## Pattern

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
SRC="$REPO_ROOT"
TMP=/tmp/infocard-pub-<slug>-publish
rm -rf "$TMP"

git -C "$SRC" fetch origin main
git -C "$SRC" worktree add -B publish-<slug> "$TMP" origin/main

mkdir -p "$TMP/docs/assets/images/<slug>"
cp "$SRC/docs/<slug>.html" "$TMP/docs/"
cp "$SRC/docs/<slug>.html.meta.yaml" "$TMP/docs/"
cp "$SRC/docs/<slug>.report.md" "$TMP/docs/"
# copy only assets actually referenced by the current HTML
cp "$SRC/docs/assets/images/<slug>/..." "$TMP/docs/assets/images/<slug>/"

cd "$TMP"
npm run build && npm run verify
git add docs/<slug>.html docs/<slug>.html.meta.yaml docs/<slug>.report.md \
  docs/assets/images/<slug>/ _index.yaml index.html
git commit -m "feat: add <slug> card"
GIT_HTTP_VERSION=HTTP/1.1 git push origin publish-<slug>:main
```

After push succeeds, synchronize the main working tree:

```bash
git -C "$SRC" fetch origin main
git -C "$SRC" reset --hard origin/main
git -C "$SRC" status --short
```

## Verification

Continue the normal publish gate:

- public detail page HTTP 200
- public detail page contains title and key terms
- public `_index.yaml` contains the slug and expected style
- public image assets return HTTP 200
- homepage search finds the card
- 390px mobile check has no horizontal overflow
- high-value cards are synced to LLM Wiki and the wiki repo is committed

## Pitfalls

- Do not copy whole `docs/` or use `git add .` in the clean worktree; that defeats isolation.
- Do not report success after the worktree push alone; Pages and wiki verification are still required.
- If the source main worktree had unrelated local commits, resetting it to `origin/main` after a successful isolated push is intentional: the remote now reflects the clean published state for this card only.
