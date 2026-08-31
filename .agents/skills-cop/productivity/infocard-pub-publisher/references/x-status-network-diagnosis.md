# X status source collection: direct-network diagnosis pattern

Use this when publishing an infocard from an X/Twitter status URL and normal source collection fails across X page DOM, public readers, syndication, oEmbed, vxtwitter/fxtwitter, or browser-in-page fetch.

## Consent boundary

- Reading a public X post and using public readers is source collection.
- Checking proxy variables, TUN/DNS behavior, TLS routing, or broad connectivity is **network/proxy diagnosis** and needs a separate explicit user authorization if the safety layer asks for it.
- If blocked, stop at `source collection blocked`; do not create HTML/meta, build, push, or wiki-sync from a status ID alone.

## Direct-connection probe

When the user asks to judge direct network state, run a small matrix with `curl --noproxy '*'` so proxy env does not hide the result:

```bash
for url in \
  https://www.google.com \
  https://www.youtube.com \
  https://x.com \
  https://twitter.com \
  https://api.twitter.com/2/tweets/search/recent \
  https://github.com \
  https://ccwq.github.io/infocard-pub/ \
  https://www.bing.com \
  https://www.baidu.com \
  https://www.cloudflare.com \
  https://registry.npmjs.org \
  https://pypi.org; do
  host=$(python3 - <<PY
from urllib.parse import urlparse
print(urlparse('$url').netloc)
PY
)
  ip=$(getent hosts "$host" | awk 'NR==1{print $1}')
  printf '%-45s dns=%-15s ' "$url" "${ip:-DNS_FAIL}"
  curl --noproxy '*' --connect-timeout 8 --max-time 15 -sS -o /dev/null \
    -w 'http=%{http_code} ip=%{remote_ip} tls=%{ssl_verify_result} err=%{errormsg}\n' \
    "$url" || true
done
```

## Interpretation

- `http=200/301/401/403/410` with `tls=0` means TLS/connectivity works; the status may be application-layer auth, redirect, forbidden, or deprecated endpoint.
- `http=000` plus `SSL_ERROR_SYSCALL` / TLS EOF means TLS handshake/routing failed for that host.
- Many unrelated global domains resolving to `28.0.x.x` is a strong signal of local/upstream DNS interception, transparent proxy, TUN, or split-routing rather than normal public DNS.
- A matrix where Google/YouTube/GitHub/Bing work but `x.com`, `cdn.syndication.twimg.com`, `pbs.twimg.com`, vxtwitter/fxtwitter, npm, or PyPI fail indicates selective TLS handling, not general offline state.

## Publishing implication

- If X source artifacts are still absent, do not publish from `status_id + handle + decoded snowflake time` only.
- Offer two next paths: user supplies screenshot/text/media, or user authorizes/fixes network/proxy so source collection can proceed.
- Report the blocked stage precisely: `source collection blocked`, not `publish failed`.
