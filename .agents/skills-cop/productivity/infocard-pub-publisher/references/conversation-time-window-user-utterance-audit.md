# Conversation time-window user-utterance audit

Use when the user asks questions like "18 点之后我说过什么", "把我今天说的话列出来", or challenges a count derived from infocard work.

## Rule

Do not answer from git commits, card metadata, or compaction summaries alone. Those are task artifacts, not the user's utterances.

## Workflow

1. Use `session_search` first. Browse recent sessions, then search with concrete terms from the task (`repo slug`, `发布信息卡`, `go`, `重新回答我`, etc.).
2. Convert message timestamps to Asia/Shanghai before filtering.
3. Filter by `role == user`; exclude system notes, tool notifications, assistant summaries, and compacted context text unless the compacted context explicitly preserves a user quote that is otherwise unavailable.
4. If a user utterance is only recoverable from a compaction summary, mark its timestamp as uncertain instead of inventing one.
5. Separate three evidence layers in the answer:
   - exact user messages with exact timestamps
   - recovered user messages with uncertain timestamps
   - artifact-derived context (commits/meta/wiki) that explains what likely happened but is not a user quote
6. If the user asked for "我说的话", list the literal utterances first. Put analysis/counts after the list, not before it.

## Pitfall

A common failure is answering a time-window question with commit times (`git log`) or card creation metadata. That answers "what was published"; it does not answer "what the user said". Use commits only as corroborating context after the user-message list is built.
