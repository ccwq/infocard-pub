# 信息卡发布前置检查（2026-07-25）

## 本次暴露的问题

创建提示词 YAML 转换专家卡时，初版 HTML 写入调用混入了截断占位/尾部残留文本；meta.yaml 初版 `slug` 未带日期前缀，触发 `fix-meta-shape` 的 slug mismatch 警告。构建虽能完成，但不能把“build 通过”当成内容与契约完整。

## 可复用门禁

1. 写 HTML 后先读取完整文件尾部，确认只出现一次 `</html>`，没有 `...`、`[truncated]`、工具调用残留或自然语言尾巴。
2. 检查 `meta.yaml`：
   - `desc` 位于 `title` 前；
   - `slug` 与文件名基名完全一致，包含日期前缀；
   - `path` 精确指向 `docs/<filename>.html`；
   - `date`、`updated` 使用完整时间格式。
3. 运行 `npm run build` 后重新读取 sidecar，因为构建脚本可能自动回填时间戳；将最终 sidecar 与 HTML、`_index.yaml`、`index.html` 一起提交。
4. 发布后等待 CDN 传播，用 exact Pages URL 与 `_index.yaml` 做 HTTP 200 检查，再抽取标题和至少两个关键内容关键词。
5. 只有公网验证通过后，才清理 worktree 和发布分支。

## 主题声明与实际主题

`meta.yaml.style` 只是声明，不是视觉证明。主题验收要同时检查：

- 目标 style skill 已加载；
- HTML 使用对应主题的 token；
- 至少两个主题结构特征存在。

hardblue 的最低结构特征：暖灰网格背景、3px 黑色边框、红/蓝/黑三色 hero bar、硬边阴影或编号模块。单一工具/模板卡默认优先 hardblue；redswiss 留给真正的工具对比或 CLI 生态图鉴。
