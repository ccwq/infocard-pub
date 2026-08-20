# desc 字段导致的发布复盘（2026-07-08）

## 背景

在一次看似成功的 infocard 发布之后，列表页出现了 3 张卡“无描述”的问题：
- `20260708-entire-cli`
- `20260708-awesome-design-md`
- `20260708-last30days-skill`

根因不是 HTML 缺正文，而是 `meta.yaml` 漏了 `desc` 字段。

## 复盘结论

这是一个“发布成功但元数据不完整”的问题，属于 closeout 需要捕捉的残留类型：
- deliverable 已上线
- 但索引语义不完整
- 用户可见质量下降

## 处理方式

1. 补齐漏掉的 `desc`
2. 将 `desc` 加入 `scripts/index-build-lib.js` 的必填字段
3. 增加空值校验，`desc: ""` 也要失败
4. 重新 build / push / 验收

## closeout 提示

当发布完成后，closeout 不只是“清理临时文件”，还应检查：
- 索引摘要是否完整
- 是否有空白元数据被静默放行
- 是否需要把这类错误升级成 build gate

## 适用范围

该经验适用于所有 infocard 发布闭环，尤其是：
- 批量发布
- 子智能体并发写卡
- 需要更新 `_index.yaml` / `index.html` 的仓库
