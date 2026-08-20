# Republish with fixed creation time

Session-derived rule for this user’s infocard-pub workflow:

- When the user says “按照最新的规范重新发行” or similar, treat the target card as a *new issuance event*.
- Set `date` to the card’s current creation / reissue wall-clock time in Asia/Shanghai.
- Do **not** reuse the source content’s original publication time for `date` when republishing.
- Usually set `updated` to the same timestamp so the reissue is top-sorted and visibly aligned.
- Rebuild `_index.yaml` from all sidecars after the metadata change.
- Verify the deployed homepage order and the public `/_index.yaml` separately.
- If `git push` is rejected or `_index.yaml` conflicts during rebase, regenerate the index rather than hand-editing conflict markers.
