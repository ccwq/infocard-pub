# Infocard HTTP 验收命令模板

## 标准验收流程

```bash
# 1. 轮询直到 200 OK（最多 18 次 × 10s = 3 分钟）
for i in $(seq 1 18); do
  status=$(curl -sI "https://ccwq.github.io/infocard-pub/docs/[slug].html" | head -1)
  echo "[$i] $(TZ=Asia/Shanghai date +%H:%M:%S) $status"
  if echo "$status" | grep -q "200"; then
    # 2. 核验关键词
    curl -s "https://ccwq.github.io/infocard-pub/docs/[slug].html" | \
      grep -o 'KEYWORD1\|KEYWORD2\|KEYWORD3' | sort -u
    # 3. 核验 _index.yaml 包含该卡
    curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | \
      python3 -c "import sys,yaml; d=yaml.safe_load(sys.stdin); print('count:', d.get('_count')); [print(c.get('slug')) for c in d.get('cards',[]) if '[slug]' in str(c)]"
    break
  fi
  sleep 10
done
```

## 图片资源验收

```bash
# 单图验收
curl -sI "https://ccwq.github.io/infocard-pub/assets/img/[dir]/[file]" | head -1
# 批量验收
for img in img1 img2 img3; do
  status=$(curl -sI "https://ccwq.github.io/infocard-pub/assets/img/[dir]/$img.png" | head -1)
  echo "$img: $status"
done
```

## CI 状态核验

```bash
# 检查 GitHub Actions 状态（用于 CI 卡住时诊断）
curl -sH "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/ccwq/infocard-pub/actions/runs?per_page=3" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); [print(r['name'], r['status'], r['conclusion'], r['created_at'][:16]) for r in data.get('workflow_runs',[])]"
```

## 常见问题处理

| 症状 | 原因 | 处理 |
|------|------|------|
| push 后 12 次轮询仍 404 | Pages 部署延迟超过 2 分钟 | 继续轮询到 18 次，超时报告失败 |
| 404 后突然 200 | Pages 刚部署完 | 正常，继续验收 |
| img 404，HTML 200 | 图片未 push 到仓库 | 检查 `assets/img/` 目录是否 git add |
| 关键词缺失 | HTML 拼写错误或缓存问题 | 重新 curl 核验 |
| _index.yaml 无该卡 | build 写入失败 | 本地重建 build + commit |
