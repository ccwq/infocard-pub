# Source-redaction acceptance for public cards

## Trigger

Use this checklist when a user says a social platform is only a discovery source and must not appear in the result.

## Artifact scope

Scan every declared public artifact, not only the HTML body:

- `docs/<slug>.html`
- `docs/<slug>.html.meta.yaml`
- `docs/<slug>.report.md`
- image captions and local asset manifests
- generated index entries and visible source labels

## Procedure

1. Identify the underlying first-party sources that can support each claim.
2. Remove platform names, URLs, author handles, and discovery-only wording from public artifacts unless explicitly authorized.
3. Keep only claims supported by the underlying sources; delete or downgrade claims that depend on inaccessible summaries.
4. Scan common variants and translations, for example platform brand names, handles, URL hosts, and local-language names.
5. Repeat the scan after build because generated indexes can reintroduce metadata.
6. Repeat on the staged diff before commit.

## Acceptance

- Zero forbidden platform-name matches in public artifacts.
- Every retained factual claim maps to a first-party source.
- Any remaining provenance note is internal-only and not rendered publicly.
- A passing HTTP check does not replace the artifact scan.

## Failure handling

If a forbidden name appears:

- do not publish;
- trace whether it came from authored copy, metadata, an image caption, or generated index data;
- replace it with a first-party source or remove the claim;
- rebuild and rerun the full scan.
