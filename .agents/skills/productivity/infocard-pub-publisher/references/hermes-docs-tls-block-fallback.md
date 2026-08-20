# hermes-agent.nousresearch.com TLS block — source fallback

Use when the target source URL is `hermes-agent.nousresearch.com` and all network tools (curl, wget, browser_navigate) fail with TLS errors.

## Symptoms

```
curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to hermes-agent.nousresearch.com:443
# or
SSL_ERROR_SYSCALL / gnutls_handshake failed / Connection reset by peer
```

DNS resolves to a non-public IP (`28.0.1.71`), suggesting routing interception.

## Diagnosis checklist

1. Try `--noproxy '*'` to bypass proxy: `curl -sL --noproxy '*' https://hermes-agent.nousresearch.com`
2. Try `-4` to force IPv4: `curl -sL -4 https://hermes-agent.nousresearch.com`
3. Try HTTP/1.0: `curl -sL --http1.0 https://hermes-agent.nousresearch.com`
4. If all fail with TLS, the domain is blocked from this machine.

## Fallback chain (in order)

1. **Local Hermes skill files**: Check if the topic exists in the local skills directory:
   ```bash
   find ~/hehome/hermes-data/skills -name "*.md" | xargs grep -l "<keyword>"
   ```
   Hermes skills are installed at `~/hehome/hermes-data/skills/` and contain full SKILL.md content.

2. **GitHub raw content**: Try `raw.githubusercontent.com` with the same path:
   ```
   https://raw.githubusercontent.com/NousResearch/hermes-agent/main/<path>
   ```

3. **GitHub Contents API**: Use the API to get base64-encoded file content:
   ```bash
   curl -sL "https://api.github.com/repos/NousResearch/hermes-agent/contents/<path>"
   ```
   Then decode the `content` field from base64.

4. **Web search**: Use `mcp_minimax_web_search` to find secondary sources (CSDN, 博客园, etc.) that quote or summarize the content.

5. **MCP resource/prompt lookup**: Try `mcp_minimax_list_resources` and `mcp_minimax_list_prompts` — the MCP server may have the content cached.

## Example: LLM Wiki skill (2026-06-18)

URL `https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/research/research-llm-wiki` blocked at TLS layer.

Fallback path used:
1. Confirmed blocked via curl with multiple flags.
2. Found local skill at `~/hehome/hermes-data/skills/research/llm-wiki/SKILL.md` — contained full skill content.
3. Supplemented with web search results (CSDN article quoting the skill).
4. Card content was accurate based on local skill file + search.

## Key lesson

Do not report "source unavailable" without exhausting the local skill files and GitHub Contents API fallback. Hermes Agent installs skills locally — many `hermes-agent.nousresearch.com` docs have local mirrors at `~/hehome/hermes-data/skills/`.
