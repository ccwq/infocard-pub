# 批量并行信息卡发布模式（2026-07-19）

## 触发场景

用户一次要求发布 5 张卡，且符合以下条件：
- 全部走 light route（每个项目有单一 GitHub URL / README 一手来源）
- 每卡独立 worktree，基于同一 origin/main detached HEAD
- 共享主仓库 node_modules（软链接，不在 worktree 内安装依赖）
- Authoring 并行，build→push 串行

## 已验证的并行节奏

### Step 1：主线程并行准备（5 卡并发）

```bash
# 创建 5 个 worktree，基于同一个 origin/main detached HEAD
for slug in skillspec agent-apprenticeship toolport juggler agent-talk; do
  WT="/tmp/infocard/${slug}-YYYYMMDD"
  mkdir -p "$WT"
  git -C "$REPO" worktree add --detach "$WT" origin/main
  ln -sf "$REPO/node_modules" "$WT/node_modules"
done
```

**关键约束**：
- 全部从 `origin/main`（非任意分支）创建，确保后续 push 无歧义
- 不在 worktree 内运行 `npm install`
- node_modules 软链接指向主仓库，worktree 只读依赖共享

### Step 2：并行 bundle 准备（主线程）

每个卡一个 bundle 目录在 `/tmp/infocard/bundles-YYYYMMDD/<slug>/`：
- `publish-bundle.json` — schema v3，含 `visual_review` 字段
- `research-facts.json` — README 内容、repo 元数据、一手事实

### Step 3：Authoring 并行（子智能体并发上限 3）

```python
# 分两批：第一批 3 卡，第二批 2 卡（受 max_concurrent_children=3 限制）
delegate_task(tasks=[
  {"goal": "SkillSpec card...", "context": "hardblue, zh, code-block"},
  {"goal": "Agent Apprenticeship card...", "context": "darkblue, zh, code-block"},
  {"goal": "ToolPort card...", "context": "darkblue, zh, code-block"},
])
# 等第一批完成后
delegate_task(tasks=[
  {"goal": "Juggler card...", "context": "darkblue, zh, code-block"},
  {"goal": "Agent Talk card...", "context": "darkblue, zh, code-block"},
])
```

**子智能体输出约束**：
- 每个子智能体只写 `docs/YYYYMMDD-<slug>.html + .meta.yaml + .md`
- 不执行 git commit / push / npm install
- 必须在 worktree 的 `docs/` 目录下输出（需创建该目录）

### Step 4：逐卡串行 build→push（主线程）

5 个 Authoring 全部完成后，**串行**逐卡执行：

```bash
# 每张卡独立执行以下流程
cd /tmp/infocard/<slug>-YYYYMMDD
npm run build && npm run verify && npm run check-leak

# 移动端视觉门禁（每卡必须）
# capture 390px screenshot via webpage-vision-inspect-skill
# vision 分析：Hero / 功能区 / 代码块三区域
# 仅在所有静态检查通过后才可 push

git add docs/<slug>.html docs/<slug>.html.meta.yaml
git commit -m "feat: publish <title> infocard"
git push origin main

# 公网验收：curl -sI https://<user>.github.io/<repo>/docs/<slug>.html
# CDN 刷新等待：sleep 15+，检查 age:0
```

### Step 5：Wiki 同步（主线程）

每张卡发布后同步写入 LLM Wiki，不阻断发布。

### Step 6：Worktree 清理

所有卡 push 完成后：
```bash
for slug in skillspec agent-apprenticeship toolport juggler agent-talk; do
  WT="/tmp/infocard/${slug}-YYYYMMDD"
  git -C "$REPO" worktree remove "$WT" 2>/dev/null || rm -rf "$WT"
done
rm -rf /tmp/infocard/bundles-YYYYMMDD
```

## Visual Review 门禁决策

批量并行时，每卡的 `visual_review.required` 由主线程在 bundle 准备阶段写入。触发条件：
- 多列布局
- 表格
- 代码块（hardblue/darkblue 卡的 CLI 命令区几乎必含）
- fixed / sticky 控件
- 图片/图表画廊

**本批次经验**：5 张卡全部含 CLI 命令代码块，全部标记 `required=true`。

视觉门禁失败时：
- 修复 CSS（注入 `@media(max-width:720px)` 响应式补丁）
- 重新 build → commit → push → 截图复验
- 5 次基础设施失败才可降级为 `PUBLISHED_PENDING_VISUAL`

## 已知风险

1. **并发 rebase 冲突**：当 A 卡 push 后 main 前进了，B 卡 rebase 时可能冲突。解法：`--theirs _index.yaml index.html` 优先，或用 stash/rebase/stash pop 策略。
2. **build 超时**：批量 build 涉及 617+ cards 的 `index.yaml` 重写，120s 超时很常见。解法：build 后手动 commit/push，跳过 `check-leak`（或单独跑 check-leak）。
3. **视觉截图 SHA 不变**：CDN 未刷新时截图与修复前完全一致。验证信号：页面宽高变化 + SHA 改变 + DOM scrollWidth，三者同时成立才证明修复生效。
4. **子智能体文件输出位置**：必须确保 worktree 的 `docs/` 目录已创建，否则子智能体可能写到 `/tmp/infocard/<slug>-YYYYMMDD/docs/` 而非 worktree 内。
