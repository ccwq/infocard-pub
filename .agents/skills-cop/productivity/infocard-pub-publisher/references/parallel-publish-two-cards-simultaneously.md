# 并行发布两张信息卡工作流

## 触发条件

用户发送 `/q 并行发布信息卡` 或明确要求同时发布多张信息卡。

## 完整流程

### Phase 1 — 并行采集（同时执行）

两张卡的数据采集互相独立，同时发起：

```
[终端] node GitHub API → [终端] clone repo A
[终端] node GitHub API → [终端] clone repo B
```

```bash
# 同时克隆两个仓库（并行）
cd /tmp && git clone --depth=1 https://github.com/OWNER_A/REPO_A.git repo-a-img &
cd /tmp && git clone --depth=1 https://github.com/OWNER_B/REPO_B.git repo-b-img &
wait
```

```javascript
// 同时获取两个仓库的 GitHub API 数据
node -e "
const https = require('https');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'curl/7.88.1', 'Accept': 'application/vnd.github.v3+json' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    }).on('error', reject);
  });
}
async function main() {
  const [repoA, repoB] = await Promise.all([
    get('https://api.github.com/repos/OWNER_A/REPO_A'),
    get('https://api.github.com/repos/OWNER_B/REPO_B')
  ]);
  console.log('Repo A:', repoA.stargazers_count, repoA.full_name);
  console.log('Repo B:', repoB.stargazers_count, repoB.full_name);
}
main().catch(console.error);
"
```

### Phase 2 — 串行写卡

数据到手后，依次写两张卡的 HTML + meta.yaml：

```bash
TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"
# → 2026-07-09 19:21:24

# 写卡 A
write_file docs/<slug-a>.html
write_file docs/<slug-a>.html.meta.yaml

# 写卡 B
write_file docs/<slug-b>.html
write_file docs/<slug-b>.html.meta.yaml
```

风格选择原则：
- 开源工具 / CLI / 重型系统 → redswiss
- WebGPU / AI 工具 / 深色科技感 → darkblue
- 知识图谱 / 依赖关系 → graph-paper / handline
- 具体以内容为准，不要教条

### Phase 3 — 统一 build

```bash
cd ~/infocard-pub
npm run build 2>&1 | tail -8
# 期望: wrote _index.yaml and injected index.html (517 cards)
```

build 成功后两张卡的索引同时生成。

### Phase 4 — 依次 commit + push

两次独立的 commit/push，每张卡单独描述：

```bash
# 卡 A
git add docs/<slug-a>.html docs/<slug-a>.meta.yaml
git commit -m "feat: add <slug-a> infocard (redswiss)

Repo: OWNER_A/REPO_A, N stars"
git push origin main

# 卡 B
git add docs/<slug-b>.html docs/<slug-b>.meta.yaml assets/img/<slug-b>/
git commit -m "feat: add <slug-b> infocard (darkblue)

Repo: OWNER_B/REPO_B, N stars
assets/img/<slug-b>/ (N images)"
git push origin main
```

> 两次 push 是安全的，Pages 部署会合并两次 commit。

### Phase 5 — 并行核验

push 后轮询两张卡的公网访问：

```bash
for slug in <slug-a> <slug-b>; do
  for i in $(seq 1 12); do
    status=$(curl -sI "https://ccwq.github.io/infocard-pub/docs/$slug.html" | head -1)
    echo "[$slug] [$i] $status"
    if echo "$status" | grep -q "200"; then
      # 验证关键内容
      curl -s "https://ccwq.github.io/infocard-pub/docs/$slug.html" | grep -oE '关键词1|关键词2' | sort -u
      break
    fi
    sleep 10
  done
done
```

### Phase 6 — Wiki 同步（串行）

每张卡完成后独立同步：

```bash
WIKI_PATH="/home/ccwq/hehome/hermes-data/home/wiki"
TS=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")

# 卡 A
mkdir -p "$WIKI_PATH/raw/articles" "$WIKI_PATH/concepts"
cat > "$WIKI_PATH/raw/articles/<date>-infocard-<slug-a>.md" << 'EOF'
# <Slug-A> 信息卡存档
...
EOF
cat > "$WIKI_PATH/concepts/<slug-a>.md" << 'EOF'
---
title: <Slug-A>
...
EOF

# 卡 B
cat > "$WIKI_PATH/raw/articles/<date>-infocard-<slug-b>.md" << 'EOF'
...
EOF
cat > "$WIKI_PATH/concepts/<slug-b>.md" << 'EOF'
...
EOF

# 统一追加日志
LOG="$WIKI_PATH/log.md"
echo "
## $TS — <Slug-A> 信息卡
- **卡：** <slug-a>
- **公网：** https://ccwq.github.io/infocard-pub/docs/<slug-a>.html
## $TS — <Slug-B> 信息卡
- **卡：** <slug-b>
- **公网：** https://ccwq.github.io/infocard-pub/docs/<slug-b>.html" >> "$LOG"
```

## 关键约束

| 约束 | 说明 |
|------|------|
| 时间戳 | 每张卡用自己的 `TZ=Asia/Shanghai date` 时刻 |
| commit 描述 | 每张卡单独 commit，方便 revert |
| push 顺序 | 任意；Pages 会合并 |
| wiki 同步 | 每张卡独立完成后再下一张 |
| 临时目录 | 每张卡用自己的 `/tmp/<slug>-img/` |
| `git add` | 只 stage 本次相关文件 |

## 案例：本次并行发布

| 卡 | 仓库 | 风格 | 截图 |
|----|------|------|------|
| 20260709-cachecloud-redis-cloud | sohutv/cachecloud (8,901★) | redswiss | 7 张（3.4MB）|
| 20260709-aidekin-browser-ai | stfurkan/aidekin (4★) | darkblue | 2 张（156KB）|

两张卡从采集到 wiki 同步总耗时约 8 分钟（两次 push + 两次 Pages 部署轮询）。
