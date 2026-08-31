# Terminal Statusline / Claude Code UI Repo → Darkblue Card Pattern

## When this applies

Use for GitHub repos whose value is a **developer workbench surface** rather than a plain CLI command:

- Claude Code / coding-agent statusline, prompt, shell UI, TUI, or terminal dashboard
- shows live session state: context window, rate limits, cost, model, git, duration, clock
- has visual themes / screenshots / terminal previews
- has an installer or playbook that lets an agent configure the tool for the user

Even if the implementation is a local Bash script, this can fit `infocard-darkblue-style` when the card should communicate a **workbench/status dashboard** feeling. If the repo is only a simple single-command utility with no visual/dashboard surface, prefer hardblue or redswiss instead.

## Proven structure

1. **Hero**
   - Title = product name
   - Subtitle = one-line English positioning
   - Chinese subline = concrete value: what it shows, where it runs, why it is cheap/safe
   - Pills = stars, license, language, themes, refresh interval, requirements

2. **Hero visual**
   - Use README hero/statusline screenshot if available; localize it under `docs/assets/images/<slug>/`
   - Add small stat cards for theme/layout/performance
   - Keep darkblue orb + gradient strip for visual identity

3. **Shell panels**
   - Segment inventory: dir/project/git/model/ctx/limits/cost/clock/etc.
   - Live meters: context, rate limits, cost gauges
   - Performance: local script, no network/API/token, one jq call, one git call

4. **Flow strip**
   - For agent-native installers: Fetch → Interview → Write → Wire → Verify
   - Emphasize that the AI asks user preferences before editing config

5. **Gallery**
   - Embed at least one style comparison and one/two theme screenshots when the repo provides them
   - Use `loading="eager"` for deterministic verification if images are part of core content

6. **Comparison block**
   - Ordinary statusline script vs project-specific workflow
   - Make the differentiator explicit: local zero-token observability + AI-interview installer

## Content angle

For Claude Code statusline repos, avoid describing them as “just a theme.” The stronger framing is:

> A local zero-token observability layer for Claude Code sessions.

Mention only verified claims from README/source, e.g.:

- no network calls
- no API calls
- no token consumption
- session JSON is piped to local script on stdin
- one `jq` invocation and one `git status --porcelain=v2 --branch` call
- supports macOS Bash 3.2 and Linux Bash

## Verification pitfalls

- Localized cards may use `零 token` instead of `zero token`; public grep checks must use the actual page text, not the English report wording.
- README screenshots in below-fold sections should be set to `loading="eager"` if verification asserts natural dimensions.
- `screen-cap`, `section-label`, and small mono labels can silently fall below the 11.2px mobile floor. Use CDP to list visible elements with `fontSize < 11.2` and patch all matching classes.
