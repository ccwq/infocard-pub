# GitHub API 403 + Mobile Verification Workflow

> 2026-06-27 session notes. Patterns observed during Aider + 牛肉项目雷达 dual-card publish.

## GitHub REST API Rate Limit Fallback

**Problem**: GitHub REST API (`api.github.com/repos/...`) returns `HTTP 403` consistently, even with a User-Agent header. Caused `stars: N/A forks: N/A` when trying to fetch repo metadata for both cards.

**Root cause**: Authenticated or rate-limited API endpoint. This environment does not have a GitHub token configured for `api.github.com`.

**Reliable fallback sequence** (confirmed working 2026-06-27):

1. **Browser navigate to repo page**: `browser_navigate("https://github.com/{owner}/{repo}")` — returns full repo snapshot with stars, forks, description, topics, language, recent commits.
2. **Browser navigate to README**: `browser_navigate("https://raw.githubusercontent.com/{owner}/{repo}/main/README.md")` — returns raw markdown README (may redirect on rate-limit, still usable).
3. **GitHub Contents API** (for binary assets): `https://api.github.com/repos/{owner}/{repo}/contents/{path}` — base64 decodes the response. Works when REST API is rate-limited but Contents API is not.

**Never spend >30s retrying `api.github.com`** — the 403 is structural, not transient.

```python
# GitHub Contents API (works on 403)
import urllib.request, base64, json
url = f'https://api.github.com/repos/{owner}/{repo}/contents/README.md'
req = urllib.request.Request(url, headers={'User-Agent': 'Hermes'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = json.load(r)
content = base64.b64decode(data['content']).decode('utf-8')
```

**Evidence collected from browser** (acceptable when API fails):
- Stars / forks from repo page snapshot
- Last commit date from commit history table
- Description, topics, language from repo header
- README content from raw URL

---

## Mobile Viewport Verification: System Chrome Headless

**Problem**: CDP `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot` timed out (30s) in a crowded browser session. `browser_vision` and `vision_analyze` both returned `auth_unavailable` errors.

**Reliable fallback**: System Chrome headless binary at `/usr/bin/google-chrome`.

```bash
# Mobile 390px screenshot
google-chrome --headless=new \
  --disable-gpu \
  --screenshot=/tmp/shot-390.png \
  --window-size=390,844 \
  --force-device-scale-factor=2 \
  http://127.0.0.1:4173/docs/<slug>.html

# Desktop 1280px screenshot
google-chrome --headless=new \
  --disable-gpu \
  --screenshot=/tmp/shot-desktop.png \
  --window-size=1280,900 \
  http://127.0.0.1:4173/docs/<slug>.html
```

**File size check**: A ~214KB PNG confirms a full-page screenshot was taken (390px × 844px × 2× = content captured).

---

## Vision Analysis: `mcp_minimax_understand_image` as Primary

**Problem**: Both `browser_vision` and `vision_analyze` returned `auth_unavailable: no auth available (providers=gemini-cli,xinyuanai666.com@google-key, model=gemini-3-flash-preview)`.

**Working engine**: `mcp_minimax_understand_image` with `MiniMax` provider.

```python
# Python execute_code style
mcp_minimax_understand_image(
    image_source="/tmp/shot-390.png",
    prompt="检查这张 390px 移动端截图：是否有横向溢出、表格挤压、流程图过宽、页脚遮挡、字号过小，给出明确 PASS/FAIL 和需要修的点。"
)
```

**CDP screenshot is NOT the vision engine**: `browser_vision` uses the active model's built-in vision (fails with auth error). `mcp_minimax_understand_image` is a separate MCP tool that routes to MiniMax's vision API — it works when the active model is in auth error.

**Workflow**: CDP override viewport → `browser_cdp(Page.captureScreenshot)` OR `google-chrome --headless` → `mcp_minimax_understand_image` for analysis.

---

## Git Rebase Conflict with Generated Files: Stash + Build + Continue

**Problem**: After `git pull --rebase --autostash origin main`, `_index.yaml` and `index.html` had merge conflicts. The rebase was stuck waiting for conflict resolution.

**Pattern** (confirmed 2026-06-27 with Aider card):

1. **Stash unrelated untracked files** (if they block the rebase):
   ```bash
   git stash push -m 'temp unrelated files' -- docs/20260619-follow-builders-bigwhite.html theme/sage-swiss.html
   ```

2. **Run `npm run build`** to regenerate the conflicted `_index.yaml` and `index.html` from the current meta.yaml tree. The regenerated files represent the authoritative latest state.

3. **Stage the regenerated files + new card files**:
   ```bash
   git add _index.yaml index.html docs/<slug>.html docs/<slug>.html.meta.yaml
   ```

4. **Continue the rebase**:
   ```bash
   GIT_EDITOR=true git rebase --continue
   ```

5. **Push**: `GIT_HTTP_VERSION=HTTP/1.1 git push origin main`

**Why this works**: `_index.yaml` and `index.html` are generated artifacts — they should always reflect the authoritative build output, never hand-merged conflict markers. Regenerating them after a rebase restores the correct state without needing to hand-resolve conflict markers.

**When to use this vs `--theirs` checkout**: Use `--theirs` checkout only when you need to discard the incoming (remote) changes and keep local. Use the build-regenerate pattern when both local and remote `_index.yaml`/`index.html` are stale generated artifacts — neither is a meaningful source of truth, so regenerate from the current meta.yaml tree.

**Pre-emptive step**: Run `git fetch && git status -sb` before any rebase to check whether the remote has diverged. If it has and you have local unpushed commits, apply this pattern proactively.
