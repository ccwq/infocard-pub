---
name: web-capture
description: Use when a web page needs screenshots or device simulation. Capture desktop, mobile, and tablet screenshots via agent-browser and return auditable image paths.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [web, screenshot, capture, agent-browser, responsive, visual-evidence]
    related_skills: [infocard-publish-sop, visual-verification-gate, infocard-visual-evidence-grounding]
---

# Web Capture Skill

## Purpose

Use this skill whenever a workflow needs **web screenshots** or **browser-device simulation**. It is the single preferred capture gate for infocard-pub web visual checks.

This skill is responsible for:

- selecting the correct browser tab
- switching to a target viewport / simulated device
- capturing desktop, mobile, or tablet screenshots
- returning screenshot paths and geometry checks
- refusing to fake evidence when capture fails

It does **not** perform visual judgment. Callers still run `vision_analyze` and apply their own critical / major / minor rules.

## Non-negotiable policy

- **Preferred capture engine:** `agent-browser --cdp 9222`
- **Do not use** `browser_exec` screenshot helpers for web capture when this skill is available
- **Do not use** `browser_exec` `Page.captureScreenshot` / Python WebSocket CDP as the primary path
- If `agent-browser` cannot capture, report the blocker; do not silently downgrade the evidence path

## Device presets

Use these presets unless the caller requests a specific viewport:

| Preset | Viewport | Notes |
|---|---:|---|
| `pc` | `1280x900` | Default desktop gate for infocard previews |
| `desktop` | `1440x900` | Optional wide desktop capture |
| `mobile` | `390x844` | Default mobile gate for infocard previews |
| `tablet` | `820x1180` | Default tablet-like responsive check |

These are viewport presets, not full UA impersonation profiles.

## Standard capture flow

1. `agent-browser --cdp 9222 tab list` to find the stable tab id.
2. `agent-browser --cdp 9222 tab <id>` to focus the target page.
3. `agent-browser --cdp 9222 get url` and `get title` to confirm identity.
4. `agent-browser --cdp 9222 set viewport <w> <h>` using a preset or caller-supplied size.
5. `agent-browser --cdp 9222 eval` to read geometry when responsive correctness matters.
6. `agent-browser --cdp 9222 screenshot <path>` to write the PNG.
7. Hand the PNG path to the caller for `vision_analyze` or further checks.

## Required geometry checks

For responsive pages, verify at least:

```js
({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  scrollHeight: document.documentElement.scrollHeight
})
```

If `scrollWidth > clientWidth`, report overflow risk before claiming success.

## Tablet / mobile notes

- Mobile screenshots should use `390x844` unless the caller needs a narrower phone size.
- Tablet screenshots should use `820x1180` unless the caller needs iPad mini / iPad classic proportions.
- If the page includes sticky headers, verify the target region is still visible after viewport switch.
- If a long page needs multiple evidence regions, capture each region separately rather than relying on one full-page image.

## Output expectations

Return:

- tab id used
- final URL
- viewport preset or exact viewport
- screenshot path(s)
- any geometry anomalies

## Caller integration

Higher-level infocard and web visual skills must route screenshot work through this skill instead of embedding their own capture commands. They may still perform DOM checks and vision review after capture.

## Examples

```bash
agent-browser --cdp 9222 tab list
agent-browser --cdp 9222 tab t3
agent-browser --cdp 9222 set viewport 1280 900
agent-browser --cdp 9222 screenshot /tmp/visual/desktop.png

agent-browser --cdp 9222 set viewport 390 844
agent-browser --cdp 9222 eval 'JSON.stringify({innerWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth})'
agent-browser --cdp 9222 screenshot /tmp/visual/mobile.png
```

## Failure handling

- If the page is inaccessible, return the failure clearly.
- If the screenshot tool times out, do not switch to another screenshot stack without explicit caller direction.
- If the page identity is uncertain, stop and ask for the target URL or tab.

## Related workflows

- infocard publish / visual gate: route all web screenshots through this skill
- social post extraction: use this skill for verification screenshots
- any other web page needing visual evidence: use this skill before analysis
