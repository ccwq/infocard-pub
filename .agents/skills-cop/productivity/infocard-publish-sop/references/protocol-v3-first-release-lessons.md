# Protocol v3 first-release lessons

This reference records the first real v3 release (OpenAI `codex-plugin-cc`). It supplies only branches that Protocol v3 does not otherwise spell out.

## Build-mutated metadata

A repository build can overwrite a new sidecar's `date` and `updated`. Read the effective post-build sidecar before the content commit. Research retrieval time remains in facts/provenance; it is not a substitute for the build-derived publication time.

## Audit SHA boundary

The audit commit SHA does not exist until its sidecar commit is created. Therefore:

- `release_audit.published_commit` contains the content commit SHA;
- the run bundle records `release.audit_commit` after the audit commit is pushed;
- never add a third commit only to write an audit commit's own SHA into itself.

## Completion criterion

The content commit is publicly verified, the audit sidecar is independently gated and pushed or the run truthfully records `AUDIT_PENDING`, and no release record contains invented commit or visual evidence.
