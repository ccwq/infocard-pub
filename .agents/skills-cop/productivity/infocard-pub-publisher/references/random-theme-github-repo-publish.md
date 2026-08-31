# Random-theme GitHub repo publish pattern

Use when the user gives a GitHub repo URL and says `发布信息卡 随机主题` or equivalent.

## Decision rule

- Treat `随机主题` as authorization to choose a fitting registered infocard theme without another clarification round.
- Do **not** make the theme arbitrary if the source has a clear shape. Pick a theme that creates useful contrast while still matching the project:
  - `darkgreen`: terminal/CLI, review harness, status dashboard, observability, local tool, security/quality gate.
  - `darkblue`: agent IDE/workbench/parallel coding dashboard.
  - `redswiss`: open-source catalog/CLI ecosystem with strong public package feel.
  - `handline`: process map / workflow diagram when the card is mostly sequence and concepts.
  - `wood`: editorial agentic engineering argument.
- State the chosen theme in the final report and write it to `.meta.yaml` as `style: <theme>`.

## Source collection when GitHub raw/API is unreliable

- If terminal/API fetches fail but browser/CDP can render GitHub, bounded source collection from the rendered GitHub page is acceptable for publishing.
- Record only visible facts: repo title/description, stars/forks/issues/PRs/tags/commits/releases, README text, topics, language split, visible folders/files.
- Do not summarize a linked homepage unless it was actually fetched/read.
- Write a co-located `docs/<slug>.report.md` noting the collection method and any source limitations.

## Card construction

- Use a self-contained SVG/CSS diagram when source images cannot be localized. This avoids broken remote images and keeps post-publish image verification trivial (`document.images.length === 0` is acceptable when intentional).
- For `darkgreen`, present the repo as a live monitor/workbench: status topbar, metrics, terminal command block, pipeline diagram, and warning/ops note.
- Keep mobile-first constraints: no fixed save button, minimum visible font size >= 11.2px, no horizontal overflow at 390px.

## Verification gates

Before reporting published:
1. `npm run build && npm run verify`
2. Commit HTML + meta + report + `_index.yaml` + `index.html` together.
3. Push, retrying with `GIT_HTTP_VERSION=HTTP/1.1` for transient TLS failures.
4. Public detail page HTTP 200 and contains title + one core keyword.
5. Public `_index.yaml` contains the slug and exact `style` chosen.
6. Homepage contains slug/title.
7. CDP mobile check at 390px: no overflow, min font >= 11.2px, `.save` is `position: static`.
8. High-value repo cards must sync to LLM Wiki: raw + concept page + index/log + wiki git commit/push.

## Reporting

Final response should include:
- public URL
- selected theme
- infocard commit
- wiki commit
- public/index/mobile/wiki verification summary
