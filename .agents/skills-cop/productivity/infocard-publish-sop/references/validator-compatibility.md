# Validator compatibility

Load this only when repository discovery finds a live validator whose fields differ from Protocol v3.

## Rule

Protocol v3 is the runtime source of truth. The compatibility bundle is a **derived mechanical projection** for an older validator; it never becomes an upstream fact source or release record.

## Procedure

1. Read the active validator and imported schema before creating artifacts.
2. Record required commands and field mapping in `bundle.repository.commands` and `bundle.repository.compatibility`.
3. Derive the compatibility JSON from v3 fields. Typical legacy requirements are top-level `source_url`, a particular `wiki` path, and a separate facts/manifest layout.
4. Run compatibility validation before authoring and after the last content-file edit. A local structure/content failure gets one targeted repair and one complete rerun.
5. Keep the compatibility bundle until the audit gate completes. It remains run-local and is never staged.

## Audit branch

After the content commit and public verification, the audit commit changes only the sidecar. Its gate is sidecar-only: YAML parses, required `release_audit` fields are present, `published_commit` equals the pushed content commit, artifact hashes match the content artifacts, and the staged set contains exactly the sidecar. Do not rerun a content-stage validator merely because the compatibility bundle was cleaned.

## Completion criterion

The live validator exits successfully for content-stage artifacts; v3 containment and ownership remain true; and the audit sidecar has an independent, passing audit gate.
