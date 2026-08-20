# Pretty Mermaid 列表排序时间修正（2026-06-04）

## 场景
用户指出：信息卡已发布，但首页列表排序时间不对；随后明确要求“使用发布时间”。

目标卡：`docs/20260604-pretty-mermaid-skills.html`

## 结论
对于 `infocard-pub` 中的**重发布 / 明确要求按本次发布时间排序**的场景，不能只改 `_index.yaml` 或只看 `_modified_date`。
必须把 **sidecar** 中的：
- `date`
- `updated`

一起改成当前 **Asia/Shanghai** 墙钟时间，然后再：
1. `rebuild_index.py`
2. `verify_index.py`
3. commit / push
4. 验证公网 `/_index.yaml`

## 为什么
首页排序与展示不是单看一个字段：
- sidecar 的 `date` / `updated` 会进入 `_index.yaml`
- `rebuild_index.py` 会重新生成：
  - `_sort_ts`
  - `_modified_date`
- 用户看到的“列表时间”往往同时受这些字段影响

如果只修 `_index.yaml` 派生字段，不改 sidecar，下一次重建会回退。

## 正确修法
以当前发布时间为准，例如：`2026-06-04 21:51:46`

把 sidecar 从：

```yaml
date: "2026-06-04 21:45:08"
updated: "2026-06-04 21:45:08"
```

改成：

```yaml
date: "2026-06-04 21:51:46"
updated: "2026-06-04 21:51:46"
```

然后重建索引并核对这条 slug 在 `_index.yaml` 中变成：

```yaml
date: '2026-06-04 21:51:46'
updated: '2026-06-04 21:51:46'
_modified_date: '2026-06-04 21:51:46'
```

## 公网验收要点
必须验 `https://ccwq.github.io/infocard-pub/_index.yaml`，不要只看本地或 raw：
- slug 存在
- `date` 是发布时间
- `updated` 是发布时间
- `_modified_date` 也是同一时间

如果 Pages 仍显示旧值，轮询带时间戳的 `/_index.yaml?ts=...`，直到新值出现。

## 本次沉淀的 durable rule
当用户说：
- “列表排序的时间不对”
- “使用发布时间”
- “这次信息卡创建/重发行时间为准”

应视为：**把 sidecar 的 `date` 和 `updated` 都改为这次发布时间，再重建并验证公网索引。**
