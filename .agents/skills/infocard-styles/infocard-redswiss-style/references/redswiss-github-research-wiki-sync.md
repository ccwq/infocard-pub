# infocard-redswiss · GitHub Research & Wiki Sync Reference

## GitHub API Research Pattern（2026-07-07）

### 标准调研四源并行

发布信息卡前，四个来源**同时** curl，获取完整数据：

```bash
# 1. GitHub REST API — 数值数据
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/<owner>/<repo>" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print('stars:', d.get('stargazers_count'))
print('forks:', d.get('forks_count'))
print('license:', d.get('license',{}).get('spdx_id'))
print('language:', d.get('language'))
print('description:', d.get('description'))
print('homepage:', d.get('homepage'))
print('created:', d.get('created_at'))
print('topics:', d.get('topics'))
print('open_issues:', d.get('open_issues_count'))
"

# 2. README.md — 功能描述
curl -s "https://raw.githubusercontent.com/<owner>/<repo>/main/README.md" | head -200

# 3. 官方文档首页 — 视觉/场景描述
curl -s "https://<domain>/en/" | python3 -c "
import sys,re; content=sys.stdin.read()
text=re.sub(r'<script[^>]*>.*?</script>','',content,flags=re.DOTALL)
text=re.sub(r'<style[^>]*>.*?</style>','',text,flags=re.DOTALL)
text=re.sub(r'<[^>]+>',' ',text)
text=re.sub(r'\s+',' ',text).strip()
print(text[:3000])
"
```

### Zvec 调研结果（2026-07-07，供参考）

| 字段 | 值 |
|------|-----|
| Stars | 13,781 |
| Forks | 835 |
| 许可证 | Apache-2.0 |
| 语言 | C++ |
| 最新版本 | v0.5.0（2026-06-12）|
| Topics | rag, llm-memory, local, vector-database, hnsw, diskann, fts |

## Wiki Sync 流程（2026-07-07）

### 发布前检查

```bash
# 查是否已有条目（避免重复）
find /home/ccwq/hehome/hermes-data/home/wiki -name "*<slug>*" 2>/dev/null
grep -n "<Name>" /home/ccwq/hehome/hermes-data/home/wiki/index.md
```

### Wiki 三文件写入

1. **raw/article**：`raw/articles/YYYY-MM-DD-infocard-<slug>.md`
2. **概念/实体页**：`concepts/<slug>.md` 或 `entities/<slug>.md`
3. **更新 index.md**：grep 现有条目 → patch 描述行

### ⚠️ Git Add 顺序陷阱

新文件必须先 `git add` 再 `git commit`，否则 commit 不会包含它们：

```bash
git add new_file1.md new_file2.md existing_modified_file.md
git commit -m "wiki: ..."
git status  # 确认干净
```
