# Swiss red-black rebuild from scratch

Use this when the user explicitly asks for a rebuild/re-generation in Swiss red-black style (or says the current result is still a generic version that was only restyled).

## Core rule

Do **not**:
- build a neutral/generic card first
- then swap colors or add a Swiss-red theme on top
- leave old template structure in place and call it a rebuild

Do:
- rewrite the HTML structure and CSS together
- make the requested theme visible in the first fold
- keep the content aligned to the requested source, but do not preserve an incompatible layout skeleton

## Practical checklist

1. Inspect the source and decide the card structure around the requested theme.
2. Generate the page directly in Swiss red-black composition:
   - black / white / red dominant palette
   - strong borders, sharp section rhythm, information-dense modules
   - avoid rounded, playful, or multi-color leftovers from other themes
3. If the user explicitly says a specific URL/section is wrong, repair that exact location first.
4. Rebuild the sidecar metadata if title/desc/date/updated changed.
5. Rebuild `_index.yaml` and verify it.
6. Verify the public Pages URL, then inspect a 390px screenshot.
7. If the page is readable but still feels like a desktop shrink, increase mobile typography and tighten the grid before changing the content.

## Session note: 2026-06-04

A real user correction clarified the meaning of “重建”:
- The user rejected a card that had been created normally and then visually restyled.
- The required behavior was to **rebuild the page structure and CSS from scratch** in the target Swiss red-black style.
- The fix was not “more theme tokens”; it was to replace the skeleton so the page no longer felt like a generic card with a color swap.

Practical takeaway:
- If a user says “我要求重建” or “不要先创建之后再改风格”, stop treating the task as a restyle.
- Compare the current skeleton to the requested theme; if they are structurally mismatched, regenerate the HTML/CSS instead of layering more theme variables onto the old layout.

## Pitfalls seen in practice

- A “successful” restyle can still be rejected if the underlying structure is generic.
- If the user says “不要先创建之后再改风格”, interpret that as a source-generation constraint, not a visual polish request.
- Do not treat a good desktop screenshot as sufficient; mobile verification is part of the publish contract.
- If `git pull --rebase` creates `_index.yaml` conflicts, rebuild the index from sidecars instead of hand-editing conflict markers.
