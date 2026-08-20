# Content-routed retheme + multi-image merge note

Session lessons (2026-06-26/27):

## 1) Multiple source images -> one card
When a user provides multiple images from the same source/thread and asks for one infocard, merge them into a single card instead of splitting into several cards. The merged card must preserve:
- every item name
- every item description
- classification / source tag
- dimension / category label

A names-only consolidation is not acceptable; the merge must remain reader-facing and complete.

## 2) Theme selection must follow content
If the user says the existing card theme is wrong for the content, rebuild the same slug/path in place using the theme that fits the material, rather than keeping the old visual language.

Observed mapping in this session:
- dots.tts -> redswiss (open-source tool / benchmark / TTS)
- GStack -> wood (methodology / workflow / editorial manual)

## 3) Verify the retheme, not just the publish
After retheme + build + push, verify the live page visually or by DOM/screenshot review to confirm the new theme actually reads as the intended class-level style.
