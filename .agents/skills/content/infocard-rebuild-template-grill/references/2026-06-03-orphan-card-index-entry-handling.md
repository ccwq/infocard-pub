# 孤儿索引条目处理（2026-06-03）

## 现象
用户报告「某页面有两张图没加载成功」，但该卡本地文件不存在，线上返回 404。

## 根因
该卡之前被 `git rm` 删除并推送了，但 `_index.yaml` 里残留了孤儿条目（指向一个不存在的 HTML 文件）。

## 诊断流程

```
1. curl -s -o /dev/null -w "%{http_code}" <url>   # 确认线上状态
2. find . -name "<slug>*" -not -path "./.git/*"  # 检查本地是否存在
3. grep "<slug>" _index.yaml                      # 检查索引里有没有
```

## 两种情况

### 情况 A：本地文件存在，但图片 URL 失效
- 修图片 URL 或下载到 `docs/assets/images/` 本地化
- 常见于 hotlink 指向 CDN 过期

### 情况 B：本地文件不存在，线上 404
- 没有图片需要修，因为页面本身不存在
- 孤儿索引条目由 `index.yml` 工作流在下一次推送时自动清理
- 不需要手动修 `_index.yaml`（除非想立即清理）

### 情况 B 主动清理（可选）

```bash
python scripts/rebuild_index.py
git add _index.yaml
git commit -m "chore: sync _index.yaml — remove orphaned <slug> entry"
git push
```

但若 CI 同期也在推送，push 会因远端前进而失败，需要 rebase：

```bash
git fetch origin main && git rebase origin/main && git push
# 若冲突：python scripts/rebuild_index.py && git add _index.yaml && GIT_EDITOR=true git rebase --continue && git push
```

## 关键结论
index.yml 工作流在每次 main 推送时运行 `rebuild_index.py` + `verify_index.py` + 自动提交。这意味着孤儿条目会在下一次 CI 运行时自动被清除，不需要人工盯守。

## 教训
「图片加载失败」≠ 一定有图片需要修。先确认页面是否真实存在，再判断是修图片还是清理孤儿索引。