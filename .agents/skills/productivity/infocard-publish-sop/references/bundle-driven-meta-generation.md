# Bundle-driven metadata generation and verification

Use this workflow when the publish bundle contract is already available and Agent2 would otherwise hand-write `.meta.yaml`.

## Responsibility split

1. Validate the bundle before card writing.
2. Before Agent2 starts, run:
   ```bash
   node scripts/generate-card-meta.js --bundle .tmp/publish-bundles/<slug>.json --write
   ```
3. The generator owns the mechanical fields and emits them from the bundle:
   - `slug`
   - `path` from `html_path`
   - `style`
   - `category`
   - `source_url`
4. The generated file contains explicit safe placeholders for `title`, `desc`, and `tags`. Agent2 replaces only these content fields.
5. Agent2 must not edit the five mechanical fields and must not add `date` or `updated`; the build timestamp toolchain owns timestamps.
6. Run `verify-bundle` again after Agent2 writes the card. If the meta exists, it must compare every mechanical field exactly with the bundle. If meta does not exist yet, bundle validation must remain usable so generation is not circular.

## Overwrite safety

- `--write` creates the sidecar only when absent.
- Existing meta must be refused by default.
- Overwrite requires explicit `--write --replace`.
- `--replace` without `--write` is a usage error.
- CLI output stays machine-readable JSON: success `0`, validation/file conflict `1`, usage `2`.

## YAML source-of-truth and parser compatibility

For generated scalar strings, JSON double-quoted string encoding is valid YAML and safely handles colons, quotes, URLs, Unicode, and comment characters. Emit arrays in JSON flow style when no YAML package is guaranteed.

The verifier must reuse the repository build pipeline's actual metadata parser or a shared parser module with identical semantics. Do not add an ad-hoc top-level YAML parser merely because only five fields are locked: partial parsers commonly reject valid quoted scalars with inline comments, mishandle `#` inside quotes, silently overwrite duplicate keys, or disagree on block/flow collections. Add compatibility tests for double- and single-quoted scalars, inline comments, hashes inside quotes, escaped single quotes, block/flow arrays, duplicate mechanical keys, and malformed YAML. Duplicate locked keys must fail rather than use last-write-wins behavior.

## Filesystem-safe generation

Bundle validation of the lexical `meta_path` is not sufficient for writes. A pathname check followed by Node `open('wx')` is also insufficient: an attacker or concurrent process can replace a checked parent directory with a symlink between check and open. Directly writing the final pathname can additionally leave a completed-looking sidecar when write/fsync fails.

Use descriptor-relative installation on Linux (a small Python stdlib helper is acceptable when Node lacks portable `openat` primitives):

1. Open the repository root as a directory descriptor.
2. Traverse each destination parent component relative to that descriptor with `O_DIRECTORY | O_NOFOLLOW`; never resolve the write target again from an absolute pathname.
3. Create a unique temporary file in the verified final-parent descriptor with `O_CREAT | O_EXCL | O_NOFOLLOW`; write, flush, and fsync it.
4. **Create/no-replace:** install without clobbering by descriptor-relative hard-link (or equivalent atomic no-replace primitive), then unlink the temp file and fsync the parent. `EEXIST` is a normal refusal.
5. **Replace:** descriptor-stat the existing target without following symlinks, reject symlink/non-regular targets, then descriptor-relative atomic replace and fsync the parent.
6. On every failure, unlink the temporary file; create mode must never leave a final sidecar after write/fsync failure.

Static checks remain useful as early diagnostics, but they are not the security boundary. Tests must include: static symlink target, static symlink parent, a deterministic parent-swap race, injected write/fsync failure, external target unchanged, no final file after failed create, and no temp residue.

## Strict TDD and delivery evidence

1. Add one behavioral slice to `scripts/test/generate-card-meta.test.js`.
2. Run the target test and preserve RED evidence showing the missing behavior, not a typo.
3. Implement the minimum behavior and rerun to GREEN.
4. Run Task 1–3 tests together, then `npm run verify` and `git diff --check`.
5. Stage only files in the task allowlist; never include `.hermes/` or unrelated dirty files.
6. Commit with the exact user-requested message.
7. If the user explicitly requests push, push the commit and verify the remote branch contains the hash before reporting completion. A local commit is not a completed push deliverable.

## Common pitfalls

- Do not make `verify-bundle` require meta existence before the generator can create it.
- Do not derive locked fields from filenames independently when the validated bundle is the source of truth.
- Do not silently overwrite an Agent2-edited sidecar.
- Do not claim the requested push completed when only a local commit exists.
- Do not stage repository-local planning files merely because they were read for requirements.
