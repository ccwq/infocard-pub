# X/Twitter Status URL: All APIs Blocked — Always Ask User for Text

**Status**: CONFIRMED BLOCKED — 2026-06-21, Twitter ID `2068322513600602297`

## Symptom

Every API/network approach to fetch X/Twitter status content returns empty or fails:

```bash
# All return nothing useful:
curl -sL "https://api.fxtwitter.com/2068322513600602297"        # empty
curl -sL "https://api.vxtwitter.com/2068322513600602297"         # empty
curl -sL "https://syndication.twitter.com/srv/timeline-status?s..." # empty
curl -sL "https://xcancel.com/api/v1/statuses/2068322513600602297"  # empty
curl -sL "https://nitter.privacydev.net/api/v1/tweets?id=..."     # empty
nitter.privacydev.net/i/status/...                                   # 404
```

`browser_navigate` to `x.com/i/status/<id>` also times out (CDP `Page.enable` timeout).

## Twitter Snowflake ID → Timestamp Decode

If you need the approximate post time without fetching content:

```python
from datetime import datetime, timezone, timedelta
ts_ms = (2068322513600602297 >> 22) + 1288834974657
dt = datetime.fromtimestamp(ts_ms/1000, tz=timezone.utc)
print('UTC:', dt)                   # 2026-06-20 13:18:09+00:00
print('CST:', dt.astimezone(timezone(timedelta(hours=8))))  # 2026-06-20 21:18:09
```

## Correct Behavior

**Always ask the user to paste the tweet text directly.** Do not:
- Pretend to have extracted content you don't have
- Write a card from title/description inference alone
- Spend >2 minutes on API diagnostics before asking

## Publishing Gate

For X status URL tasks: **require user-provided text as the source artifact before HTML/meta/build**.

If the user provides text: proceed with full publish pipeline.
If APIs are blocked and user hasn't provided text: pause and ask.

## Related

- `references/x-status-redirect-and-body-text.md` — older X redirect pattern
- `references/x-status-publish-source-gate.md` — publish gate requirements
- `references/x-status-network-diagnosis.md` — network diagnostic matrix
