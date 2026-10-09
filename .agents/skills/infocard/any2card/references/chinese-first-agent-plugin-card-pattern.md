# Chinese-First AI Agent Plugin Card: Qwen-MM-Plugins Case Study

## Pattern

For Chinese-tweet sources describing AI agent tools/plugins, the card must be primarily in Simplified Chinese (≥40% Chinese characters by count). English is reserved for: command blocks, technical terms (MCP, API, ffmpeg, etc.), and brand names.

## Source characteristics

- Chinese tweet by a tech blogger (e.g., @Ryrenz, 10,686 followers)
- Links to a GitHub repo with English README
- Project: QwenLM/Qwen-MM-Plugins (2,983 stars, Apache-2.0)
- Key value: 9 multimodal capabilities for AI agents (core/api/search/video-memory/video-edit/blender/freecad/edu-agent/mhs)

## Content structure (10 sections, 59% Chinese achieved)

1. **Hero** — Stars / license / capability count + pain point intro (agent can't see screenshots)
2. **Pain point** — Before/after contrast (文字描述 vs Agent 自己看图)
3. **9-capability grid** — Each: name + tags (是否需要密钥) + use case + requirements
4. **mhs deep-dive** — 6 fixed MHS tools (discover→meta_info→read→write→health_check→reset); adapter=HTTP server; safety limits; estop mode
5. **Installation** — Guided installer (7 harnesses) + manual (9 harnesses) + Claude Code plugin commands
6. **Usage examples** — Natural file references (@report.pdf / @meeting.mp4 / @brain.nii.gz)
7. **Tech stack** — uv/uvx, ffmpeg, DashScope, Serper/Exa/Tavily, Blender, Xvfb
8. **Agent compatibility** — 15+ harnesses listed with install methods
9. **Version history** — 2026-08-03 first release → 9 capabilities
10. **Command reference + config vars** — Full env var table

## Chinese ratio measurement

```python
import re
with open('card.html') as f:
    html = f.read()
cn = len(re.findall(r'[\u4e00-\u9fff]', html))
en = len(re.findall(r'[a-zA-Z]{3,}', html))
print(f'CN/EN ratio: {cn/en*100:.1f}%')  # Target: ≥40%
```

## Verification checklist

- [ ] CN ratio ≥ 40% (measured via regex, not estimated)
- [ ] 49/51 content checks pass (key facts from facts.json)
- [ ] info-leak check: `node scripts/check-info-leak.js` → 0 issues
  - RFC 5737 addresses (192.168.x.x / 198.51.100.x / 203.0.113.x) → replace with `your-hostname.example.com`
- [ ] Hero: stars, license, capability count, @author
- [ ] mhs section: 6 tool names, adapter concept, safety/estop
- [ ] Installation: install.sh command, Claude Code plugin commands
- [ ] darkblue theme consistent throughout

## Known pitfalls

- Subagent delegation for Chinese-tweet sources: subagent typically produces 2-5% Chinese → main agent must rewrite
  - `ai-website-cloner-template`: 33.2% → 42.2% after main-agent rewrite
  - `qwen-mm-plugins`: 3.56% → 59.2% after main-agent rewrite
- Template literal `${...}` in delegation goal causes parse error → expand inline
- RFC 5737 addresses in code examples trigger check-info-leak.js MEDIUM warnings → always use hostname placeholders

## Reference card

- Published: `docs/20260927-qwen-mm-plugins.html`
- Commit: `07825465`
- Theme: darkblue
- CN ratio: 59.1%
- URL: https://ccwq.github.io/infocard-pub/docs/20260927-qwen-mm-plugins.html
