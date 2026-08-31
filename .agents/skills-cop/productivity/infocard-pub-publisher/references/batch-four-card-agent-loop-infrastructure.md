# 批量发布 4 张 Agent Loop 基础设施卡：会话复盘

这份参考记录了 2026-06-23 的批量发布方式，适用于“同一轮里发布多张相关基础设施卡”的场景。

## 已验证做法

- 先按内容类型分工，而不是按时间顺序硬排。
- 主题可以错开，但要和卡的功能气质匹配：
  - 真实浏览器闭环 / 自动化调试 → `darkblue`
  - 命名 localhost / worktree / 协作开发 → `hardblue`
  - 本地 API 模拟 / CI / 沙盒 → `darkblue`
  - 终端生成图像和视频 → `darkblue`
- 先把 4 个页面一次性写完，再统一补 meta，最后只跑一轮 `npm run build && npm run verify`。
- 390px 检查可以批量做，但每张卡都要单独确认 `HTTP 200`。
- Pages 验收按每个 slug 逐个 curl，不要只看 `_index.yaml` 的总条数。
- wiki 同步要先核对 raw / concept 的最终文件名，再 `git add`；不要拿旧文件名继续提交。
- `index.md` 追加新条目时，先用 `search_files` / `read_file` 找到稳定锚点，再改整段，避免 partial patch 锚点不准。

## 这次踩到的坑

- `portless` 的 raw 文件名一开始写成了 `20260623-infocard-portless.md`，但最终统一约定应是 `2026-06-23-infocard-portless.md`。批量同步时必须先确认命名规范，再提交。
- `index.md` 的插入锚点不能依赖模糊字符串；当条目列表较长时，必须先定位周边上下文，再做精确 patch。
- 多卡发布时，如果页面主题都偏相近，首页视觉会显得重复。基础设施类内容可以按气质分到 `darkblue` / `hardblue`，但要保持在既有主题体系内。

## 复用提示

- 如果同一轮要发 3 张以上卡，优先先收集所有来源事实，再批量写 HTML/meta。
- 批量发布的最低验收单位是“单卡 HTML + 单卡 meta + 对应 wiki raw + concept + Pages HTTP 200”。
- 发布完成后，wiki 的 `index.md` 与 `log.md` 要一次性更新，不要分批留下半同步状态。
