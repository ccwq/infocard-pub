# 同系列卡批量发布模式

## 场景

用户一次性发送多张属于同一来源/系列的信息图（如同一公众号的多个 TOP 10 榜单、同一工具的多维度拆解），需要全部发布。

## 典型信号

- 多张图片一次性粘贴到对话中
- 标题有共同前缀/主题（如"Claude Code Skill 清单"分"必装榜""进阶榜""自动化榜""团队榜"）
- 来源标注一致（如均为"公众号·技术洋"）
- 用户说"发布"或"直接发布"而非"先看看"

## 模式（已验证 2026-06-26）

### 阶段一：识别系列，统一元数据约定

在写任何一张卡之前，先确认系列共性：

| 字段 | 系列约定值 |
|------|-----------|
| `date` / `updated` | 同一 UTC+8 时间戳（批量写卡前统一 `TZ=Asia/Shanghai date`） |
| `category` | 统一分类 |
| `note` | 同一来源 |
| `tags` | 共享标签 + 各卡特有标签 |

### 阶段二：并行写入所有 HTML + meta

所有卡的 HTML 和 `.meta.yaml` 同时创建，不逐张 build。用 `write_file` 并行写 3-6 张卡。

### 阶段三：批量 build + verify

一次 `npm run build && npm run verify`，处理全量。

### 阶段四：单次 commit + push

所有卡文件 + `_index.yaml` + `index.html` 一次 commit，避免碎片化 push。

### 阶段五：Wiki 批量同步

所有卡的 raw + concepts 文件并行写入。`index.md` 的 Concepts 区一次 patch 加入多条。`log.md` 一次追加所有记录。

### 验收策略

- raw GitHub content（`raw.githubusercontent.com`）通常比 Pages 快 ~60s 先出现
- Pages URL 格式：`https://<user>.github.io/<repo>/docs/<slug>.html`
- 不要只测 `curl -sI /<slug>.html`（404），要测 `/docs/<slug>.html`（200）
- Pages 部署延迟约 90-150s，多次轮询间隔 30-60s

## 坑点

- **不要逐张问"先发哪张"**：用户已给出全部来源，默认按出现顺序依次执行。
- **不要逐张 commit**：碎片化 commit 污染历史，应一次 commit 全量。
- **Wiki index patch 方向**：在 Concepts 区**顶部**追加新系列条目，保持 newest-first 排序。
- **commit hash 记录**：同一 commit hash 可记录多张卡，log 中合并记录即可。
