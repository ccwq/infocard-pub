#!/usr/bin/env python3
"""公众号 HTML 合规二次检查：检查禁用属性、标签白名单、span leaf 包裹率。"""
import re, sys

content = open(sys.argv[1]).read()

style_attrs = re.findall(r'style="[^"]*"', content)
issues = [s for s in style_attrs for b in [
    'position:', 'gradient', 'var(', 'clamp(', 'vw', 'vh', 'rem', 'min-width'
] if b in s]

print(f"Total style attrs : {len(style_attrs)}")
print(f"Banned style issues: {len(issues)}")
for iss in issues:
    print(f"  {iss[:120]}")

leafs = re.findall(r'<span leaf=""', content)
print(f"\nspan leaf= count : {len(leafs)}")

# All tags used
all_tags = re.findall(r'<(\w+)[\s>]', content)
tc = {}
for t in all_tags:
    tc[t] = tc.get(t, 0) + 1

allowed = {
    'section','span','p','h2','h3','h4','ul','li','strong','em','br',
    # structural — in <head> only
    'meta','html','head','title','body',
}
print(f"\nTag distribution:")
for t, c in sorted(tc.items(), key=lambda x: -x[1]):
    ok = "OK" if t in allowed else "BAD"
    print(f"  [{ok}] <{t}>: {c}")

print(f"\nFile size : {len(content)} bytes")
bad = [t for t in tc if t not in allowed]
if bad:
    print(f"FAIL — disallowed tags: {bad}")
    sys.exit(1)
elif issues:
    print(f"FAIL — banned style patterns")
    sys.exit(1)
else:
    print(f"PASS")
