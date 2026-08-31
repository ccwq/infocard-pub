# 官方门户渲染 DOM 抽取 + `_index.yaml` rebase 恢复

适用场景：
- 政务/教育局/政府门户页面，`requests`/直接文本搜索只能拿到壳 HTML、脚本或不稳定摘要，但浏览器渲染后能看到正文、表格、附件链接。
- `git pull --rebase` 期间，`_index.yaml` 与本地新增卡片冲突，需要恢复发布链路。

## 经验要点

### 1) 官方门户优先看渲染后的 DOM
- 先开浏览器看页面是否已渲染出正文，不要只盯原始 HTML。
- 当 raw HTML 里搜不到关键词时，用 `browser_snapshot` / `browser_console` 读渲染后的正文与表格。
- 很多政务站点的关键内容是客户端/模板渲染出来的，浏览器里可见，但原始抓取不适合直接摘要。

### 2) 信息卡发布时，先把正文事实核准，再做页面
- 先从浏览器 DOM 里抽取标题、考试对象、考试结构、项目表，再写进卡片。
- 如果公开摘要与官方页面标题不完全一致，优先以官方页面当前 DOM 可见标题与结构为准，再在卡片中描述“公开可核到的内容”。

### 3) `_index.yaml` rebase 冲突恢复
- 不手工改冲突标记。
- 运行 `python3 scripts/rebuild_index.py && python3 scripts/verify_index.py`。
- `git add _index.yaml`。
- `GIT_EDITOR=true git rebase --continue`。
- 完成后再 `git push`。

### 4) 发布后验收
- 详情页 200。
- `/_index.yaml` 200。
- 首页搜索能命中标题。
- `git status` 干净。

## 这次会话留下的可复用信号

- 西安教育局方案页在浏览器渲染后可直接看到正文与表格，足够支撑信息卡结构化整理。
- 直接请求或关键词搜索没拿到完整正文时，不要误判为“没有内容”；先检查浏览器渲染 DOM。
- `git pull --rebase` 若把 `_index.yaml` 拉出冲突，正确做法仍是：重建索引 -> 继续 rebase -> 再 push。