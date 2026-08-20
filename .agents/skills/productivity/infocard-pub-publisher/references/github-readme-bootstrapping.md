# GitHub README Bootstrapping for Infocards

> **Pattern learned 2026-07-04**：When subagents are running research in background, the main thread can simultaneously bootstrap the card using raw GitHub README content. This avoids waiting for subagent results before starting card structure.

## When to use this

- Subagents are dispatched for complex research (multiple angles, parallel fetches)
- You want to start writing the card structure immediately without waiting
- The GitHub repo README contains substantial technical content (setup commands, benchmarks, config examples)
- Asset downloads (logos, diagrams) can run in parallel with README parsing

## Core technique: split README fetch

```bash
# First 200 lines: overview, installation, training commands
curl -sL "https://raw.githubusercontent.com/{org}/{repo}/main/README.md" | head -200

# Last 300 lines: evaluation results, benchmark tables, advanced usage, FAQ
curl -sL "https://raw.githubusercontent.com/{org}/{repo}/main/README.md" | tail -300
```

**Why split?** Large READMEs have dense content at both ends. Early sections cover setup/architecture; late sections cover benchmarks/results/advanced topics. Middle sections are often narrative prose with lower information density.

## Asset bootstrapping in parallel

```bash
# Create asset directory first
mkdir -p docs/assets/images/{date}-{slug}

# Download primary logo/asset
curl -sL "https://raw.githubusercontent.com/{org}/{repo}/main/assets/logo.png" \
  -o docs/assets/images/{date}-{slug}/logo.png

# Check size immediately — 14 bytes usually means 404 / redirect failure
echo "size: $(wc -c < docs/assets/images/{date}-{slug}/logo.png)"
```

## Parallel execution pattern (real example from Open R1)

```
Main thread:
  ├─ curl README head -200    → SFT commands, setup
  ├─ curl README tail -300    → evaluation benchmarks, results
  ├─ mkdir + curl logo        → asset directory
  └─ Write card HTML (v1 skeleton with known README content)

Subagents (background):
  ├─ Subagent 1: detailed technical research
  └─ Subagent 2: methodology + usage patterns
```

When subagents return → update card with additional detail → write meta.yaml → build → verify → push

## Pitfalls

1. **Logo 404 → silent failure**: Check file size with `wc -c`. 14-50 bytes usually means GitHub redirect or 404. Use fallback or skip logo.
2. **Rate limiting**: If search tools hit rate limit, fall back to `curl raw.githubusercontent.com` which has higher limits.
3. **README not on main branch**: Some repos use `master`, `dev`, or versioned branches. Check `HEAD` commit to verify branch name.
4. **README too large**: If README > 500KB, use `head -n` with smaller window. First 150 lines usually captures the key content for a card skeleton.
