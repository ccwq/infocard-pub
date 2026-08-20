# Repo card classification and top-slot timestamp rule

This reference captures two recurring publish decisions from repo-based infocard work.

## 1) Classify the repo before choosing the narrative

Not every GitHub repo card is a "single tool" card.

Use these cues to classify it:
- **Framework / workflow bundle**: the README describes a runtime model, directory layout, skills/tools/channels/schedules, or a durable operational loop.
- **Tool catalog / CLI ecosystem**: the repo aggregates many related tools or commands under one umbrella.
- **Single library / utility**: the repo mainly exposes one API or one focused feature.

For framework/workflow bundles, lead the card with:
1. the operating model
2. the authoring interface
3. the durable workflow loop
4. the operational constraints / safe boundaries
5. then the stats

The `vercel/eve` session is the model example: `instructions.md`, `tools/`, `skills/`, `channels/`, and `schedules/` are the core story, not the star count.

## 2) Home-page top-slot placement depends on publish timestamp

If a user expects a newly published card to appear at the very top of the homepage, check whether later same-day cards already exist.

Rules:
- The homepage sorts by time; source collection time is not enough.
- `date` and `updated` must reflect the real publish time when top-slot placement matters.
- If the card was created earlier in the day and later cards have already landed, you may need to bump `date/updated` to the actual final publish time, then rebuild and repush.
- Always rebuild after changing timestamps, because `_index.yaml` and `index.html` need to be regenerated together.

## Practical verification

Before telling the user why a card is missing from the top of the list:
1. read the card’s meta `date/updated`
2. inspect the first few entries in `_index.yaml`
3. confirm whether later same-day cards outrank it
4. if needed, republish with a newer wall-clock timestamp

This prevents confusing "published successfully" with "ranked where the user expected".