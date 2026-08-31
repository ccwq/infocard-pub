# 推文链接 → GitHub 仓库解析工作流

> 用户只给了 X/Twitter 推文链接（含 GitHub 产品介绍），主线程直接写卡，不需要等 agent1 调研。

## 典型场景

推文正文包含产品描述 + GitHub 短链接（如 `t.co/xxx`），但：
- 不知道 repo 在哪个 owner 下
- GitHub API 直接查 `owner/repo` 返回 404
- 推文账号可能不是仓库 owner（如博主转发）

## 解析步骤

### Step 1：从推文 HTML 提取产品描述（无需登录）

```bash
curl -sL "https://x.com/<user>/status/<id>" \
  -H "User-Agent: Mozilla/5.0" | python3 -c "
import sys, re, html as htmlmod
raw = sys.stdin.read()
# og:description 通常包含完整推文正文
m = re.search(r'property=\"og:description\"[^>]+content=\"([^\"]+)\"', raw)
if m:
    print(htmlmod.unescape(m.group(1)))
# articleBody 是备用
m2 = re.search(r'\"articleBody\":\"((?:[^\"\\\\]|\\\\.)*)\"', raw)
if m2:
    print(htmlmod.unescape(m2.group(1)))
"
```

### Step 2：展开短链接

```bash
curl -sI "https://t.co/xxx" -L --max-redirs 3 2>/dev/null | grep -i "^location:" | tail -1
```

### Step 3：从 URL 推断 repo 名

常见模式：
- `github.com/<owner>/<repo>` → 直接查
- 短链接指向 `github.com/<repo>`（无 owner）→ 用 GitHub Search API 猜

### Step 4：GitHub Search API 反推 owner/repo

当直接路径 404 时，用 Search API：
```bash
# 按 repo 名搜索（适用于只知道 repo 名不知道 owner 的情况）
curl -s "https://api.github.com/search/repositories?q=<REPO>+in:name" | python3 -c "
import sys,json
r=json.load(sys.stdin)
for item in r.get('items',[])[:5]:
    print(item['full_name'], 'Stars:', item['stargazers_count'])
"
```

### Step 5：获取仓库数据

```bash
curl -s "https://api.github.com/repos/<owner>/<repo>" | python3 -c "
import sys,json
r=json.load(sys.stdin)
print('Stars:', r['stargazers_count'])
print('Forks:', r['forks_count'])
print('Desc:', r['description'])
print('License:', r.get('license',{}).get('spdx_id'))
print('Topics:', r.get('topics',[]))
print('Language:', r.get('language'))
"
```

## 实录案例

| 步骤 | BrowserSkill 案例 |
|------|-------------------|
| 推文账号 | `@geekbb`（腾讯工程师，不是 org owner） |
| 推文正文 | og:description 完整提取："腾讯开源的本地桥接工具……" |
| 短链接 | `t.co/rXNaFoxW8y` → 展开失败（内部地址） |
| 推断 repo | `BrowserSkill`（推文标题提到） |
| Search API | `q=BrowserSkill+in:name` → 找到 `Tencent/BrowserSkill`（136 stars） |

**关键教训**：推文账号 `geekbb` ≠ repo owner。必须用 Search API 反推真实 owner。

## 依赖工具

- `curl` + Python3（标准库，无需额外依赖）
- `og:description` / `articleBody` 均从页面 HTML 提取，**无需登录 X 账号**
