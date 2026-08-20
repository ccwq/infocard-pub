# Infocard Meta.yaml Gate & Build Failure Playbook

## Meta.yaml 必填字段（12项）

每个 `.meta.yaml` 必须包含：

```
slug           # URL slug，格式 YYYYMMDD-<topic-slug>
title          # 标题
desc           # 描述（中文，80字以内）
date           # 发布时间 "YYYY-MM-DD HH:MM:SS"（Asia/Shanghai，必须有时分秒）
updated        # 更新时间 "YYYY-MM-DD HH:MM:SS"
tags           # 标签列表（数组，字符串）
category       # 分类：舆情调查 / 调查核查 / 工具图鉴 / 技术调研 / 知识 / person 等
author         # 作者
source         # 来源平台：GitHub / 小红书 / 微博 / web 等
source_url     # 原始内容 URL
style          # 主题：hardblue / redswiss / white-purple / q-style / darkblue 等
path           # HTML 文件相对路径：docs/<slug>.html
```

## 本地 Meta Gate（build 前必须执行）

```bash
node -e "
const fs=require('fs'), yaml=require('yaml');
const d=yaml.parse(fs.readFileSync('docs/<slug>.html.meta.yaml','utf8'));
const errs=[];
['slug','title','desc','date','updated','tags','category','author','source','source_url','style','path'].forEach(k=>{if(!(k in d))errs.push('missing: '+k)});
if(d.date&&!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(d.date))errs.push('date format YYYY-MM-DD HH:MM:SS, got: '+d.date);
if(errs.length)throw new Error('Meta gate failed:\n'+errs.join('\n'));
console.log('META OK');
"
```

常见失败处理：

| 错误 | 修复 |
|---|---|
| `missing: category` | 从现有 .meta.yaml 复制格式（舆情调查/调查核查/工具图鉴/技术调研/知识 等） |
| `date format YYYY-MM-DD HH:MM:SS, got: 2026-07-25` | 必须加时分秒：`"2026-07-25 01:45:00"` |
| `missing: updated` | 新卡/更新卡必须同时有 date 和 updated |
| `not a YAML object` | 整个文件被 YAML 解析为多文档（检查是否有多个 `---` 分隔符） |

## GitHub Pages Build 失败排查路径

### Step 1：找失败 Run

```bash
curl -s "https://api.github.com/repos/ccwq/infocard-pub/actions/workflows/pages.yml/runs?per_page=5" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('workflow_runs',[])[:5]:
    print(r.get('status'), r.get('conclusion'), r.get('created_at'), r.get('head_sha')[:7])
"
```

### Step 2：找失败 Job

```bash
# 替换 <run_id> 为上面找到的失败 run ID
curl -s "https://api.github.com/repos/ccwq/infocard-pub/actions/runs/<run_id>/jobs" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for j in d.get('jobs',[]):
    if j.get('conclusion') == 'failure':
        print('FAILED job:', j.get('name'), 'id:', j.get('id'))
        for s in j.get('steps',[]):
            if s.get('conclusion') == 'failure':
                print('  FAILED step:', s.get('name'))
"
```

### Step 3：本地精确验证

GitHub Actions 日志需要 admin 权限不可得，**本地 `npm run build` 是最可靠的精确诊断**：

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
npm run build 2>&1 | grep -E "Error|error|fail" | head -20
```

### Step 4：常见根因速查

| 根因 | 症状 | 修复 |
|---|---|---|
| meta.yaml 缺 `category` | `missing fields category` | 补 category 字段 |
| `date` 只有日期无时间 | `date must be YYYY-MM-DD HH:MM:SS` | 改为完整时间字符串 |
| 缺 `updated` | `missing fields updated` | 补 updated 字段 |
| 多文档 YAML | `expected a single document in the stream` | 检查文件是否含多个 `---` 分隔符 |

### Step 5：修复后正确提交流程

```
worktree rebase origin/main
→ audit commit
→ worktree push origin <branch>
→ main fetch + merge FETCH_HEAD
→ main push origin main
```

**注意**：先 rebase 再 commit，否则 worktree HEAD 落后于 origin/main，导致 merge 失败并报 "local changes would be overwritten"。

## 参考现有 meta.yaml 格式

```bash
cat docs/20250714-jiang-fangzhou-retrospective.html.meta.yaml
cat docs/20260725-xhs-huawei-supply-chain-panic.html.meta.yaml
```
