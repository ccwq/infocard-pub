---
name: infocard-preview-delivery
description: Use when delivering infocard preview URL to user.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, preview, tunnel, cloudflared, delivery]
    related_skills: [infocard-creation-preview-standards, webpage-vision-inspect-skill]
---

# Infocard Preview Delivery

## Core Rule (2026-07-28 confirmed)

**When the user needs to visually review or approve an infocard, you MUST provide a publicly reachable URL before the next step.** This is a hard gate, not optional.

`localhost:4173` is not valid delivery. Static build checks are not visual review.

## Standard Sequence

```
1. Start local preview server
2. curl -sI http://localhost:<port>/docs/<slug>.html → HTTP 200
3. Start tunnel → get public URL
4. curl -sI <tunnel-url>/docs/<slug>.html → HTTP 200
5. Send URL to user
6. Wait for confirmation
7. Only then: proceed to next step
```

## Default Tunnel: cloudflared (no account needed)

```bash
# Download once
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o /tmp/cloudflared && chmod +x /tmp/cloudflared

# Start tunnel (point to your preview port)
/tmp/cloudflared tunnel --url http://localhost:<PORT>

# URL ready in ~10s: https://instance-xxxx-xxxx.trycloudflare.com
```

Ready signal: logs show `Environment is healthy`. URL format: `https://*.trycloudflare.com`.

## WireGuard (only when user provides peer config)

Use only when user explicitly requires WG and provides the peer `.conf`.

```bash
wg setconf wg0 /path/to/peer.conf
ip link set wg0 up
```

## Environment (2026-07-28)

| Item | Value |
|---|---|
| Public IP | `43.198.95.38` |
| Preview port | `4173` |
| cloudflared binary | `/tmp/cloudflared` (v2026.7.3) |
| WG tools | `/usr/bin/wg` (no wg0 interface) |

## What NOT to Do

- ❌ Deliver a `localhost:` URL
- ❌ Report "preview ready" without a public URL
- ❌ Proceed before user confirms they can see it
- ❌ Assume cloudflared is pre-installed — download first

## Public release proof (2026-08-15)

A preview URL and a final published URL are different evidence classes. When proving a public release or repair, reopen the exact public URL with a cache-busting query, verify page identity and current structural/theme markers, capture the rendered page at the required viewport(s), and send the real PNG path. A localhost screenshot, stale browser tab, or virtual supervisor screenshot path is not proof of online publication. Any HTML/CSS change invalidates earlier screenshots and requires fresh public captures after push and Pages propagation.

## Relationship

- `infocard-creation-preview-standards` — local preview surface (`live-server` + port 5588)
- `webpage-vision-inspect-skill` — structured multi-shot visual inspection after URL delivery
