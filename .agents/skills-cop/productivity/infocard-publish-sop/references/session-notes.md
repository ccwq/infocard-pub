# infocard-publish-sop 实战笔记

## 2026-07-11 对话记录

### 教训 1：子智能体与主线程写卡冲突（Harness Engineering 卡）

**现象**：派发了 agent1（调研）+ agent2（写卡）并行任务，但主线程因为"内容已够"提前写了同一张卡，导致 agent2 完成时发现文件已被覆盖，产生重复劳动。

**根因**：旧 SOP 允许"过程文件存在即可主线程接管"，这给了主线程抢占的正当理由，与 agent2 的独占写入权冲突。

**修复**：新 SOP 规定——唯一接管信号 = agent2 明确 timeout/failed 终态；主线程在 agent2 运行期间不得写同一输出文件，即使内容已充分掌握。

**经验**：调研文件可用 ≠ 可抢占写卡；单输出路径单写入者原则。

### 教训 2：图片下载路径陷阱

**现象**：子智能体尝试用 `~/infocard-pub/assets/img/...` 路径下载图片，背景任务返回"Done: 0 files"——因为 `~` 在 `curl -o` 中没有展开。

**修复**：子智能体 prompt 必须使用已验证的 active repository root，不能猜测 home 路径。

### 教训 3：图片资源由 agent1 负责

**现象**：主线程在 agent2 运行时自行下载了 17 张图片，属于越权。

**修复**：图片下载与 manifest.json 生成是 agent1 的职责；主线程只做验收（manifest 核验 + 图片 HTTP 可达性），不重新下载。

### 教训 4：移动端验收的最小修复权限

**现象**：OpeniLink Hub 卡在 390px 视觉复核时发现代码块和表格无 `overflow-x:auto`，会导致横向溢出。

**处理**：主线程直接加了一行 CSS 修复（`pre,code,.comparison-table{overflow-x:auto}`）并 push，属于质量门中的"可客观验收问题→主线程直修"权限。

**原则**：能客观判断的问题（断图、路径错、时间戳、HTML 语法、移动端溢出）主线程直接修；内容结构失真、事实错误、整体重做才退回 agent2。

### 教训 5：patch 工具在写入后验证

**现象**：MiniMind 卡用 patch 修改 overview 段落，patch 报告成功，但 deploy 后 `grep -o` 找不到"配套PPTX"等词——实际文件本地检查有，但 curl 取到的公网版本没有（可能是 CDN 缓存）。

**处理**：patch 写入后应立即用 `curl -s | grep` 验证公网结果，不能只靠本地文件检查。

### 当前 SOP 状态（2026-07-11）

- ✅ 三阶段职责边界清晰（agent1 / agent2 / 主线程）
- ✅ manifest.json 强制要求
- ✅ 唯一接管信号规则
- ✅ 失败恢复规则
- ✅ 质量门与修复权限
- ⏳ 子智能体 prompt 模板待补充（含绝对路径提示、manifest.json 格式要求）

### 待补充：子智能体 prompt 模板

agent2 prompt 应在 context 中明确：
```
图片资产路径：~/infocard-pub/assets/img/<slug>/
manifest.json 路径：~/infocard-pub/assets/img/<slug>/manifest.json
HTML 输出：docs/YYYYMMDD-<slug>.html
路径前缀：由 `git rev-parse --show-toplevel` 解析的 active repository root
```
