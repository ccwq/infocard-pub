# Subagent timeout batch recovery + meta gate（2026-07-09）

## 场景
同一批 GitHub 信息卡任务中，多个子智能体在 **写出 HTML / meta 之后超时**，导致：
- 本地 `docs/20260709-*.html` 已存在
- 公网 `curl` 仍是 404（尚未 push）
- 有的卡只有 HTML，没有 `.meta.yaml`
- 有的 meta 时间戳是子智能体假时间 / dispatch 时间
- 有的 meta 缺顶层 `category`，`npm run build` 直接失败

本次涉及：
- `20260709-codebase-to-course`
- `20260709-architecture-diagram-generator`
- `20260709-opendataloader-pdf`
- `20260709-ai-coding-cli-compare`
- `20260709-aisa-one-api-pricing`
- 以及整批 20260709 卡的时间戳回填

## 主线程接手决策树

```bash
ls docs/<slug>.html
curl -s -o /dev/null -w "%{http_code}" https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

- **文件不存在 + HTTP 404** → 才考虑重派或重写
- **文件存在 + HTTP 404** → 不重派，主线程直接接手发布
- **文件存在 + HTTP 200** → 已上线，只需核验索引 / wiki / 时间戳

## 接手步骤

1. **检查 HTML 是否完整**
   - `wc -l docs/<slug>.html`
   - `head -5` / `tail -5` 看是否是完整 HTML 壳
2. **检查 meta 是否存在**
   - 不存在：主线程补写 `.meta.yaml`
   - 存在：检查 `date` / `updated` / `category` / `title` / `desc`
3. **时间戳修正**
   - 子智能体写出来的 `date` / `updated` 不能直接信，尤其出现 `10:30:00`、`14:22:00` 这类明显晚于真实提交时间的值时
   - 若卡已提交过，统一用：
     ```bash
     git log --format="%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- docs/<slug>.html
     ```
   - 若卡尚未提交，只能先用主线程当前 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"`，发布后如需严格对齐，再按 git time 回填
4. **meta 顶层字段门禁**
   - 最少必须有：`slug` / `path` / `date` / `updated` / `category` / `title` / `desc`
   - `category` 必须是**顶层字段**，放进 `taxonomy` 不算，build 会报：`missing fields category`
5. **build / commit / push**
   - `npm run build`
   - 若报 `ENOTEMPTY dist`，先：`rm -rf dist && npm run build`
   - `git add docs/<slug>.* _index.yaml index.html`
   - `git commit && git push`
6. **验收**
   - `curl` 目标页面 200
   - `_index.yaml` / 首页条目存在
   - 需要时补 wiki

## 本次踩坑结论

### 1. 子智能体 timeout ≠ 没产出
最常见真实状态是：**HTML 已写好，超时卡在 build / push / wiki / 截图**。不要因为 timeout 就重做内容。

### 2. meta 从零补写时最容易漏 `category`
`title/desc/date/updated` 很容易想起来，但 `category` 是最容易漏掉、且 build 会硬挡住的顶层必填字段。

### 3. 批量修时间戳时，应该统一按 git commit time 回填
对于已经完成提交的一批卡，最稳妥的修法不是人工猜，而是遍历 `docs/20260709-*.html.meta.yaml`，用对应 HTML 的 `git log -1` 时间覆盖 `date/updated`，再统一 build / push。

### 4. 子智能体常在“最后 5%”超时
实践上，子智能体擅长：
- 调研
- 写 HTML
- 写 meta

不稳定点集中在：
- build
- push
- 公网验收
- wiki 同步

因此发布链路更安全的默认分工仍然是：**子智能体调研+写卡，主线程接手 build/commit/push/验收**。
