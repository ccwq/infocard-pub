# 2026-06-03：删除重复卡 + 移动端修复 + 列表时间校对

## 场景
用户同时要求：
1. 彻底删除一个重复/旧 slug 的已发布卡片，包括从 list 页面消失；
2. 修复另一张已发布卡在移动端的黑底黑字、表格挤压、字号偏小等问题；
3. 校对列表页时间显示。

## 实操要点

### 1) 删除卡片时不要只删 detail page
必须同步删除：
- `docs/<slug>/index.html`
- `docs/<slug>/index.html.meta.yaml`
- `docs/<slug>/report.md`（或配套 source bundle）

然后：
- `python3 scripts/rebuild_index.py`
- `python3 scripts/verify_index.py`
- 确认 live `/_index.yaml` 不再包含该 slug
- 确认 public detail URL 返回 `404`

### 2) 移动端黑底黑字 / 表格挤压的修法
如果用户点名了某个 selector，优先修该 selector 本身：
- 例如 `.bigq` 变成透明背景且文字颜色接近深色时，优先给它明确浅底和内边距，而不是先怀疑缓存。
- 表格在移动端不应继续缩字号硬挤；应改成单列堆叠卡片/定义列表，确保 cell 逐项可读。
- 修复后要在 public Pages URL 用 390px 视口验证，并检查 computed style / DOM 结构。

### 3) 列表时间校对
如果用户说 list 页面时间不对，优先检查 card sidecar 的 `updated` / `date`：
- 需要“当前发布/重发行时间感”时，用当前 Asia/Shanghai 墙钟时间写 `updated`
- 然后重建 `_index.yaml`
- 在首页确认列表显示已经更新

### 4) 验收顺序
- 本地：`rebuild_index.py` → `verify_index.py`
- Git：提交、rebase、push
- 公网：
  - 删除 slug 的 detail URL 404
  - 首页 `/_index.yaml` 不含删除 slug
  - 目标卡 detail URL 可打开
  - homepage/list 中显示正确时间

## 典型坑
- 只改 detail page 不改 sidecar / index，首页仍可能保留旧条目。
- 只改桌面版布局，不做 390px 视口验证，移动端仍会像“桌面版缩小”。
- 表格如果只是字体更小而不改结构，仍会在手机上挤成难读块。
