# Pitfall 2026-07-28: meta.yaml "single document in the stream, but found more" — YAML multi-doc detection trap

## What happened

After orchestrator-Author fallback (see `pitfall-20260728-subagent-429-fallback.md`), the main thread wrote `meta.yaml` for a new card with valid fields. `npm run build` immediately failed with:

```
Error: Index build failed:
- expected a single document in the stream, but found more
    at buildIndexData (scripts/index-build-lib.js:239:11)
```

Local Python `yaml.load_all` parsed the file as **2 documents** with the second being null. The orchestrator could not identify the trap by reading the file — it looked well-formed: `---` open marker, key-value pairs, `---` close marker, newline.

## Root causes (any of these triggers the trap)

`js-yaml`'s tokenizer scans for `---` at line-start **even inside quoted strings** when the YAML mode is ambiguous. Triggers encountered in this session:

| # | Trigger | Reason | Fix |
|---|---------|--------|-----|
| 1 | **Trailing `---` close marker on a single-doc file** | js-yaml treats it as start of a second (empty) document | Drop the trailing `---` |
| 2 | **Em-dash `—` (U+2014) anywhere in title/desc** | Same trap as #1 because em-dash visually starts with `--` | Replace with `｜` / `·` / `;` / `-` |
| 3 | **`.html` literal in `path:` value with double quotes** | The dot followed by `html` can be misread as a document-end marker | Use single quotes: `path: 'docs/<slug>.html'` |
| 4 | **No trailing newline** | The loader sees the closing `---` glued to EOF and reads a partial second document | Ensure the file ends with `\n` |

## Diagnostic command (run before debugging)

```bash
node -e "
const yaml = require('./assets/home/vendor/js-yaml.min.js');
const fs = require('fs');
const path = require('path');
const ROOT = 'docs';
let errs = [];
function walk(p) {
  for (const e of fs.readdirSync(p, {withFileTypes:true})) {
    const fp = path.join(p, e.name);
    if (e.isDirectory()) walk(fp);
    else if (e.name.endsWith('.meta.yaml')) {
      try {
        const docs = yaml.loadAll(fs.readFileSync(fp, 'utf8'));
        if (docs.length > 1) errs.push(fp);
      } catch(_){}
    }
  }
}
walk(ROOT);
console.log(errs);
"
```

The output is the canonical list of multi-doc meta files. The **newest file (just written)** is almost always the offender.

## Fix checklist (apply in order)

1. Replace em-dashes in title/desc with `｜` (full-width pipe) or `·`.
2. Ensure file ends with `\n` (especially after Python `write()` without newline).
3. Drop the trailing `---` closer — many historical meta files do not have one; new files written by `write_file` / Python heredocs often do.
4. If still failing: change `path: "docs/<slug>.html"` to `path: 'docs/<slug>.html'` (single quotes avoid the `.html`-as-marker trap in some loaders).
5. Last resort: hand-write the file via `write_file` rather than `cat`-heredoc to ensure exact byte content.

## Bake-in template (the single-doc pattern that survived this session)

```yaml
slug: ai-video-55-skills
title: "55 个 AI 视频 Skill 全部开源｜一位博主的生产操作系统"
desc: "..."
date: "2026-07-28 12:30:00"
updated: "2026-07-28 12:30:00"
tags: ["AI 视频", "Agent Skill", "Codex"]
category: "knowledge"
source: "x.com"
source_url: "https://x.com/i/status/..."
author: "Pluvio9yte"
style: "hardblue"
path: "docs/ai-video-55-skills.html"
```

**Key properties**:
- no leading `---`,
- no trailing `---`,
- file ends with a single newline,
- full-width pipe `｜` instead of em-dash in title,
- no `:` inside any string value (the `@Pluvio9yte` and `HyperFrames` in `desc` are safe because they're inside double quotes).

## Prevention

- When writing meta.yaml: prefer `write_file` over `cat << YAML`. The latter often adds or drops trailing `---` and last newline inconsistently.
- Run the diagnostic node script **before** `npm run build` when iterating meta.yaml changes.
- Avoid em-dash `—` in title and desc — they break js-yaml in subtle ways even when quoted.

## Cross-reference

- `infocard-direct-publish` SKILL.md "常见陷阱 §6" — the inline entry pointing here.
- `infocard-publish-sop` §"meta.yaml pitfall" + `references/2026-07-25-meta-yaml-format-guide.md` — covers the older "missing fields / category" failure mode. This file covers the **newer** "single document / multi-doc" trap. Together they form the complete meta.yaml gate checklist.
