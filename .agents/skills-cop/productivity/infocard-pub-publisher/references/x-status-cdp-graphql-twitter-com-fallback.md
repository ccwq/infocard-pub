# X Status via CDP/GraphQL: twitter.com API fallback

## Trigger

Use when publishing an infocard from an X/Twitter status URL and normal page DOM, oEmbed, syndication, vxtwitter/fxtwitter, or `x.com/i/status/...` extraction does not expose the tweet body/media.

## Durable pattern

1. Use CDP to reuse the logged-in browser only for evidence discovery and to confirm targets/tabs. Do not persist or print auth/cookie/CSRF/Bearer values.
2. Prefer X GraphQL operation `TweetResultByRestId` for the canonical tweet object. If `https://x.com/i/api/graphql/...` fails with TLS close/connection resets, retry the same request against `https://twitter.com/i/api/graphql/...`.
3. Build the request with:
   - status id as `variables.tweetId`
   - current browser/session headers only in-process
   - `note_tweet.note_tweet_results.result.text` as the full long tweet when `legacy.full_text` is truncated
   - `note_tweet.note_tweet_results.result.entity_set.urls` for expanded links
   - `legacy.extended_entities.media` for media URLs
   - `core.user_results.result.core` for author name/screen name
   - `legacy` + `views.count` for interaction metrics
4. Redact all credential-like strings in logs and reports. Never write cookies, CSRF tokens, Bearer tokens, or connection strings into reports, wiki, cards, or summaries.
5. If `pbs.twimg.com` media download fails but GraphQL returned a media URL and dimensions, do not hotlink the image. Either use a locally captured screenshot/vision evidence or create a local explanatory/redrawn asset and explicitly note that the original media URL was captured but not downloaded.

## Minimal extraction fields

Required before generating HTML:

- canonical URL / handle
- author name and screen name
- created_at, converted to Asia/Shanghai for visible date
- full tweet text, preferring `note_tweet` text
- expanded URLs
- media URLs and dimensions, even if download fails
- reply / retweet / quote / like / bookmark / view counts if present

## Verification notes

- Treat `x.com` TLS failures as host-specific, not proof that Twitter API access is impossible; test `twitter.com` separately.
- If media host fails, the card can still publish only if the failure is disclosed and all referenced images are local assets returning HTTP 200 after publish.
- Do not leave external `pbs.twimg.com` references in `<img src>`; they are allowed only as provenance text.
