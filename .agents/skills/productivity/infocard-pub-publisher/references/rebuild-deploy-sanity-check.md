# Rebuild + Deploy Sanity Check（重建发布验伪）

## 核心教训：文件大小验伪

每次 rebuild 后推送到 Pages 前，必须用公网下载的文件大小与本地 HTML 大小做对比。

**问题场景**：重建了一张白紫风格的 SkillOpt（52,591 字节），push 后 Pages 实际推送了旧版红黑瑞士风（41,940 字节）。两者内容差异巨大，但 HTTP 200 正常返回，导致误以为发布成功。

**正确流程**：
```
1. write_file 重建 HTML（如 52591 字节）
2. npm run build && npm run verify
3. git add <specific-files> && git commit
4. git push origin HEAD:main
5. 等待 ~90 秒 Pages 部署
6. 公网下载新推送的 HTML → 对比字节数
   curl https://ccwq.github.io/infocard-pub/docs/<slug>.html | wc -c
   本地 wc -c <slug>.html
   两者必须完全一致
7. 公网关键字验证（检查新内容特征词是否存在）
8. 如字节数不匹配 → 立即排查
```

**字节数不匹配常见原因**：
- `fix-meta-date.js --force` 更新了其他 meta.yaml 触发全量 re-generate
- 本地文件在 git 操作中被旧版本覆盖（如 `git checkout` 或意外的 `cp`）
- 本地文件在 write 后被 Hermes 的文件保护机制部分回退

## Git Surgical Staging（精控暂存）

**问题场景**：`git reset HEAD` 后用 `git add -A` 暂存所有修改，结果把 210 个无关 meta.yaml 变更也一起提交了。

**正确做法**：
```bash
# 方案 A（推荐）：只暂存已知文件
git add docs/<slug>.html docs/<slug>.html.meta.yaml docs/<slug>.report.md _index.yaml index.html
git commit -m "feat: <message>"

# 方案 B：reset 后用 -u 只更新已跟踪文件
git reset HEAD
git add -u   # 只暂存已跟踪的修改文件，不含 untracked
# 再手动 git add docs/<slug>.html 补充新文件
```

**禁止做法**：`git add -A` 或 `git add .` 在多卡重建场景下使用，容易带入无关变更。

## fix-meta-date --force 的影响范围

`--force` 会让 `fix-meta-date.js --write --date-source last --force` 扫描全部 270 个 meta.yaml 并按 git mtime 回填 date，覆盖已有日期。

**何时可用**：仅在全量日期校正时（如日期普遍缺失/错误）。
**何时禁用**：单卡重建只想更新 `updated` 时间时。

**正确单卡更新方式**：
```bash
# 方式 1：直接修改 meta.yaml，手动写 updated 字段
# 方式 2：运行 npm run build（默认 --force=false，不会批量覆盖已有日期）
# 方式 3：只 add/commit 目标文件，不触发 fix-meta-date 扫描
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "fix: rebuild <slug>"
```

## X/Twitter 内容抓取：CDP 兜底

**问题场景**：`hermes-agent.nousresearch.com` 和 `x.com/status/` 均被 TLS/网络阻断，curl 全部失败。

**CDP 兜底方案**：
```bash
# 1. browser_navigate 失败后，改用 CDP tab 导航
browser_cdp method=Target.getTargets   # 找到活跃 tab
browser_cdp method=Page.navigate url=<target> target_id=<tabId>
browser_snapshot  # 获取完整页面内容
```

**验证**：browser_snapshot 返回 300+ 行内容 = 成功；1 行 = 内容被 JS 加载阻塞，需等待。

## Diff-Size 模板代码

```python
import urllib.request

LOCAL = '/home/ccwq/.../docs/<slug>.html'
REMOTE = 'https://ccwq.github.io/infocard-pub/docs/<slug>.html'
LOCAL_SIZE = Path(LOCAL).stat().st_size
REMOTE_SIZE = len(urllib.request.urlopen(
    urllib.request.Request(REMOTE, headers={'User-Agent':'Hermes'}), timeout=20
).read())
if LOCAL_SIZE != REMOTE_SIZE:
    print(f'SIZE MISMATCH: local={LOCAL_SIZE} remote={REMOTE_SIZE}')
    # 立即排查，不继续
else:
    print(f'OK: {REMOTE_SIZE} bytes')
```
