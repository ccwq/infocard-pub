#!/usr/bin/env python3
"""Mobile regression check for infocard HTML pages.

This script catches the class of problems that caused the SkillOpt mobile issue:
- save button stays fixed on mobile and overlaps content
- mobile workaround introduces a huge right padding strip
- viewport meta is missing or broken
- the actual rendered page overflows the mobile viewport

Usage examples:
  python scripts/verify_mobile_infocard.py docs/20260602-skillopt-cookbook.html
  python scripts/verify_mobile_infocard.py https://ccwq.github.io/infocard-pub/docs/20260602-skillopt-cookbook.html
"""
from __future__ import annotations

import argparse
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

MOBILE_MAX_WIDTH = 720
MOBILE_VIEWPORT_WIDTH = 390
MOBILE_VIEWPORT_HEIGHT = 844
MAX_MOBILE_RIGHT_PADDING_REM = 2.0

VIEWPORT_RE = re.compile(r'<meta\s+name=["\']viewport["\']\s+content=["\']([^"\']+)["\']', re.I)
STYLE_BLOCK_RE = re.compile(r'<style[^>]*>(.*?)</style>', re.I | re.S)
RULE_RE = re.compile(r'([^{}]+)\{([^{}]+)\}', re.S)
SAVE_BTN_RULE_RE = re.compile(r'\.save-btn\s*\{([^{}]*)\}', re.S)
MOBILE_MEDIA_RE = re.compile(
    r'@media\s*\(\s*max-width\s*:\s*' + str(MOBILE_MAX_WIDTH) + r'px\s*\)\s*\{(.*)\n\s*\}',
    re.S,
)
CSS_PROP_RE = re.compile(r'([\w-]+)\s*:\s*([^;]+);')


def read_text(source: str) -> str:
    if source.startswith(("http://", "https://")):
        with urllib.request.urlopen(source, timeout=30) as resp:
            return resp.read().decode("utf-8", "replace")
    return Path(source).read_text(encoding="utf-8", errors="replace")


def is_url(source: str) -> bool:
    return bool(urlparse(source).scheme in {"http", "https"})


def extract_mobile_block(html: str) -> str:
    for style in STYLE_BLOCK_RE.findall(html):
        match = MOBILE_MEDIA_RE.search(style)
        if match:
            return match.group(1)
    return ""


def parse_css_props(rule_body: str) -> dict[str, str]:
    props: dict[str, str] = {}
    for key, value in CSS_PROP_RE.findall(rule_body):
        props[key.strip().lower()] = value.strip()
    return props


def parse_rem_or_px(value: str) -> float | None:
    raw = value.strip().lower()
    if raw.endswith("rem"):
        try:
            return float(raw[:-3])
        except ValueError:
            return None
    if raw.endswith("px"):
        try:
            return float(raw[:-2]) / 16.0
        except ValueError:
            return None
    return None


def fail(errors: list[str]) -> None:
    print("Mobile regression check failed:")
    for err in errors:
        print(f"- {err}")
    raise SystemExit(1)


def static_checks(html: str, source: str) -> list[str]:
    errors: list[str] = []

    viewport = VIEWPORT_RE.search(html)
    if not viewport:
        errors.append(f"{source}: missing <meta name=\"viewport\">")
    else:
        content = viewport.group(1).lower()
        if "width=device-width" not in content:
            errors.append(f"{source}: viewport missing width=device-width -> {content!r}")

    mobile_block = extract_mobile_block(html)
    if not mobile_block:
        errors.append(f"{source}: missing @media (max-width:{MOBILE_MAX_WIDTH}px) block")
        return errors

    save_rule = SAVE_BTN_RULE_RE.search(mobile_block)
    if save_rule:
        props = parse_css_props(save_rule.group(1))
        if props.get("position", "").lower() == "fixed":
            errors.append(f"{source}: mobile .save-btn must not be position:fixed")
        if "bottom" in props or "right" in props:
            errors.append(f"{source}: mobile .save-btn should not use fixed-style bottom/right offsets")
        if props.get("display", "").lower() == "inline-block" and props.get("width", "").strip() == "":
            errors.append(f"{source}: mobile .save-btn should be a full-width/block button or otherwise clearly non-floating")

    for selector, body in RULE_RE.findall(mobile_block):
        sel = selector.replace("\n", " ").strip()
        props = parse_css_props(body)
        if not props:
            continue
        if any(token in sel for token in (".hero", ".section", ".closing")) and "padding-right" in props:
            rem = parse_rem_or_px(props["padding-right"])
            if rem is not None and rem > MAX_MOBILE_RIGHT_PADDING_REM:
                errors.append(
                    f"{source}: suspicious mobile right padding on {sel} -> padding-right:{props['padding-right']}"
                )

    return errors


