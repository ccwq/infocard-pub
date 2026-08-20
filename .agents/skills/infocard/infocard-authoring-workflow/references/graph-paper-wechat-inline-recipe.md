# Graph-paper manual → WeChat inline migration

## Session result

Source: `/tmp/wx-publish-open-preview-clean/graph-paper-manual.html`
Output: `/tmp/redswiss-stage/graph-paper-manual.wechat.html`

The source used preview-only CSS/classes and tags such as `main`, `p`, `h1`, `h2`, `em`, and `br`. The migrated body was rewritten as a single inline-styled natural-flow root using `section`, `span`, `strong`, `h3`, `h4`, `ul`, and `li`.

## Strict scan

The independent scan must check:

```python
allowed = {'section', 'span', 'strong', 'h3', 'h4', 'ul', 'li'}
tags = sorted(set(re.findall(r'<\\/?([A-Za-z][A-Za-z0-9]*)\\b', html)))
assert set(tags) <= allowed
```

It should also check:

- output exists and has non-zero size;
- root contains `width:100%;max-width:677px`;
- forbidden strings are absent;
- `margin:-` and `margin: -` are absent.

## Observed correction

The first independent scan failed because decorative empty leaves were implemented as `<br>` inside `<span leaf>`. The repository validator still passed, but the user's strict allowlist rejected `br`. Replacing those with whitespace leaves (`<span leaf=""> </span>`) made the independent scan pass while preserving the decorative spacing/bullet behavior.

Final verified state in that session:

- repository validator: complete compliance, 64 leaf spans;
- independent scan: `INDEPENDENT_SCAN=PASS`;
- final size: 15,261 bytes;
- no push or external platform operation.
