# Social-to-repository research note (2026-07-29)

## Trigger
Use when an X / social post names an open-source project, includes a shortened GitHub link, or asks for multiple cards (detail + beginner/advanced guide) based on one project.

## Evidence boundary
Treat the social post as discovery and narrative context. Resolve the underlying repository and make the repository's README, architecture docs, configuration docs, package metadata, and source tree the primary evidence for implementation claims. Preserve the social post's status ID, author, visible timestamp, and engagement snapshot only when the user requests source provenance or the card is explicitly X-origin.

## Deterministic discovery path

1. Extract the post body and engagement snapshot with the social extractor (vxtwitter/API first; CDP/browser fallback if needed).
2. If the post contains a `t.co`/shortened repository URL and redirect resolution is unreliable, query the GitHub repository search API using distinctive project names and description phrases. Do not guess the canonical repository from a similarly named project.
3. Verify the candidate repository through the GitHub API: `full_name`, description, stars, forks, license, primary language, created/updated times, default branch, and canonical URL.
4. Read the raw README and named documentation files (`docs/architecture.md`, `docs/knowledge-base.md`, `docs/configuration.md`, etc.) before authoring. Record the exact paths used as evidence.
5. Separate claims into: (a) first-party repository facts, (b) directly readable social-post facts, and (c) community/search leads. Do not upgrade a social summary or search snippet into a first-party feature claim.
6. For a detail card plus a usage guide sharing one repository, use one research pack and one isolated publisher worktree. The cards may share facts, but their outlines must differ: introduction/architecture/benchmark versus beginner setup/advanced configuration/operations.

## Claim handling

- Put repository metrics and technical facts in the card only after API/raw-file verification.
- Treat project README benchmarks as project-reported measurements: preserve the tested repo, task, cost, turns/tokens, and comparison baseline; do not rephrase them as independent reproduction.
- Keep roadmap items, optional integrations, and experimental capabilities labeled as such; do not present them as guaranteed runtime behavior.
- Do not include arbitrary third-party provider URLs, API keys, affiliate links, or unverified installation instructions merely because community posts mention them.
- If a short link cannot be resolved but the project can be identified through a unique GitHub search result, state the identity evidence internally and cite the canonical repository in the public card.

## Two-card authoring contract

- Detail card: identity, problem, knowledge-base layers, pipeline states, provider/model strategy, benchmark, safety, and architecture.
- Guide card: installation, first boot, knowledge ingest, model assignment, scope/approval/run, advanced RAG refresh, fast path/revision loops, safety before real PR, and troubleshooting.
- Shared facts may be repeated, but avoid cloning the same prose. Each card needs its own title, description, path, metadata, and visual evidence.

## Release evidence

Before push, record per-card: HTML byte size, sidecar path/slug match, `main/html` balance, build/verify/leak results, desktop screenshot, 720px or 480px screenshot, and explicit visual disposition. If vision infrastructure fails (provider quota, missing project ID, heap pressure, or repeated timeout), retain screenshots and report `VISUAL_PENDING`/`PUBLISHED_PENDING_VISUAL`; static checks and HTTP 200 are not visual evidence.
