# Agent Memory Layer Repo Card Pattern

Use this reference for GitHub repos whose main value is a **memory layer / memory OS / long-term memory infrastructure** rather than a single app or tool.

## What to emphasize

- Frame the repo as infrastructure: a layer that improves how agents remember, not another agent product.
- Compare the repo against the three common memory routes first:
  1. context growth
  2. RAG / vector DB retrieval
  3. memory API wrappers
- Then state the repo's fourth route in one sentence: make memory **readable, editable, versioned, and jointly maintained by humans and agents**.

## Canonical content blocks

- **Memory source of truth**: Markdown / files / editable knowledge pages.
- **Dual-track memory**: user memory vs agent memory.
- **Local stack**: Markdown + SQLite + LanceDB or equivalent local-first indexing stack.
- **Multimodal ingestion**: text, image, audio, web, email, code, and other source formats.
- **Self-evolving / reflection**: repeated patterns become cases / skills / reusable knowledge.
- **Install / configure / uninstall boundaries**: required providers, optional multimodal extras, local runtime, where the data lives, how to remove it safely.

## Source collection order

1. README narrative
2. architecture / storage layout sections
3. quick start / install / config / uninstall docs
4. feature table / use cases / future roadmap
5. public homepage if the repo has one

## Theme guidance

- Prefer `wood`, `hardblue`, or another infrastructure/manual theme.
- Choose `wood` when the repo reads like a durable memory operating system, file-backed knowledge base, or human/agent co-editable layer.
- Use a process or pipeline diagram when the repo has a clear ingest → index → retrieve → evolve loop.

## Pitfalls

- Do not write the card as a generic app launch or generic RAG summary.
- Do not treat “memory API” as the default winning answer; compare alternatives explicitly.
- Do not hide install/config/uninstall details in a tiny footer if the source repo exposes them prominently.
- Do not blur user memory and agent memory into one undifferentiated bucket.
- Do not overclaim solved problems around privacy, permissions, or memory quality; surface them as open questions when the repo does.

## Good phrasing examples

- “把记忆做成可读、可编辑、可版本管理的知识层。”
- “不是再造一个 Agent，而是在补 Agent 真正缺的 memory layer。”
- “Markdown 是源头，SQLite / LanceDB 负责索引与检索。”

## Related skill

- `infocard-pub-publisher` should point here when the source repo is a memory OS or long-term memory infrastructure project.
