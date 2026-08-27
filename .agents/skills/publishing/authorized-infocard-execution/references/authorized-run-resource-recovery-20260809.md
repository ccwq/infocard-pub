# Historical incident: authorized infocard run resource recovery

> Historical case study only. Do not execute this document as a current recovery
> SOP. Current authorization, staging, visual gates, and publication follow
> `infocard-publish-sop` in the main checkout.

## Incident pattern

A multi-card publish had explicit create-and-publish authorization. Intermediate screenshot automation failed, and the run was incorrectly paused for repeated user confirmation. The correct response is to preserve authorization and switch tools.

## Historical recovery observations

The incident exposed these observations, retained for diagnosis and review:

- Inspect the existing browser session and DOM dimensions before interpreting screenshots.
- A local HTTP 200 or a first-screen screenshot is not visual acceptance evidence by itself.
- Long pages need bounded viewport or region captures; an artificial 5000px viewport is not proof of full-page layout.
- Provider capacity errors are infrastructure results and should not silently become a new user-confirmation gate.
- Build, staging, verification, commit, push, and public verification belong to the ordered `infocard-publish-sop` flow; this historical note does not prescribe those commands.

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
