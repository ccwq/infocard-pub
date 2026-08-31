# GitHub / Twitter URL 发现与抓取技巧

## 1. GitHub URL 发现（用户给截断 URL 时）

用户提供了 `github.com/pewdiepie-arch/odysseus` → 404。用以下顺序尝试：

### 1a. GitHub Search API（推荐）
```bash
# 按描述搜索
curl -s "https://api.github.com/search/repositories?q=odysseus+self-hosted+ai+workstation&per_page=5" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('items',[]):
    print(r['full_name'], '| stars:', r['stargazers_count'])
"
```

### 1b. 猜测 org 名（删减/变体）
```bash
for org in pewdiepie-arch pewdiepie pewdiepie-archdaemon; do
  code=$(curl -sL -o /dev/null -w "%{http_code}" "https://github.com/$org")
  echo "$org: $code"
done
# 200 = org 存在，尝试找子路径
```

### 1c. 尝试 org repos 页面（需 JS 渲染时）
```bash
# 先确认是 org 还是 user
curl -s "https://api.github.com/orgs/pewdiepie-arch/repos?per_page=100"  # 404 → 不是 org
curl -s "https://api.github.com/users/pewdiepie-arch/repos?per_page=100"  # 试试 user
```

### 1d. 抓 README 补充数据
```bash
curl -sL "https://raw.githubusercontent.com/{org}/{repo}/main/README.md" | head -120
curl -s "https://api.github.com/repos/{org}/{repo}" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('stars:', d['stargazers_count'], 'forks:', d['forks_count'])
print('topics:', d.get('topics',[]))
print('description:', d.get('description'))
"
```

### 已知成功路径（session 2026-07-12）
- `pewdiepie-arch/odysseus` → 404
- `pewdiepie-archdaemon/odysseus` → **200**（Stars 82,393 / Forks 10,842 / Python / AGPL-3.0）

---

## 2. X / Twitter 推文抓取

### 2a. fxtwitter.com 镜像（最可靠）
```bash
# 直接用推文 ID
curl -sL "https://fxtwitter.com/i/status/{tweet_id}" -H "User-Agent: Mozilla/5.0" | \
  python3 -c "
import sys, re
html = sys.stdin.read()
# 从 ld+json 中提取 articleBody（完整推文）
matches = re.findall(r'\"articleBody\":\"(.*?)\",\"author\"', html, re.DOTALL)
for m in matches:
    print(m.replace('\\\\n','\n').replace('\\n','\n'))
"
```

### 2b. 从 og:image 抓推文图片
```bash
# 获取 og:image URL
curl -sL "https://x.com/i/status/{tweet_id}" -H "User-Agent: Mozilla/5.0" | \
  grep -oP 'property=\"og:image\"[^>]+content=\"\K[^\"]+'

# 下载图片
curl -sL "https://pbs.twimg.com/media/xxx.jpg:large" -o /tmp/tweet.jpg

# 用 vision_analyze 提取图片内文字
```

**已知陷阱**：OG description 在长推文中会被截断（只显示前 ~180 字符）。完整内容要从 ld+json `articleBody` 字段获取。

### 2c. Twitter card validator（备选）
```bash
curl -sL "https://cards-dev.twitter.com/validator" -o /dev/null -w "%{http_code}"
```

---

## 3. GitHub API 常见 404 原因

| 原因 | 表现 | 解法 |
|------|------|------|
| Rate limit | `{"message": "Not Found"}` | 换 User-Agent / 等限速窗口 |
| Private repo | `{"message": "Not Found"}` | 无法访问，跳过 |
| 不存在 org | HTTP 200 但 API 404 | 试 user API |
| URL 截断 | HTTP 404 | 用 search API / 猜 org 名 |

---

## 4. 推文全文截断处理流程

当 OG description 只有部分内容时：
1. 抓 `og:image` → 下载 → vision 分析
2. 尝试 fxtwitter ld+json `articleBody`
3. 若仍不完整 → 询问用户补全剩余项目
4. 卡片的 `desc` 字段标注"部分确认 / 待补充"
