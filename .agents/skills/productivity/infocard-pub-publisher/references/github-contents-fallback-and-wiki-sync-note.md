# GitHub repo source fallback + wiki sync note

Use when producing GitHub-repo infocards and syncing the result into LLM Wiki.

## Source collection fallback

If `raw.githubusercontent.com` or another direct raw fetch fails, do **not** stop at the first error. Prefer this ladder:

1. GitHub REST API for repo metadata: stars, forks, issues, default branch, language, license, updated/pushed times.
2. GitHub Contents API for text assets:
   - `README.md`
   - `LICENSE.md`
   - `skills/**/SKILL.md`
   - `references/**`
   - `examples/**`
   - `.claude-plugin/plugin.json`
3. Decode `content` from base64 and treat the response as the authoritative text source for layout/content extraction.
4. If the repo has a useful avatar/banner image, use `avatar_url` or a stable public asset URL, download it locally, and reference the local file in the card.

### Practical reason

Some repos are readable through the GitHub API even when raw direct reads hit TLS/EOF/SSL failures. For this class of card, the API is not a fallback of last resort; it is a normal source channel.

## Wiki sync sequence

For high-value infocards, sync to LLM Wiki only after public verification passes.

1. Write the raw article first.
2. Write the concept/query/entity page that summarizes the card.
3. Update `index.md`.
4. Append a single log entry for the batch.
5. Recompute any file digest/sha256 from the **final written raw file contents**, not from a pre-write draft or filename guess.
6. Verify the wiki repo is clean and committed.

## Search tip

When homepage search does not surface the card by exact repo name, try a content-bearing keyword from the title or lead sentence instead. Index/search often keys off the prose the user will remember, not the repository slug.
