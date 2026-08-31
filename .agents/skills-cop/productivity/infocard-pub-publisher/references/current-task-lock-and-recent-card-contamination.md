# Current-task lock and recent-card contamination

## Incident class

P0 workflow error in `infocard-pub`: while editing card A, the agent accidentally switched to card B from a previous day because both lived in the same repo and recent git history contained both.

## Canonical example

- Active task: X card `2065806647742570880`
- Active slug/path: `20260614-x-ai-agent-treasure` / `docs/20260614-x-ai-agent-treasure.html`
- Wrong branch dragged in: yesterday's Niyazov card

The failure was not content misunderstanding of the current card itself. The failure was **task-boundary collapse** between:
1. current user request
2. recently edited repo artifact
3. prior-day card in the same repository

## Trigger signals

High risk when all are true:
- same repo contains multiple fresh cards
- the user refers to "this card" / "these two images"
- the agent recently edited another nearby card
- the agent begins reasoning from memory instead of re-reading the exact active file

## Prevention checklist

Before changing a published card:
1. Restate the active source URL.
2. Restate the active slug.
3. Restate the exact HTML path and sidecar path.
4. Confirm current assets directory.
5. Only then patch files.

## Recovery checklist

If the user says the card/topic is wrong:
1. Stop immediately.
2. State the wrong branch plainly.
3. Name the correct current artifact (URL + slug + file path).
4. Re-open only the current artifact.
5. Continue from that artifact only.

## Image-reference rule

When the user says "include these two images" during an edit of an already-created card:
- default the reference to images in the **current task turn**
- do not map the phrase to images from a prior card or prior session
- if ambiguity remains, ask whether to replace the current two images with the newly supplied two images

## Evidence pattern

Useful verification after recovery:
- grep the active slug in `_index.yaml`
- read the exact current HTML file
- inspect current image `src` values in DOM after publish
- verify mobile 390px rendering for the active card only
