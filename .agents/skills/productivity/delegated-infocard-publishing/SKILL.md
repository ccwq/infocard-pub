---
name: delegated-infocard-publishing
description: Use when infocard-publish-sop routes a complex card to bounded research handoffs stored in .docs.
version: 4.0.0
---

# Delegated Infocard Research Handoffs

## Purpose

This skill supplies bounded Research A / Research B handoffs for the `.docs → promotion manifest → primary checkout` infocard-pub workflow. It does not create formal card files, Git worktrees, clones, commits, Pages releases, or Wiki content.

## Authorization and source ambiguity

When the user explicitly requests full-route publication, research may continue through the already authorized release path. Resolve object identity with first-party evidence and preserve uncertainty in the bundle. Never claim a social post named a project unless the post explicitly contains its name or URL.

## Exact-count rule

An explicit request such as “publish 7 cards” requires seven independently verifiable card artifacts, not a roundup. Each card gets its own `.docs/<run-id>/<slug>/` directory and frozen bundle.

## Research scopes

### Research A — first-party facts

Research A owns:

- official repository/API/README/docs/LICENSE evidence;
- capabilities, installation and configuration facts;
- one dynamic-data snapshot and `retrieved_at`;
- source quotations and distinctions that prevent false equivalence.

### Research B — narrative and risk

Use only for sensitive topics, unsupported strong/causal claims, conflicting sources, external distribution, or explicit fact/risk review. Research B owns claim verdicts, prohibited conflations, uncertainty, and wording boundaries. It does not duplicate Research A.

## Handoff location and contract

Researchers write only their assigned JSON/Markdown sections inside:

```text
<repo>/.docs/<run-id>/<slug>/
```

The bundle is:

```text
.docs/<run-id>/<slug>/publish-bundle.json
```

Use `schema_version: 3`. The bundle must identify source evidence, claim status, dynamic timestamps, prohibited conflations, evidence gaps, author requirements, and the exact `.docs` consumer path.

Researchers do not write candidate HTML/sidecars unless their assigned output explicitly says so. They never write `docs/`, `assets/`, indexes, Git state, or `/tmp` process files.

## Failure and concurrency

- A timeout means inspect the declared `.docs` handoff, then complete only the bounded missing research or record an explicit research failure.
- Parallel workers may collect independent facts but never edit the same `.docs` file concurrently.
- A child summary is not evidence. The orchestrator verifies files, schema, and required facts before authoring starts.
- Do not create an alternate checkout, worktree, clone, detached branch, or temporary repository as a recovery path.

## Boundaries

- No HTML, formal sidecar, promotion manifest, index, Git commit, push, Pages release, Wiki write, dependency install, worktree, clone, or `/tmp/infocard*` directory.
- No automatic retry that duplicates an existing research handoff.
- No conversion of unresolved evidence into confirmed card copy.

## Completion criterion

Every handoff has an owner, `.docs` path, consumer, readiness check, and explicit evidence boundary. The next stage is `infocard-authoring-workflow`; formal release is exclusively `infocard-pub-publisher`.
