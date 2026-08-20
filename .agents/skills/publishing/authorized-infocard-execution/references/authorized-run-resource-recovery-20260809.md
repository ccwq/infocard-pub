# Authorized infocard run: resource recovery and visual evidence

## Incident pattern

A multi-card publish had explicit create-and-publish authorization. Intermediate screenshot automation failed, and the run was incorrectly paused for repeated user confirmation. The correct response is to preserve authorization and switch tools.

## Reliable recovery ladder

1. Existing Chrome CDP 9222: inspect tabs, navigate a dedicated preview tab, read DOM dimensions.
2. Local HTTP preview: verify each exact card URL returns 200.
3. System Chrome headless: capture one card and one viewport per command with `--window-size=390,844` and `--window-size=1280,900`.
4. For long pages, capture a bounded viewport or region; do not use an artificial height such as 5000px as proof of full-page layout.
5. Read `document.documentElement.scrollHeight`, `document.body.scrollHeight`, `scrollWidth`, and `clientWidth` before interpreting visual output.
6. Use `vision_analyze` serially or in small groups. A provider capacity error is an infrastructure result; do not turn it into a new user-confirmation gate.
7. Run build → stage generated indexes → verify-index → stage declared cards → leak scan → commit → `git push origin HEAD:main`.
8. Verify Pages workflow SHA, raw GitHub content, exact Pages URL, and release fingerprint separately.

## Screenshot diagnosis

- First-screen screenshots naturally omit lower sections; that is not CSS clipping.
- A 5000px screenshot viewport can create empty canvas below a 2,300px page; vision may call this a layout defect. Compare DOM scroll height with screenshot height.
- If vision reports a footer clipped or a huge blank area, recapture at actual page height or by region before patching HTML/CSS.
- DOM overflow equality is necessary but not sufficient for visual PASS; retain both DOM evidence and screenshot disposition.

## Closeout record

For each card record:

```text
slug:
desktop_screenshot:
mobile_screenshot:
page_height:
mobile_scroll_width:
mobile_client_width:
critical:
major:
minor:
visual_status:
commit:
pages_workflow:
public_url_status:
```

Keep unresolved URL-path mismatches visible. A raw GitHub 200 proves repository content, not necessarily Pages delivery.
