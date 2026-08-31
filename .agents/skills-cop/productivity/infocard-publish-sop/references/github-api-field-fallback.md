# GitHub API 字段兼容性陷阱

## forks_count vs fork_count

GitHub REST API v3 在不同时间点对 fork 计数字段使用了两个不同的 key：

| 字段 | 状态 | 示例 |
|------|------|------|
| `fork_count` | 旧版，可能已废弃 | 部分早期缓存响应 |
| `forks_count` | 当前标准字段 | `https://api.github.com/repos/{owner}/{repo}` |

### 错误代码

```python
# ❌ 直接下标访问，旧版 API 响应中 fork_count 字段不存在
d["fork_count"]  # KeyError

# ✅ 安全访问，设置默认值兜底
d.get("forks_count", "?")  # 未知时返回 "?"
```

### 实际触发场景

本次会话中 `huggingface/tau` API 响应含 `forks_count`，但脚本中用了 `d["fork_count"]` 导致 `KeyError`，采集链中断。

### 防御规则

所有 GitHub API 响应解析统一使用 `.get()` + 默认值，**禁止**直接下标访问可能存在版本差异的字段。

```python
d.get("forks_count", "?")   # forks
d.get("stargazers_count", 0)  # stars — 这个字段名稳定，但兜底也是好习惯
d.get("license", {}).get("spdx_id", "?")  # license 是嵌套对象
```
