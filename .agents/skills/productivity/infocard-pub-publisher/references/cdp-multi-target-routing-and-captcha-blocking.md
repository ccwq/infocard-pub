# CDP Multi-Target Routing + Captcha Blocking (2026-07-03)

## browser_snapshot returns (empty page) → Multi-Target CDP Routing

**Symptom**: `browser_navigate` succeeds but `browser_snapshot` returns `(empty page)`. Subsequent `browser_cdp` calls with `Runtime.evaluate` fail: `No target with given id found`.

**Root cause**: The CDP session is attached to a browser target (tab) that hasn't fully loaded its DOM, or the page is in a sub-frame/OOPIF.

**Correct workflow**:
```javascript
// Step 1: List all targets
browser_cdp(method='Target.getTargets', params={})
// Returns: {targetInfos: [{targetId, type, url, title, attached, parentFrameId}]}

// Step 2: Pick the right targetId
// - For main page: type='page', url matches what you navigated to
// - For iframes: type='iframe', parentFrameId points to parent
// - Target must have attached=true to receive CDP commands

// Step 3: Use targetId in all subsequent CDP calls
browser_cdp(
  method='Runtime.evaluate',
  params={expression: '...', returnByValue: true},
  target_id='<correct-targetId>'
)

// Step 4: For Page.captureScreenshot, also pass target_id
browser_cdp(
  method='Page.captureScreenshot',
  params={format: 'png', quality: 80},
  target_id='<correct-targetId>'
)
```

**Key signals that indicate multi-target is needed**:
- `browser_snapshot` returns `(empty page)` + `element_count: 0`
- Page has iframes (especially: Tencent captcha, WeChat QR, ad slots)
- `Runtime.evaluate` returns `No target with given id found`
- `browser_vision` works but `browser_cdp` commands fail

**Common iframe sources that cause this**:
- `turing.captcha.gtimg.com` → Tencent slider captcha
- `open.weixin.qq.com` → WeChat QR code login iframe
- Third-party auth providers embedded as iframe

## Tencent Slider Captcha Blocking SMS on Chinese Sites

**Symptom**: Clicking "获取验证码" on MiniMax (or similar Chinese sites) triggers a Tencent slider captcha (URL contains `turing.captcha.gtimg.com`). CDP cannot auto-pass this captcha.

**What happens**:
- Site detects "automated" browser behavior
- Intercepts SMS send request
- Shows slider puzzle ("请拖动下方滑块完成验证")
- Page state: captcha iframe is visible, SMS API call is blocked

**Correct behavior**:
1. Tell the user the captcha appeared
2. User completes the slider manually in the browser
3. After captcha passes, CDP can continue
4. Do NOT repeatedly retry or attempt to bypass — this wastes time

**Alternative for infocard/automation tasks**: If the login task is only needed for a one-off action (not the main workflow), use the user's existing authenticated session instead of automating the login flow.

## CI fix-taxonomy Diff Failure (Confirmed 2026-07-02)

**Symptom**: CI `Verify Generated Index Artifacts` fails at `git diff --exit-code` despite `npm run verify` passing locally. The diff shows changes to `_index.yaml` content.

**Root cause**: CI workflow runs `npm run verify` without first running `npm run build`. The verify script rebuilds `_index.yaml` from scratch (fresh npm install, clean node_modules). The rebuilt `_index.yaml` differs from the committed one because `fix-taxonomy` has inferred better taxonomy fields for some cards (e.g., `domains`, `tool_types`) but those weren't written back to the committed meta.yaml files.

**Correct CI workflow** (now in `.github/workflows/index.yml`):
```yaml
- name: Build site
  run: npm run build

- name: Fix taxonomy completeness
  run: npm run fix-taxonomy

- name: Verify generated artifacts
  run: npm run verify

- name: Verify taxonomy completeness
  run: npm run verify-taxonomy

- name: Ensure generated artifacts are committed
  run: git diff --exit-code
```

**Key rule**: Always `npm run build` before `npm run verify` in CI. Local runs may pass because the working tree already has the build artifacts from the previous session.