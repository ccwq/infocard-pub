# Agent1 交付门禁：审查驱动的加固流程

适用于多智能体信息卡发布中，Agent1 向 Agent2 交付 facts/research/manifest/assets 的机器门禁。

## 推荐实施顺序

1. 先定义 Bundle 合同：slug、HTML/meta、asset_dir、manifest、source、style、category、Wiki 路径。
2. Agent1 必须交付：
   - `.tmp/infocard/<slug>/facts.json`
   - `.tmp/infocard/<slug>/research.md`
   - `assets/img/<slug>/manifest.json`
   - manifest 声明的全部本地资产
3. 运行门禁；PASS 后才能启动 Agent2。
4. 门禁代码必须经过两阶段审查：规格符合性 → 代码质量。
5. 审查 FAIL 时先写回归测试再修复；子智能体 timeout 后先检查 git diff 与测试，复用半成品，不盲目重启整个任务。

## 容易漏掉的四类边界

- **双清单一致性**：`facts.assets` 与 `manifest.assets` 的 `local_path` 集合必须一致；无图时二者都为空，manifest 还必须给非空 `reason`。
- **类型与 MIME**：claims/required_sections 必须是非空字符串数组；每个 manifest asset 必须有受支持的 `mime_type`，并与扩展名和文件签名一致。
- **路径安全**：拒绝绝对路径、`..`、Windows drive/UNC；磁盘校验还要比较 `realpath`，防止目录内符号链接逃逸。
- **资产真实性**：文件存在、非零字节、实际 bytes 与 manifest 一致；不能只相信 JSON 声明。

## Timeout 接管

子智能体 600s timeout 后：

```text
git status/diff → 运行目标测试 → 判断：
- 无修改：重新派一个更小任务
- 有半成品且部分测试通过：只补失败逻辑
- 文件损坏：才回退重写
```

不要按 API call 次数判断完成度；以实际文件、diff、测试为准。

## 完成条件

- 目标测试全绿；
- 旧 bundle 测试不回归；
- `npm run verify`通过；
- `git diff --check`通过；
- 规格审查 PASS；
- 代码质量审查 APPROVED。
