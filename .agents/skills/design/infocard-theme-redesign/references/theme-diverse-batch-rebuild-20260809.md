# Theme-diverse batch rebuild reference

## Theme map before authoring
For every batch of three or more cards, write an explicit per-card map:

```text
slug | content_form | primary_theme | alternative_theme | rejection_rationale
```

Do not let a batch generator silently fall back to one embedded CSS skeleton. A same-theme batch is allowed only when all cards genuinely share content form, reader scenario, and evidence/information-density profile.

## Preserve body content during a theme rebuild

1. Extract the original `<body>` content.
2. Hash the body and record visible-text length, section/article counts, and source-link count.
3. Rebuild only the outer HTML shell, CSS, theme metadata, and responsive structure.
4. Recompute the same metrics and abort if any differ unexpectedly.
5. Add normalized HTML `data-theme="<bare-slug>"` and sidecar `style: "infocard-<slug>-style"`; compare both after normalizing to the same registered theme slug.

The metadata declaration is not proof of an applied theme. The rendered HTML must contain the target token system and at least two structural signatures of that theme.

## Exact preview identity gate

Before sending any screenshot to visual review:

- Fetch the exact URL from the exact server/port.
- Require HTTP 200.
- Verify the expected `<title>` and a card-specific identity string.
- Reject any response containing `Error response`, `404`, or an unrelated title.
- If a stale/occupied port serves an old directory or a 404 page, discard every screenshot from that port and recapture from a known-good server.

For GitHub Pages, verify the repository's actual route shape. In this project, card pages are under `/docs/<slug>.html`; a successful Raw GitHub URL does not prove that a guessed Pages URL is correct.

## Evidence rule

HTTP 200, DOM/accessibility output, `scrollWidth === clientWidth`, and CSS inspection are preconditions only. They do not replace a real screenshot review. After any CSS/structure change, prior visual evidence is invalid and every changed card needs fresh desktop and 390px evidence.

## Closeout evidence layers

Report these separately:

- build/static gates;
- exact public Pages URLs and identity content;
- per-card desktop/mobile visual evidence;
- clean worktree and generated index state.
