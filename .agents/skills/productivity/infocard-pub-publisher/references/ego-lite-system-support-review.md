# ego-lite system support review

Session takeaway for infocard publishing:

- If the card is about a browser/tool with a README and docs, do not stop at feature blocks. Add a dedicated `系统支持与配置` section before/after Quick Start.
- Explicitly spell out:
  - current supported platforms vs roadmap platforms,
  - installation paths,
  - what must be configured (app, skill, space, chrome migration, env vars if any),
  - whether an extra API key is needed,
  - uninstall / rollback boundaries (app removal vs skill removal vs account cleanup).
- For ego-lite specifically, the public docs showed:
  - macOS is the current supported platform,
  - Windows/Linux are roadmap only,
  - `ego-browser` skill is the key runtime bridge,
  - no separate ego-lite API key is usually required; any key requirement comes from the upstream Agent CLI,
  - uninstall should separate app removal from skill removal.
- After adding support/config content, re-run build/verify and a 390px browser screenshot check; this section can easily create long wrapping lines in narrow layouts.

Use this note when publishing future tool/browser cards so supportability and operator readiness are visible in the artifact, not just implied.