# 批量发布与 wiki 路径修复

## 这次会话的可复用收获

### 批量发布 4 张卡
- 对同一批次的多张信息卡，先一次性采集各自事实，再统一建稿、统一 build/verify、统一 commit/push，避免每张卡都重复启动一轮发布链路。
- 视觉主题按内容类型分配，而不是强行统一：浏览器/调试类更适合 `darkblue`，开发基础设施和手册类更适合 `hardblue`，写作/技能/资料封面类更适合 `scrapbook`。
- 同批次页面都通过 390px 视觉检查后，再进入仓库提交和 wiki 同步，避免半批次发布。

### wiki 同步坑点
- wiki raw 文件名要严格跟随仓库约定：`raw/articles/YYYY-MM-DD-infocard-<slug>.md`。
- 处理 `index.md` 时，先读取当前文件再定位插入点；不要拿旧片段做 patch 锚点。
- 如果 patch 失败，不要先假设内容错了，优先刷新当前文件再重试。
- wiki 一次批量同步后，最后要确认 local HEAD 与 `git ls-remote` 一致。

### 适用场景
- 一次发布多张同主题或同类型信息卡
- 需要把 wiki raw / concept / index / log 一起收口的发布批次
- 大型索引页追加时，避免因为锚点过期导致 patch 失败
