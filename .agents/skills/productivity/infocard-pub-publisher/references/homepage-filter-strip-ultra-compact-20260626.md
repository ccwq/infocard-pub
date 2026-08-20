# Homepage filter strip ultra-compact follow-up (2026-06-26)

Use this when the user says the homepage taxonomy / tag strip is **still too large** after the first mini-chip tightening pass.

## Trigger phrases
- “无论是间距还是元素本身字体都太大”
- “要紧凑风格”
- “像工具栏，不像面板”
- “全部关键词首页不显示了”
- user sends a screenshot and points at the filter strip as visually oversized

## What changed in this session
After the first pass removed `全部关键词` and compressed the strip header, the user still judged the result too large. The winning move was **not** another IA discussion. It was a second density pass on the same strip.

## Tightening order
Apply these in order:

1. **chip height / padding**
   - reduce keyword and taxonomy chip height toward ~20px
   - reduce horizontal padding before touching layout structure
2. **count badge size**
   - shrink the numeric badge to ~7px text with ~11px box size
3. **taxonomy row labels**
   - reduce label font before collapsing more content
4. **`+N` control**
   - shrink height/width/font so it reads like an inline control, not a button block
5. **divider and row padding**
   - reduce vertical whitespace around dashed separators and row containers
6. **shadow weight**
   - lower to ~1px-level visual weight; large shadows make the strip feel tall even when boxes are smaller

## Visual target
The target is **toolbar density**, not panel density.
- short header
- one-line taxonomy rows
- chips that read like compact controls
- counts that read like tiny metadata
- no explanatory prose block
- no visible `全部关键词` chip on homepage when the user explicitly rejects it

## Non-goals
- Do not reopen taxonomy model discussions
- Do not defend the prior pass once the user says it still looks too big
- Do not add more labels or helper copy
- Do not stop at removing `全部关键词`; that alone does not solve density

## Release note
When this class of homepage CSS tweak ships, bump all three together:
- `assets/home/index.css` / `index.js`
- `index.html` asset query strings
- `docs/version.json`

Otherwise Pages may keep serving the older visual density and make the fix appear ineffective.
