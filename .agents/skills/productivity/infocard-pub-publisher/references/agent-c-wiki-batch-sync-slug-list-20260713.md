# Agent C Wiki Batch Sync — Slug-List Pattern (2026-07-13)

## Context

When the LLM Wiki ingestion pipeline splits work across agents by slug list
(e.g. `/tmp/agent_c_slugs.txt`), each agent processes its slice independently.
This reference documents the exact procedure, naming conventions, and Python
script used by Agent C for a 50-slug batch.

## Naming Convention

- **Slug list file**: `/tmp/agent_c_slugs.txt` — one slug per line, e.g.
  `20260713-academic-research-skills`
- **Source HTML**: `docs/<slug>.html` in the infocard-pub repo
- **Meta sidecar**: `docs/<slug>.html.meta.yaml` (optional)
- **Target raw article**: `~/hehome/hermes-data/home/wiki/raw/articles/<YYYY-MM-DD>-infocard-<slug>.md`
  - Date from first 8 chars of slug: `YYYYMMDD → YYYY-MM-DD`
  - Filename embeds the full slug (including date prefix) as last component
  - Example: `20260707-agentsview` → `2026-07-07-infocard-20260707-agentsview.md`

## Processing Logic (per slug)

```
1. Check if target file already exists → skip if so
2. Try to read <slug>.html.meta.yaml
   a. If exists: extract title, desc, date, tags, category, source_url, style
   b. If absent: read <title> from HTML, read meta[name=description]
      (fallback: class="hero-sub" paragraph)
3. Synthesize frontmatter + summary content
4. Write to target path
```

## Python Script Used

```python
#!/usr/bin/env python3
"""Batch sync infocard HTML files to LLM Wiki raw articles (Agent C)."""

import os, re, subprocess, yaml
from pathlib import Path

REPO_ROOT = Path(subprocess.check_output(
    ["git", "rev-parse", "--show-toplevel"], text=True
).strip()).resolve()
DOCS_DIR = REPO_ROOT / "docs"
WIKI_RAW  = Path(os.path.expanduser("~")) / "hehome/hermes-data/home/wiki/raw/articles"
SLUGS_FILE = Path("/tmp/agent_c_slugs.txt")

def slug_to_date(slug):
    y, m, d = slug[:4], slug[4:6], slug[6:8]
    return f"{y}-{m}-{d}"

def target_path(slug):
    return WIKI_RAW / f"{slug_to_date(slug)}-infocard-{slug}.md"

def read_meta(slug):
    meta_path = DOCS_DIR / f"{slug}.html.meta.yaml"
    if not meta_path.exists():
        return None
    try:
        with open(meta_path, encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception:
        return None

def extract_from_html(slug):
    html_path = DOCS_DIR / f"{slug}.html"
    title, desc = slug, ""
    if html_path.exists():
        content = html_path.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"<title>([^<]+)</title>", content, re.IGNORECASE)
        if m: title = m.group(1).strip()
        m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content, re.IGNORECASE)
        if m: desc = m.group(1).strip()
        if not desc:
            m = re.search(r'class="hero-sub"[^>]*>([^<]+)</p>', content, re.IGNORECASE)
            if m: desc = m.group(1).strip()
    return {"title": title, "desc": desc}

def build_frontmatter(meta, slug):
    date = slug_to_date(slug)
    if meta:
        return {
            "title": meta.get("title", slug),
            "created": date, "updated": date, "type": "raw",
            "tags": meta.get("tags", []),
            "sources": [meta["source_url"]] if meta.get("source_url") else [],
            "confidence": "high", "contested": False,
            "infocard_url": f"https://ccwq.github.io/infocard-pub/docs/{slug}.html",
            "slug": slug, "style": meta.get("style", ""),
        }
    return {
        "title": slug, "created": date, "updated": date, "type": "raw",
        "tags": [], "sources": [], "confidence": "medium", "contested": False,
        "infocard_url": f"https://ccwq.github.io/infocard-pub/docs/{slug}.html",
        "slug": slug,
    }

def write_article(slug):
    target = target_path(slug)
    if target.exists():
        return "skipped", slug
    meta = read_meta(slug)
    if meta is None:
        extracted = extract_from_html(slug)
        meta = {"title": extracted["title"], "desc": extracted["desc"]}
    fm = build_frontmatter(meta, slug)
    # ... build + write content
```

## Key Findings from Agent C Run (2026-07-13)

- 50 slugs in list
- 45 written (all missing from wiki)
- 5 skipped (already existed in wiki)
- 0 errors
- All 45 had `.meta.yaml` files — HTML fallback was only needed for 1
  (`20260713-academic-research-skills`, which had no meta.yaml and no
  meta description, only `<title>` tag)
- `Path.home` is a method in this environment, not a property — use
  `Path(os.path.expanduser("~"))` instead

## Raw Article Frontmatter Template

```yaml
---
title: <title from meta or HTML>
created: <YYYY-MM-DD from slug prefix>
updated: <YYYY-MM-DD from slug prefix>
type: raw
tags:
  - <tag1>
  - <tag2>
sources:
  - <source_url from meta>
confidence: high   # use 'medium' if no meta.yaml
contested: false
infocard_url: https://ccwq.github.io/infocard-pub/docs/<slug>.html
slug: <slug>
style: <style from meta or blank>
---
```

## Trigger Conditions

Use this reference when:
- A slug list file (`/tmp/agent_*.txt`) is provided for wiki batch sync
- Processing a slice of HTML infocards for LLM Wiki raw article ingestion
- The naming convention `<YYYY-MM-DD>-infocard-<slug>.md` needs to be confirmed
