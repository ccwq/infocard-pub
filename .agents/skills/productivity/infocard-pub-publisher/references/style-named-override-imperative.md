# Style Named = Read Theme CSS Immediately

> **Pitfall learned 2026-07-03**：Dagu rebuild — user explicitly named `infocard-white-purple-style` but I kept defaulting to dark-blue/main-style. Rebuilt 3× before getting it right. User frustration: "告诉我你重建了寂寞, 为什么颜色还是这样".

## The rule

When the user explicitly names a style in the publish command:

```
发布信息卡 infocard-redswiss-style ...
发布信息卡 infocard-white-purple-style ...
发布信息卡 infocard-main-style ...
```

**Immediately fetch the published theme CSS before writing any HTML:**

```bash
curl -s "https://ccwq.github.io/infocard-pub/theme/{style-name}.html" | head -120
```

Extract the CSS from `<style>...</style>` and implement it from scratch. Do NOT try to recolor/patch an existing card with a different style — that never produces the correct result.

## Why this is non-negotiable

| Approach | Result |
|---|---|
| Patch existing card with different style's CSS variables | ❌ Style bleeds through — wrong colors persist |
| Inline recolor without reading theme CSS | ❌ Token names differ per theme — `--accent` vs `--red` vs `--blue` |
| Copy structure from a similar card in another style | ❌ Components differ — RedSwiss has `topbar-hero`, WhitePurple has `glass-card` |
| Read theme from local skill only, skip live CSS | ⚠️ Skill may be stale; always verify live theme matches |

## Theme → token map (quick reference)

| Style | CSS token for accent color | Special component |
|---|---|---|
| `redswiss` | `--red: #c8102e` | `topbar-hero` diagonal gradient |
| `white-purple` | `--accent: #8a5cf5` / `--accent-deep: #5b49ff` | `glass-card` backdrop-blur |
| `main-style` | `--accent: #E60012` / `--accent2: #1A3A5C` | deep blue hero |
| `hardblue` | `--blue: #0066FF` / `--dark: #0A1628` | dark navy code blocks |
| `darkblue` | `--primary: #1E3A5F` | teal accent strips |
| `darkgreen` | `--green: #00C48C` | green terminal feel |

## Correct sequence

```
1. curl theme CSS from Pages
2. grep key tokens (--bg, --accent, --red, etc.)
3. write_file HTML from scratch using that token system
4. build → verify → push → screenshot
```

## If you already wrote the wrong card

Stop. Do not keep patching. Delete the wrong HTML and write from scratch using the correct theme CSS. One clean rebuild beats 3 wrong patches every time.

## Astryx lesson (correctly followed)

For Astryx (`infocard-redswiss-style`), I fetched `redswiss.html` → extracted `--bg: #f5f2ec`, `--red: #c8102e`, `--line: #0a0a0a` → rebuilt correctly in one shot. No rework needed.
