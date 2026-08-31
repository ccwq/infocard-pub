# README 提取与降级策略参考

## 快速抓取模式（无需认证）

```bash
# 方式1：raw.githubusercontent.com（推荐，最快）
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md" > /tmp/{slug}-readme.md

# 方式2：api.github.com/repos（可获取 stars/forks 等元数据，但有 60 req/hr 限流）
curl -s "https://api.github.com/repos/{owner}/{repo}" | python3 -c "..."

# 方式3：GitHub 页面 HTML（降级用，提取 stars 数）
curl -s "https://github.com/{owner}/{repo}" | grep -oP '[\d,]+ star[s]?'

# 方式4：git clone（获取完整仓库，含 assets/ 图片）
git clone --depth=1 https://github.com/{owner}/{repo} /tmp/{slug}-repo
```

## 降级决策树

```
GitHub API 调用
  ↓
限流响应？→ 是 → 立即切换 README raw URL，不重试
  ↓否
正常响应 → 解析 JSON
  ↓
null 字段？→ 用 g() 辅助函数防 NoneType
```

## Python 可靠解析模板

```python
import json

def g(k, default=None):
    v = d.get(k)
    return default if v is None else v

d = json.load(sys.stdin)
result = {
    'stars': g('stargazers_count'),
    'forks': g('forks_count'),
    'desc': g('description'),
    'license': (g('license') or {}).get('spdx_id') if g('license') else None,
    'lang': g('language'),
    'topics': g('topics'),
    'created': g('created_at'),
    'pushed': g('pushed_at'),
}
```

## 限流响应特征

```json
{"message": "API rate limit exceeded for 16.162.44.7. (But here's the good news: ..."}
```

检测到 `rate limit` 关键字立即切换方案，不等待超时。

## 本轮实测数据（2026-07-10）

| 仓库 | README 行数 | 提取耗时 | 降级原因 |
|------|------------|---------|---------|
| rowboatlabs/rowboat | 201 行 | <1s | GitHub API 限流 |
| dzcmemory-web/bazi-ziwei-skill | 184 行 | <1s | GitHub API 限流 |
| HKUSTDial/Supervisor-Skills | 204 行 | <1s | GitHub API 限流 |
| shlokkhemani/rabbithole | 全文 | <1s | 无需限流 |
| tt-a1i/archify | 全文 | <1s | 无需限流 |
| emilkowalski/skills/apple-design | 全文 | <1s | 无需限流 |
