# 三阶段过程文件发布检查清单

适用场景：用户要求“agent1 只调研 -> 输出 `/tmp/infocard-process-YYYYMMDD-HHmm.md` -> agent2 只写卡 -> 主线程 build/verify/push/验收/wiki”的流程。

## 发布前核验
1. 先确认 agent1 过程文件真实存在，路径为 `/tmp/infocard-process-*.md`。
2. `read_file` 读取过程文件，确认包含：主体、用户原始内容、调查内容（含来源）、事实核验结果（含存疑标注）、用户附加信息。
3. agent2 只允许基于过程文件写卡，不允许补新的外部调研。
4. 写卡完成后，先在 active repository root 下核对文件是否落在 `docs/`。
5. 如果发现落在镜像目录，必须先迁回 active repository root，再 build。

## meta.yaml 防呆
- 必须同时存在 `date` 和 `updated`
- 必须使用 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"` 的实际时间
- `category` 必须是顶层字段，不放进 taxonomy
- `desc` 只写单行，避免多行段落导致解析问题

## 主线程验收顺序
1. `npm run build`
2. verify 失败则立即中止，不跳过
3. `git add/commit/push`
4. Pages 轮询（失败重试 3 次：10s / 30s / 60s）
5. HTTP 200 验收
6. wiki index 最终同步

## 常见失败模式
- agent2 跑题：主体写错成相邻项目名
- 文件路径漂移：写到镜像目录或错误仓库
- meta 缺 `updated`
- `git push` 成功但 Pages 还没就绪，导致首次 HTTP 404
- wiki 草稿存在但 index 未同步
