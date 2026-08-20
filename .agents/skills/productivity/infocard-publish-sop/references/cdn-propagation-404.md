# CDN 传播延迟导致 Push 后 404 — 正常现象

## 问题现象

```bash
git push origin main  # 成功
curl https://ccwq.github.io/infocard-pub/docs/20260714-xxx.html  # 404
```

## 根因

GitHub Pages 部署有传播延迟，push 成功后 CDN 需要 10-30 秒才能在全球节点生效。

## 经验数据（2026-07-14）

| 卡片 | Push 到 200 |
|------|------------|
| CodeFlow | ~12s 后 404，~20s 后 200 |
| Clawk | ~10s 后 404，~25s 后 200 |
| SingGuard | ~12s 后 404，~20s 后 200 |
| Archify | ~12s 后 404，~20s 后 200 |

## 正确流程

```
git push origin main
sleep 10
curl -s -o /dev/null -w "HTTP: %{http_code}" https://...
if 404:
    sleep 20
    curl 再次检查
    # 注意：HTTP 200 但标题不对 ≠ 失败，是 CDN 传播了旧版本
    # 要确认拿到新版本，验证 <title> 标签内容
```

## 关键判断标准

- **HTTP 200** + **标题正确** = 验收通过
- **HTTP 404** + age:0 = CDN 正在传播中，不是文件不存在
- HEADERS 里 `age: 0` 说明 CDN 刚命中，还没缓存，是传播中信号

## 错误做法（不要这样做）

1. Push 后立刻 curl 收到 404 就判断"文件不存在"
2. 截图验收时用旧的截图（CDN 还在传旧版本）
3. 不验证 `<title>` 标签，只验证 HTTP 200

## 验证脚本

```bash
wait_for_cdn() {
  local url="$1"
  local name="$2"
  for i in 1 2 3; do
    sleep 10
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "$name: attempt $i → HTTP $code"
    if [ "$code" = "200" ]; then
      title=$(curl -s "$url" | grep -o '<title>[^<]*</title>')
      echo "Title: $title"
      return 0
    fi
  done
  return 1
}

wait_for_cdn "https://ccwq.github.io/infocard-pub/docs/20260714-xxx.html" "Card Name"
```