def browser_checks(target: str) -> list[str]:
    errors: list[str] = []
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-gpu")
    opts.add_argument(f"--window-size={MOBILE_VIEWPORT_WIDTH},{MOBILE_VIEWPORT_HEIGHT}")
    opts.add_argument("--force-device-scale-factor=1")
    driver = webdriver.Chrome(options=opts)
    try:
        driver.execute_cdp_cmd(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": MOBILE_VIEWPORT_WIDTH,
                "height": MOBILE_VIEWPORT_HEIGHT,
                "deviceScaleFactor": 2,
                "mobile": True,
            },
        )
        driver.get(target)
        time.sleep(1.5)
        result = driver.execute_script(
            r'''
const de=document.documentElement, body=document.body;
const btn=document.querySelector('.save-btn');
const page=document.querySelector('.page') || document.body;
if (!btn) return {missingBtn:true};
function rectObj(r){return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};}
const br=btn.getBoundingClientRect();
let overlaps=[];
for (const el of [...document.querySelectorAll('.hero,.warn,.section,.closing,p,.box,.mini,.node,.storage-item,.table,.code,.source')]) {
  const s=getComputedStyle(el);
  if (s.position === 'fixed') continue;
  const r=el.getBoundingClientRect();
  const overlap=!(r.right<br.x || r.left>br.right || r.bottom<br.y || r.top>br.bottom);
  if (overlap && el !== btn) overlaps.push(el.tagName + '.' + (el.className || '').toString());
}
return {
  innerWidth: window.innerWidth,
  clientWidth: de.clientWidth,
  scrollWidth: Math.max(body.scrollWidth, de.scrollWidth),
  btnPosition: getComputedStyle(btn).position,
  btnDisplay: getComputedStyle(btn).display,
  pagePaddingBottom: getComputedStyle(page).paddingBottom,
  pageRightPadding: getComputedStyle(document.querySelector('.hero') || page).paddingRight,
  btnRect: rectObj(br),
  overlaps,
  compatMode: document.compatMode,
};
'''
        )
        if result.get("missingBtn"):
            errors.append(f"{target}: .save-btn not found in rendered page")
            return errors
        if result.get("compatMode") != "CSS1Compat":
            errors.append(f"{target}: document.compatMode is {result.get('compatMode')!r}")
        if result.get("innerWidth") != MOBILE_VIEWPORT_WIDTH:
            errors.append(f"{target}: innerWidth={result.get('innerWidth')} expected {MOBILE_VIEWPORT_WIDTH}")
        if result.get("clientWidth") != MOBILE_VIEWPORT_WIDTH:
            errors.append(f"{target}: clientWidth={result.get('clientWidth')} expected {MOBILE_VIEWPORT_WIDTH}")
        if result.get("scrollWidth") != MOBILE_VIEWPORT_WIDTH:
            errors.append(f"{target}: scrollWidth={result.get('scrollWidth')} expected {MOBILE_VIEWPORT_WIDTH}")
        if result.get("btnPosition") == "fixed":
            errors.append(f"{target}: rendered .save-btn is still fixed on mobile")
        if result.get("overlaps"):
            errors.append(f"{target}: save button overlaps content -> {result['overlaps'][:5]}")
    finally:
        driver.quit()
    return errors


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify infocard mobile layout regressions")
    parser.add_argument(
        "target",
        nargs="?",
        default="docs/20260602-skillopt-cookbook.html",
        help="Path or URL to the card HTML to verify",
    )
    parser.add_argument(
        "--browser",
        action="store_true",
        help="Run the browser-based 390px viewport check in addition to static checks",
    )
    args = parser.parse_args(list(argv) if argv is not None else None)

    target = args.target
    if not is_url(target):
        target = str(Path(target).resolve())

    html = read_text(target)
    errors = static_checks(html, args.target)
    if args.browser:
        browser_target = target if is_url(target) else f"file://{target}"
        errors.extend(browser_checks(browser_target))

    if errors:
        fail(errors)

    mode = "static + browser" if args.browser else "static"
    print(f"Mobile regression check OK ({mode}): {args.target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
