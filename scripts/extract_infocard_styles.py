#!/usr/bin/env python3
"""Extract style signals from published infocard HTML files.

Usage:
  python scripts/extract_infocard_styles.py

Outputs:
  tmp_infocard_style_audit.json
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = ROOT / "tmp_infocard_style_audit.json"

COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:black|white|red|transparent)\b", re.I)
SELECTOR_RE = re.compile(r"([^{}]+)\{([^{}]+)\}", re.S)
CLASS_RE = re.compile(r"class=[\"']([^\"']+)[\"']")

def norm_ws(value: str) -> str:
    return " ".join(value.strip().split())

def main() -> None:
    htmls = sorted(DOCS.glob("**/*.html"))
    colors: Counter[str] = Counter()
    classes: Counter[str] = Counter()
    selectors: Counter[str] = Counter()
    props: Counter[str] = Counter()
    font_sizes: Counter[str] = Counter()
    paddings: Counter[str] = Counter()
    gaps: Counter[str] = Counter()
    widths: Counter[str] = Counter()
    files = []

    for path in htmls:
        text = path.read_text(encoding="utf-8", errors="ignore")
        style = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", text, flags=re.S | re.I))
        for color in COLOR_RE.findall(style):
            colors[color.lower()] += 1
        for class_attr in CLASS_RE.findall(text):
            for cls in class_attr.split():
                classes[cls] += 1
        for match in SELECTOR_RE.finditer(style):
            selector = norm_ws(match.group(1))
            body = match.group(2)
            selectors[selector] += 1
            for prop in re.findall(r"([\w-]+)\s*:", body):
                props[prop] += 1
        font_sizes.update(re.findall(r"font-size\s*:\s*([^;]+);", style))
        paddings.update(re.findall(r"padding\s*:\s*([^;]+);", style))
        gaps.update(re.findall(r"gap\s*:\s*([^;]+);", style))
        widths.update(re.findall(r"width\s*:\s*([^;]+);", style))
        files.append({
            "path": str(path.relative_to(ROOT)),
            "style_len": len(style),
            "class_count": len(set(sum((c.split() for c in CLASS_RE.findall(text)), []))),
        })

    audit = {
        "html_count": len(htmls),
        "top_colors": colors.most_common(80),
        "top_classes": [(k, v) for k, v in classes.most_common(160) if v >= 2],
        "top_selectors": [(k, v) for k, v in selectors.most_common(160) if v >= 2],
        "top_props": props.most_common(80),
        "top_font_sizes": font_sizes.most_common(80),
        "top_paddings": paddings.most_common(80),
        "top_gaps": gaps.most_common(60),
        "top_widths": widths.most_common(60),
        "files": files,
    }
    OUT.write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} from {len(htmls)} HTML files")
    print("Top colors:", audit["top_colors"][:12])
    print("Top classes:", audit["top_classes"][:20])

if __name__ == "__main__":
    main()
