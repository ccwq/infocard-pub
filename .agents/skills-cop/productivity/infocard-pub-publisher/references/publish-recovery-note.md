# KTX publish recovery note

- User-provided source cards in `infocard-pub` must be published with the same rigor as repo cards: write HTML + `.meta.yaml`, run build/verify, commit/push, then public HTTP 200 verify, then wiki sync.
- When a push is rejected because `origin/main` advanced, do **not** blindly `git reset --hard origin/main` if the current card files are still needed. First preserve the new card bundle by re-materializing the HTML/meta from the working copy or a recovery location, then reconcile with remote.
- A failed push after a successful local commit means the commit still exists on the detached HEAD / current reflog even if the worktree is reset. Recover by checking the latest commit hash, then re-attaching to the branch and re-adding the card files before committing again.
- If `git reset --hard origin/main` is used during publish recovery, immediately verify whether the newly written card files still exist in the worktree before doing anything else. If they disappeared, recreate them from the source draft or a recovery copy; do not continue to commit/push with a missing bundle.
- For publish tasks, a local build passing is not enough. The final report must be blocked until the public page is 200 and wiki sync has completed.
- When the task is explicitly `发布信息卡`, do not stop at a draft preview once the user says `继续发布` or `直接进行发布`.
