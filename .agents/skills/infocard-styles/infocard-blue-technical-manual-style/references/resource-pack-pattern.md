# Resource-pack card pattern (blue technical manual style)

Source session distilled from the Bernini card build.

## When to use
Use this pattern for open-source tool / package / framework cards where the repo is not a single app, but a bundle of reproducible assets:
- code entrypoints
- weights / checkpoints
- case files / examples
- demo UI
- benchmark / arena / evaluation artifacts

## Information architecture
1. **One-line conclusion**
   - Start with what the repo gives the reader, not with abstract praise.
   - Example shape: "This is a reusable resource pack for X: code + weights + cases + demo + evaluation."

2. **What the package contains**
   - List main entrypoints and folders.
   - Explicitly name the user-facing surfaces (CLI, demo, examples, configs, weights).

3. **How it works**
   - Show the pipeline in 3-4 steps.
   - Keep the chain readable on mobile.

4. **Capability matrix**
   - Use a compact table or stacked cards for: capability / evidence / interpretation.

5. **Minimal getting started path**
   - Give a short clone-install-run sequence.
   - Prefer one primary path and one optional accelerated path.

6. **Resources / constraints / limits**
   - Include hardware or dependency requirements.
   - Include clear limitations and non-goals.

7. **Who it fits / who it doesn't**
   - Keep this blunt and specific.

## Mobile adaptation rules
- A 390px screenshot can still look like a desktop縮小稿 if too many decorative elements remain.
- On mobile, remove optional hero art first.
- Hide or compress badge rows and long source lines when they don't add essential meaning.
- Keep the first fold focused on the title, one-sentence conclusion, and the key resource cards.
- Floating actions should live in the corner and never cover正文.

## Common pitfalls
- Treating a toolkit as if it were a single model card.
- Writing a vague summary that does not name concrete entrypoints or asset types.
- Leaving too much hero chrome on mobile, which makes the card feel compressed rather than designed.
- Hiding the real value of the repo behind setup instructions.

## Verification checklist
- Does the card name the repo's concrete assets?
- Does the first fold answer "what do I get?"
- Are the mobile hero elements minimal enough?
- Do the main entrypoints and resource folders appear explicitly?
- Is the save/export button visible but non-obstructive?
