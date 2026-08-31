# Homepage filter ↔ taxonomy fit audit (2026-06-26)

Use this note when the user asks whether the infocard homepage filters actually match the card metadata model, or whether newly published cards can reliably enter the filter system.

## What the homepage currently filters on

`assets/home/index.js` defines 8 facet dimensions:

### Primary dimensions
- `domains` → 平台 / 领域
- `tool_types` → 工具类型
- `stages` → 使用阶段
- `interaction` → 交互形态
- `content_type` → 内容类型

### Advanced dimensions
- `source` → 来源
- `style` → 风格
- `risk` → 风险

## Important rendering fact

The homepage filter items are **bordered chip / pill UI**, not plain text labels.

Evidence from `assets/home/index.css`:
- `.facet-compact-items button { border: 1px solid var(--color-line-strong); ... }`
- `.current-filter .pill { border: 1px solid var(--color-line-strong); ... }`
- active chips invert to dark background / white text

This matters because user questions about the filter often refer to the bordered item language, not just the data model.

## Real fit status observed in this session

Repository-wide meta scan at the time of audit:
- total meta files: **372**
- with `taxonomy`: **366**
- with `tags`: **372**
- with top-level `style`: **85**

Facet coverage counts among meta files:
- `risk`: **366**
- `content_type`: **348**
- `domains`: **329**
- `tool_types`: **308**
- `stages`: **229**
- `interaction`: **224**
- `source`: **156**
- `style`: **80**

## Operational conclusion

The system is **directionally matched but not fully enforced**:
- homepage filter schema and card taxonomy schema are broadly aligned
- most cards already participate in taxonomy filtering
- but some cards still miss taxonomy entirely, and several dimensions are materially under-filled

This means the current state is:
- usable for filtering
- not yet strong enough to guarantee every new/updated card will fit every intended filter dimension

## Critical implementation nuance

### `style` has a fallback
Homepage JS falls back from `taxonomy.style` to top-level `card.style`:
- cards with top-level `style` can still enter the style filter even if `taxonomy.style` is missing

### `source` does **not** currently have a fallback
Homepage JS only reads `taxonomy.source`.
It does **not** fall back to:
- top-level `source`
- `source_url`

So a card can visibly have a source and still fail to appear under the homepage `来源` facet unless `taxonomy.source` is explicitly populated.

The same caution applies to any dimension that has no fallback and relies purely on `taxonomy.*`.

## Recommended authoring gate for new / refreshed cards

For infocard publish/update work, prefer treating these as the minimum populated facet contract:
- `domains`
- `tool_types`
- `content_type`
- `risk`
- `source`

And require these to exist even if empty:
- `stages`
- `interaction`

Why:
- `domains / tool_types / content_type` carry the main browse value
- `risk / source` are user-facing advanced filters and should not be silently dropped
- explicit empty arrays are better than omitted keys when auditing coverage

## Interpretation guideline

If the user asks whether the skill system and homepage facets “match”, answer in two layers:
1. **Schema match**: yes, mostly
2. **Enforcement match**: not fully — current skills/publish flow do not yet make complete taxonomy population a hard release gate

That distinction is the useful answer; do not collapse it into a simplistic yes/no.
