# Fast local preview with live-server on port 5588

## Rule

For infocard-pub quick previews, use `live-server` on local port `5588` and return the preview URL immediately after the server is ready.

## Command

Run from the infocard-pub repository root:

```bash
live-server --host=0.0.0.0 --port=5588 --no-browser .
```

Use Hermes background process tracking for the server, not shell-level `&`/`nohup`.

## URL shape

For a card under `docs/<slug>.html`, return:

```text
http://10.6.8.14:5588/docs/<slug>.html
```

Also verify loopback if needed:

```text
http://127.0.0.1:5588/docs/<slug>.html
```

## Verification

Before giving the URL, confirm HTTP 200 on the target path, for example:

```bash
python3 - <<'PY'
import urllib.request
url='http://10.6.8.14:5588/docs/SLUG.html'
r=urllib.request.urlopen(url, timeout=5)
print(r.status)
PY
```

If `10.6.8.14` fails but `127.0.0.1` works, report both clearly and do not claim the LAN URL is usable.

## Port conflict handling

If port 5588 is already occupied:

1. Check whether it is an existing `live-server` for `infocard-pub`.
2. If yes, reuse it and verify the requested path.
3. If no, report the conflict before killing anything unless the user explicitly asked to reset the preview service.

## Reporting

Return the preview URL first, then mention the verification result. Example:

```text
预览已就绪：
http://10.6.8.14:5588/docs/xxxx.html

已验证：HTTP 200。
```
