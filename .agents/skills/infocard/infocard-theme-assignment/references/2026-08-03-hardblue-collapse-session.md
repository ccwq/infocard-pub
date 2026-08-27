# 2026-08-03 hardblue collapse session（历史参考）

> 本文件仅用于解释旧决策背景，不是当前发布指令。新卡必须使用候选池、能力过滤和 `theme-decision.json`。

## User question

Recent 24h cards all used one theme. User asked:

1. what is the assignment standard
2. how many themes exist
3. how are they assigned

## Facts checked

- `_themes.yaml` registered themes: 20
- `theme/*.html` files: 21 (extra: `codex-notebook`)
- last 24h publishes: AirLLM, Graph Engineering, AutoResearch, BrowserAct, SpecJudge (+ mobile fix) — all hardblue
- historical meta with style: hardblue leading, but darkblue/redswiss/main/graph-paper and many others exist

## Root cause

Execution collapse, not missing inventory.

Existing docs already had multi-theme guidance:

- `infocard-authoring-workflow` light-route shortlist (darkblue / hardblue / redswiss / white-purple)
- `infocard-publish-sop` theme application gate (2026-07-25 single-tool hardblue correction)
- `infocard-style-man-skill` content-type mapping + theme application contract
- `style-governance.md` multi-scene table

But runtime practice reduced to:

> technical ≈ hardblue

## Counterexamples that prove over-collapse

- Graph Engineering: architecture/paradigm migration → should prefer darkblue
- AutoResearch: agent loop method/architecture tilt → darkblue or hardblue, not hard-only
- SpecJudge: model recommender can be hardblue or darkblue workbench

## What to do next time

1. Load `infocard-theme-assignment`
2. 历史流程曾填写 content_shape / theme_primary / theme_fallback / theme_reject；当前流程改为填写 `theme-decision.json`。
3. Load the chosen style skill + theme demo
4. Apply batch diversity gate when >=3 cards

## Protected skill note

This session could not patch:

- `infocard-publish-sop` (created_by=None, user-owned)
- `infocard-style-man-skill` (created_by=None, user-owned)

Recommended:

```text
hermes curator adopt infocard-publish-sop
hermes curator adopt infocard-style-man-skill
```

Then merge this decision tree into those umbrellas so assignment lives next to publish/style governance.
