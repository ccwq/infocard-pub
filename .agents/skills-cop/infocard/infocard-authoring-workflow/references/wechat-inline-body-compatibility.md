# WeChat inline-body compatibility

Verified pattern for producing a Handline-style正文 that can be pasted into the WeChat Official Account editor.

## Required shape

- Root wrapper: `width:100%`, with a safe `max-width:677px`; use inline styles only.
- Prefer `section`, `span`, `strong`, headings, lists, and inline text primitives.
- Wrap visible text in `<span leaf="">…</span>`, including text nested inside headings, strong labels, list items, and CTA/button-like spans.
- Keep the design readable after editor sanitization: no external CSS/JS, CSS variables, grid, media queries, gradients, transforms, or absolute/fixed/sticky positioning.

## Design translation

Preserve the Handline identity with inline-safe equivalents:

- warm paper background (`#f1ece2` / `#fbf7ef`)
- dark structural borders (`#2c2723` or darker)
- restrained orange annotation (`#c9762f`)
- compact process steps with arrows
- three paper-note blocks
- one annotation block and one quote band
- right-aligned save/CTA control

## Verification

Run:

```bash
python3 /tmp/wx-publish-migration-clean/.agents/skills/gzh-design/scripts/validate_gzh_html.py /path/to/file.html
```

A passing result is:

```text
✅ 完全合规，可直接粘贴到公众号编辑器
```

Warnings about unwrapped Chinese text should be fixed rather than ignored. Also run a lightweight scan for forbidden constructs and pale structural border tokens (`#d0c8be`, `#c0b8a8`, `#c9c0b3`).

## Reproduction outcome

The verified sample was `/tmp/redswiss-stage/handline-editorial.wechat.html`; the validator reported 52 leaf spans and complete compliance.
