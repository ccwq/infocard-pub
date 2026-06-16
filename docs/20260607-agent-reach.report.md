# Agent Reach 更新采集报告

- Source URL: https://github.com/Panniantong/Agent-Reach
- Captured at: 2026-06-17T06:35:08+08:00
- Target card: docs/20260607-agent-reach.html

## GitHub metadata

- Repo: Panniantong/Agent-Reach
- Description: Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees.
- Stars: 31,971
- Forks: 2,574
- Open issues: 62
- License: MIT
- Language: Python
- Version from pyproject.toml: 1.5.0
- Latest pushed_at: 2026-06-16T12:45:59Z

## Source files read

- README.md
- docs/install.md
- docs/update.md
- pyproject.toml
- agent_reach/cli.py
- GitHub contents listings for root, docs, agent_reach

## Content updates applied

- Reframed Agent Reach as a capability layer / internet entry infrastructure, not a crawler framework.
- Updated platform matrix from latest README:
  - zero-config: Web, YouTube, RSS, V2EX, Bilibili basic, etc.
  - configured unlock: GitHub private/PR/Issue, X, Reddit, 小红书, LinkedIn, 雪球, 小宇宙播客.
- Added current backend routing:
  - web.py → Jina Reader
  - twitter.py → twitter-cli ▸ OpenCLI ▸ bird
  - bilibili.py → bili-cli ▸ OpenCLI ▸ Search API; yt-dlp retired for B站 due to 412 protection
  - reddit.py → OpenCLI ▸ rdt-cli; no anonymous zero-config path
  - xiaohongshu.py → OpenCLI ▸ xiaohongshu-mcp ▸ xhs-cli
- Added installation/update boundaries:
  - no sudo unless explicitly approved
  - no workspace pollution
  - persistent files under ~/.agent-reach/
  - temp files under /tmp/
- Added Cookie-Editor / configure --from-browser / proxy and security guidance.
- Updated stats and meta description.

## Network notes

GitHub API and contents API succeeded during this update.
