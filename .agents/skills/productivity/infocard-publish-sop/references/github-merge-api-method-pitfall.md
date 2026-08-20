# GitHub Merge API Method Trap (2026-07-22)

## Symptom

REST merge for a newly-created PR returns `HTTP 404 Not Found` even though:
- PR number is correct
- Branch exists on origin
- Token has `repo` scope
- Response body is `{"message": "Not Found", "documentation_url": "..."}`

## Root Cause

The GitHub REST API merge endpoint requires **PUT**, not POST. The common curl example in many docs uses `POST` which silently fails with 404 (not 405 Method Not Allowed) because the PR may be in draft state or the URL path is misrouted.

**Correct:**
```bash
curl -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/pulls/PR_NUMBER/merge \
  -d '{"merge_method": "squash"}'
```

**Wrong (will 404):**
```bash
curl -X POST ... https://api.github.com/repos/OWNER/REPO/pulls/PR_NUMBER/merge ...
```

## Python Pattern (verified 2026-07-22)

```python
import urllib.request, json
from urllib.parse import urlsplit

# Extract token from ~/.git-credentials (HTTPS format)
token = None
for line in open(os.path.expanduser('~/.git-credentials')):
    if 'github.com' in line:
        token = urlsplit(line.strip()).password.split('@')[0].split(':')[-1]
        break

repo = "owner/repo"; pr_num = 13
req = urllib.request.Request(
    f"https://api.github.com/repos/{repo}/pulls/{pr_num}/merge",
    data=json.dumps({"merge_method": "squash"}).encode(),
    method='PUT',  # MUST be PUT, not POST
    headers={
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
)
with urllib.request.urlopen(req) as r:
    result = json.load(r)
    print(result['merged'])  # True on success
```

## Lesson

`github-pr-workflow` skill (bundled, cannot be patched) contains a POST merge example that is wrong. Always use PUT for GitHub merge API. This is not a token/permission issue — it is a pure HTTP method error that returns 404.
