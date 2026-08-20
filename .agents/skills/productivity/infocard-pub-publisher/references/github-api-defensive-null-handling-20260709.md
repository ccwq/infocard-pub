# GitHub API JSON: Defensive Null Handling (2026-07-09 实测)

## 问题

GitHub API 返回的 JSON 中，某些顶级字段为 `null`（如 `license`、`topics`），Python 3 中 `None.get()` 会抛出 `AttributeError`。

## 错误复现

```python
d = json.load(sys.stdin)
d.get('license', {}).get('spdx_id')  # AttributeError: 'NoneType' object has no attribute 'get'
```

原因：`d.get('license')` 返回 `None`，`None.get()` → crash。

## 修复模板

```python
import sys, json

d = json.load(sys.stdin)

def g(key, default=None):
    v = d.get(key)
    return default if v is None else v

# 使用 g() 包裹所有可能为 null 的字段
print(g('stargazers_count'))                           # int or None
print(g('license', {}).get('spdx_id'))                # str or None → 先 g 再 .get
print(g('topics', []))                                 # list or None
```

## 更简洁的单行写法

```python
# 对可能为 null 的字典字段：
(d or {}).get('spdx_id')
# 等价于：
next(filter(None, [d])).get('spdx_id')  # 啰嗦，不推荐

# 推荐：
def g(k): return (d.get(k) or {})
g('license').get('spdx_id')
```

## 快速修复单行

```bash
# 临时绕过（用于调试）：
curl -s "https://api.github.com/repos/owner/repo" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(d.get('stargazers_count'))
print((d.get('license') or {}).get('spdx_id'))
print(d.get('topics') or [])
"
```

## 受影响字段（GitHub REST API）

以下字段在私有仓库或未设置时常为 `null`：
- `license`
- `topics`
- `homepage`
- `description`（私有仓库）
- `language`（纯空仓库）

## 实测案例

| 仓库 | 字段 | 问题 |
|------|------|------|
| `stfurkan/aidekin` | `topics` | `None` |
| `harshaneel/humanize` | `language`, `topics` | `None` |
| `Lordog/dive-into-llms` | `license`, `topics` | `None` |

处理方式：全程用 `g()` defensive wrapper。
