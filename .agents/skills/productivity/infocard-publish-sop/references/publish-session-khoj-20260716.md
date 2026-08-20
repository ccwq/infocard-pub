# Publish session note: Khoj card (2026-07-16)

## Reusable findings

- The repository validator was stricter/different from the prose contract in places: it required `docs/YYYYMMDD-<slug>.html`, an allowed style such as `q-style`, top-level `source_url`, and Wiki `raw_path` + `knowledge_path`.
- A concise facts package was required for the content gate: `.tmp/infocard/<slug>/facts.json` with non-empty `claims`, `required_sections`, `repo_meta`, and `assets`.
- Semantic gates inspect exact hero identity and heading evidence. Use `id="hero"` or a `hero` class and headings whose normalized text exactly contains the required section labels.
- For no-image cards, create `assets/img/<slug>/manifest.json` with `assets: []` and a non-empty reason.
- A static local-assets gate rejected a top-level CDN `html2canvas` script. Keep optional export dependencies dynamically loaded on button click when the gate treats external scripts as forbidden static references.
- Build scans the whole repository. Isolate unrelated untracked cards/assets before a scoped build, restore them afterward, and stage only the candidate allowlist plus generated `_index.yaml` and `index.html`.
- GitHub Stars can change within minutes. Refresh the API immediately before finalizing HTML, facts, Wiki, and metadata; update every copy to the same snapshot.

## Evidence boundary

- Static gates, build, push, public HTTP 200, and keyword checks do not substitute for visual evidence.
- If the visual capture tool is unavailable or times out, record `SKIPPED` and keep the final status `PARTIAL` unless the user explicitly authorizes a partial publication. Never report visual PASS from static evidence alone.
- Wiki closure must be checked independently: raw article, entity/knowledge page, index entry, and log entry should all point to the same card URL and current factual snapshot.

## Minimal verification sequence

1. Inspect actual repository validator and package scripts.
2. Build a complete bundle/facts/manifest before writing or changing card output.
3. Run all four local gates after each correction.
4. Run the visual gate before push; stop on `SKIPPED` unless disposition is explicitly changed.
5. If publishing a partial result, push only the exact candidate allowlist and record missing evidence.
6. After push, verify public HTML, `_index.yaml`, and `index.html` with cache-busting HTTP requests and keyword checks.
7. Update Wiki and verify raw/entity/index/log independently.
