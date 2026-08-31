# Investigation sample granularity for infocard-pub

Use this when converting public complaints / OSINT into an infocard sample list.

## What to preserve
- Brand + model must stay visible in each sample heading or lead.
- Each sample should read like a tiny news item: who / when / where / what.
- Prefer source text over abstraction. If the source names a road, highway, state, city, or route, use it.
- If the source only gives a scene (e.g. raining, highway, moving), keep the scene and do not invent geography.
- If no city is stated, say so explicitly rather than guessing.

## Where-detail ladder
1. Exact route / highway / mile marker / city / state from source text
2. Named area or road segment from source text
3. Generic scene from source text (highway, rain, moving traffic)
4. Explicit placeholder: "公开投诉未给出具体城市"

## Editing rule
When a user says the sample list is too summary-like or not professional enough:
- revise report and HTML together;
- re-run build/verify if the page was part of a publish bundle;
- keep the case cards and the report in the same factual framing.
