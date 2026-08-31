# 子智能体发布流程规范

## 子智能体超时 Rescue 流程（2026-07-09 最终版）

**核心规律（2026-07-09 验证，6 次全中）**：
- 子智能体 `wc` 能正常完成（几百行 HTML 秒出）
- **超时几乎全部卡死在最后几步**：npm build / wiki 同步 / 截图验收
- **HTML 写盘但未 push** → `curl` 公网路径 → HTTP 404
- **meta.yaml 时间戳几乎必然错误**（子智能体派发时间 ≠ git commit 时间）
- `ls docs/xxx.html` 存在（>100 行）→ **不需要重写 HTML**

**识别标准**：
- `ls docs/xxx.html` 存在（>100 行）→ 不需要重写 HTML
- `curl https://.../xxx.html` → 404 → 只需要 push
- `git status -sb` 显示 `M` 或 `??` → 文件已写盘，主线程只需 build + push
- HTTP 200 → 已在 Pages，跳过

**时间戳源：git commit 时间才是准的，不是子智能体 prompt 里的 `date` 命令输出**

---

### 标准 Rescue 步骤（文件已存在时）

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
# 1. 检查文件 + git 状态
wc -l docs/<slug>.html
git status -sb

# 2. 获取实际 git commit 时间（用于修复 meta 时间戳）
git log --format="%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- docs/<slug>.html

# 3. 批量修复 meta 时间戳（Python，一行命令处理所有 20260709 卡）
python3 - <<'PY'
from pathlib import Path
import subprocess
repo = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip())
for meta in sorted((repo/'docs').glob('20260709-*.html.meta.yaml')):
    html = meta.name.replace('.meta.yaml','')
    ts = subprocess.check_output(['git','-C',str(repo),'log',
        '--format=%ad','--date=format:%Y-%m-%d %H:%M:%S','-1','--',
        str(Path('docs')/html)], text=True).strip()
    if not ts:
        continue
    txt = meta.read_text()
    new = []
    for line in txt.splitlines():
        if line.startswith('date:') or line.startswith('updated:'):
            new.append(f'{line.split(":")[0].strip()}: "{ts}"')
        else:
            new.append(line)
    meta.write_text('\n'.join(new) + '\n')
    print(f'{meta.name} => {ts}')
PY

# 4. build
npm run build

# 5. commit + push
git add docs/20260709-*.* _index.yaml index.html
git commit -m "fix: align meta timestamps with actual git commit times"
git push

# 6. 等待 CI + 验收（HTTP 200）
sleep 55 && curl -s -o /dev/null -w "HTTP %{http_code}" https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

### 标准 Rescue 步骤（文件不存在但 API 调用 ≥10 时）

> 说明：子智能体可能在调研阶段已收集足够信息但未写盘，此时需要主线程接管写卡。

```bash
# 1. 读取子智能体收集的调研结论
cat ~/hehome/hermes-data/cache/delegation/subagent-summary-*.txt

# 2. 主线程直接写卡（不用再派子智能体）
# write_file HTML + meta.yaml → build → commit → push → 验收
```

### CI `git diff --exit-code` 失败处理

**根因**：`npm run build` 每次都无条件重写 `_index.yaml`，导致 `git diff` 必然非零。

**判断**：
```bash
curl -s -o /dev/null -w "%{http_code}" https://ccwq.github.io/infocard-pub/docs/<slug>.html
# HTTP 200 → Pages 已上线，忽略 CI failure
# HTTP 404 → CI deploy 失败，需要排查
```

### Meta 必填字段防呆

发布前的 meta.yaml 必须包含：
- `slug` / `path` / `date` / `updated` / `category` / `title` / `desc` / `tags`
- `desc` 必须是**单行纯文本**，不写多行段落
- `category` 在**顶层**（不是在 `taxonomy` 里）
- `title` 在**顶层**（不是在 `taxonomy` 里）
- 时间戳用 `YYYY-MM-DD HH:MM:SS` 格式，双引号包裹
- 新卡写卡后，先 `read_file` 看 meta 是否同时有 `date` 和 `updated`，再进入 build；缺 `updated` 直接修，不要让 verify 兜底拦截

**禁止**：`YYYY-MM-DD`、`YYYY-MM-DDTHH:mm:ss+08:00`、`Z` 或裸日期。

### 三阶段写卡的高频失败模式（2026-07-09 复盘）
- **agent2 跑题**：把 Claudian 写成 Claude Code CLI，或把用户主体替换成相邻工具名。解决：agent2 prompt 里必须重复主体全名、URL、禁写对象，并在完成后先核验标题/slug 再接管。
- **路径镜像漂移**：写到历史镜像目录这类路径，主仓库里看不到。解决：主线程接手前先 `find` / `git status` 确认文件是否落在 active repository root。
- **过程文件工作流**：agent1 必须输出 `/tmp/infocard-process-YYYYMMDD-HHmm.md`；agent2 只读该过程文件，不允许再调研新的事实。否则易把用户原文与外部搜索混成一体，导致卡面表述失真。
- **wiki index 先读后写**：更新 `wiki/index.md` 前必须先重新读取目标段落，避免并发/兄弟进程改动被覆盖。

### Dist ENOTEMPTY Build Bug

```bash
npm run build
# 历史现场值（不可复制执行）：Error: ENOTEMPTY, Directory not empty: /home/ccwq/infocard-pub/dist
rm -rf "$REPO_ROOT/dist"
npm run build  # 重试
```

### Wiki Push git index.lock

```bash
rm -f /path/to/wiki/.git/index.lock
git push
```

### Python Playwright 截图（Node playwright 不稳定，用 Python 版）

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto(url, wait_until='networkidle')
    page.screenshot(path=path, full_page=True)
    browser.close()
```

---

## 决策树（重写版，2026-07-09）

```
子智能体超时报告
    │
    ├─ HTTP 200 已有 Pages → 跳过
    │
    ├─ 文件不存在 + API 调用 <10 → 评估：主线程重写 or 重新派
    │
    └─ 文件存在（>100 行）→ 主线程接管
            │
            ├─ meta 时间戳与 git commit 差 >1h → 批量修复
            ├─ build ENOTEMPTY → 先 rm -rf dist/
            ├─ build 报 missing category/title → 补字段到顶层
            ├─ git push 成功
            └─ sleep 55 → curl HTTP 200 → Wiki 同步
```
