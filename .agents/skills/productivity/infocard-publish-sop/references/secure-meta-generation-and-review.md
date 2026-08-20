# 安全生成 meta 与审查闭环

适用于 bundle 驱动的 `.meta.yaml` 生成器及类似“根据受信输入写入仓库路径”的工具。

## 生成与解析

- 机械字段只来自已验证 bundle：`slug/path/style/category/source_url`。
- `slug` 输出为裸 identifier；其他标量安全引用。
- 不生成 `date/updated`；Agent2 只补 `title/desc/tags`。
- YAML 校验必须复用站点构建链的解析器与 schema，避免另写不完整 parser。当前仓库来源为 `assets/home/vendor/js-yaml.min.js` + `FAILSAFE_SCHEMA`。
- 在解析前拒绝重复的机械字段；测试至少覆盖行尾注释、引号内 `#`、双引号转义、YAML 单引号双写转义、block/flow 数组。

## 安全写入

仅靠 `realpath` 检查后再 `open()` 仍有 TOCTOU。Linux 下使用描述符相对路径：

1. 打开仓库根目录 fd。
2. 逐级以 `dir_fd + O_DIRECTORY + O_NOFOLLOW` 打开父目录。
3. 在最终父目录创建排他临时文件，完整写入并 `fsync`。
4. 新建模式用硬链接原子发布，已有目标时拒绝覆盖。
5. 替换模式先以 `follow_symlinks=false` 确认目标是普通文件，再 `os.replace`。
6. `fsync` 父目录；任何失败都清理临时文件，不能留下看似完整的最终文件。

测试故障注入不得由普通 CLI 继承环境变量即可触发。隐藏测试钩子必须同时需要显式测试参数与测试哨兵，并在 `finally` 恢复目录、删除 marker。测试应断言外部 sentinel 未变、原目录仍在、无临时文件或 swapped marker。

## 子智能体副作用边界

“不要 push”不能只写在任务描述中。子智能体返回后必须事实核验：

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

- 任务开始前记录远端 SHA。
- 任务结束后确认远端 SHA 未变化；不要仅相信子智能体自述。
- 若发生越权 push，立即停止后续外部动作并向用户报告；未经明确授权不要自动回滚或再次 push。

## 审查闭环

每项流水线能力依次经过：实现 → 规格审查 → 代码质量/安全审查 → 修复 → 复审。审查发现的问题按“运行时阻塞 / 测试覆盖缺口 / 过程证据”区分：

- 可导致逃逸、覆盖、残留或错误放行：必须修复。
- 已由实现与定向 probe 证明正确、但缺回归用例：原则上补测试；不得把纯过程记录缺失误报成运行时代码缺陷。
- profile skill 的职责说明不在 Git commit 中；规格审查必须回读 skill，不能只看仓库 diff。
