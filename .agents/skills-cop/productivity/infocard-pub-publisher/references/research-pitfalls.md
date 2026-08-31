# 调研与元数据陷阱

## 仓库名 ≠ 项目名

不能根据 URL 路径名猜测项目功能。始终先调研再写 meta。

**反例**：kcap-cli 被误认为"Kaplan-Meier 生存分析 CLI"——实际上它是 **Kurrent Capacitor CLI**，一个 AI 编程会话录制工具。项目名只是恰好叫 kcap。

**正确做法**：
1. 先 fetch README 和 GitHub API，获取真实功能描述
2. 再写 meta.yaml 的 title / desc / tags
3. meta 写错比内容写错更难修复（影响首页索引和搜索）

## Meta 字段修正后的 rebuild 流程

如果 push 后发现 meta 有误：
1. 修改 meta.yaml
2. `npm run build`（重新生成 _index.yaml 和注入 index.html）
3. `git add meta.yaml _index.yaml index.html && git commit && push`
4. 如果索引无变化（git diff 为空），说明 meta 已在 push 前被 build 覆盖，无需重复提交

## 图片插入的 Pages 延迟

向已发布的信息卡中插入本地图片（复制到 `docs/assets/images/`）后：
- push 后不能立即截图验收
- 必须等 Pages 部署完成（通常 20-60 秒）
- 轮询 `HTTP 200` 确认部署就绪后再截图
