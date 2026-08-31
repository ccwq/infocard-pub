# Pages 路径与索引数陷阱（2026-07-09 实录）

## GitHub Pages 路径前缀规则

`path: docs/xxx.html` → HTTP URL = `/docs/xxx.html`（不是根目录 `/xxx.html`）

验收时必须用 `/docs/` 前缀，否则得到 GitHub Pages 404 壳（`<title>Page not found · GitHub Pages</title>`）。

```bash
# 正确
curl -sI "https://ccwq.github.io/infocard-pub/docs/xxx.html" | head -1

# 错误（404）
curl -sI "https://ccwq.github.io/infocard-pub/xxx.html" | head -1
```

## `_index.yaml` 卡片数陷阱

**症状**：build 报告成功（`[build-site] wrote _index.yaml and injected index.html (N cards)`），但新卡不在索引中。

**根因**：
- `npm run build` 默认 timeout=60s（terminal 工具默认值）
- 510 个 meta.yaml 文件处理时间 > 60s → 命令超时
- 超时后 `_index.yaml` 可能停留在旧版本（500 cards），Node 进程实际已完成写入但未 flush 到磁盘
- `npm run verify` 也能通过（因为它只检查本地 `_index.yaml` 内容，不触发重新 build）

**表象**：
- build 输出显示正确卡片数（如 510 cards）
- 但 `_index.yaml` 实际只有 500 行（或 `_count: 500`）
- `grep` 搜索 slug 返回 0 结果
- 公网 HTTP 200 但首页索引无新卡链接

**验证命令**：
```bash
python3 -c "
import yaml
with open('_index.yaml') as f:
    d = yaml.safe_load(f)
cards = d.get('cards', [])
print(f'_count: {d.get(\"_count\")}, YAML cards: {len(cards)}')
found = [c for c in cards if isinstance(c,dict) and c.get('slug')=='TARGET-SLUG']
print(f'Found: {len(found)}')
"
```

**修复**（timeout 后立即执行）：
```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
node --eval "
const { buildIndexData, serializeIndexYaml } = require('./scripts/index-build-lib');
const fs = require('fs');
const result = buildIndexData();
fs.writeFileSync('_index.yaml', serializeIndexYaml(result), 'utf8');
console.log('_count:', result._count, 'cards:', result.cards.length);
"
# 然后 git add _index.yaml index.html && git commit && git push
```

**预防**：
- `npm run build` 必须显式设 timeout=180，不依赖工具默认值
- build 后必须执行核验命令确认卡片数

## 已知案例

| 日期 | 卡 | 症状 | 解法 |
|------|-----|------|------|
| 2026-07-09 | microsoft-intelligent-terminal | build 超时（60s），_index.yaml 停于 500 cards | Node 直接覆写 _index.yaml 后 commit |
