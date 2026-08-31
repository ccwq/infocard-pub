# infocard-pub · Remote-Ahead Stash-Rebase-Push

当 `git push` 被拒绝且错误信息是：

```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

说明远程有新提交（其他 workflow / 推送），本地落后于 remote。

## 标准恢复流程

```bash
git stash                    # 暂存本地改动
git pull --rebase           # 拉取远程 + rebase 本地提交
git stash pop               # 恢复暂存的本地改动
git push                    # 再次推送
```

## 验证

```bash
# 确认工作区干净
git status
# 确认远程推送成功
curl -sI https://ccwq.github.io/infocard-pub/_index.yaml | head -3
```

## 为什么用 stash pop 而不是 merge

- `pull --rebase` 把远程新提交"放到底层"，本地提交"叠到上面"
- `stash pop` 把暂存的本地改动重新应用
- 结果：本地的 commit 历史保持线性，不产生 merge commit

## 如果 rebase 后本地有unstaged变化（另一种报错）

```
error: cannot pull with rebase: You have unstaged changes.
```

说明 `git stash` 没有 stash 干净（可能是之前 `npm run build` 产生的变更）。处理：

```bash
git stash                      # 先存本地
git pull --rebase              # 拉取远程
git stash pop                  # 恢复暂存
# 此时可能仍有 unstaged，用 git status 确认
git add .                      # 把所有本地变更全部暂存
git commit --amend --no-edit  # 修正当前 commit
git push
```

## 关键教训

- `npm run build` 会修改 `_index.yaml` 和 `index.html`，如果 build 后没有及时 commit，这些变更会和 remote 新提交冲突
- 每次 `npm run build` 后立即 `git add _index.yaml index.html` 再继续，避免本地工作区积累 dirty state
- **单次完整 commit**：build → add → commit → push 连续完成，不要中间穿插其他操作

## 本次会话记录

- **2026-06-14**：ponytail 卡发布时连续两次 remote-ahead，原因是 `npm run build` 后 `_index.yaml` 未及时 add，导致 stash 后工作区仍 dirty
- 恢复方法：二次 `git pull --rebase && git stash pop && git push` 最终成功