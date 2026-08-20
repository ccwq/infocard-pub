# Homepage keyword strip hardening — 2026-06-25

## Trigger
User says the homepage filter/tag area is still too loose, not mini enough, or explicitly asks for `design-taste-frontend` while discussing homepage filter density.

## What changed this session
The first tightening pass still kept two things the user rejected:
1. an explanatory block shape (`标签 + taxonomy 紧凑筛选` + note)
2. a visible `全部关键词` chip on the homepage keyword row

The accepted direction was stricter:
- keep the archive shell
- keep taxonomy structure
- compress the filter header into a terse control strip
- remove explanatory prose
- remove the visible `全部关键词` chip from the homepage
- keep keyword chips mini and dense

## Accepted shape
### Header
Use a compact control-strip header only:
- kicker: `taxonomy / keywords`
- short title: `紧凑筛选`
- no note/explainer paragraph

### Keyword row
- no visible `全部关键词` chip on the homepage
- row starts directly with mini keyword chips
- each chip may keep a tiny count badge
- overflow collapses to inline `+N`

### Taxonomy rows
- still one row per dimension
- still high-frequency-first
- still row-level expand only

## Negative lesson
`design-taste-frontend` here was not a request to swap theme systems. It meant:
- cut explanatory filler
- compress hierarchy
- make the filter band feel like a dense control strip

## Release lesson
For homepage-only JS/CSS changes, the release unit still includes:
- `assets/home/index.js`
- `assets/home/index.css`
- `index.html` version/query-string anchor
- `docs/version.json`

Without the asset-version anchor bump, Pages can look unchanged even after a successful push.
