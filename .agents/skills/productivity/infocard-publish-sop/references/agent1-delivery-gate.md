# Agent1 交付门禁

适用于多智能体信息卡发布。目标是确保 Agent2 只基于已完成、可验证的事实与资产包写卡。

## 项目内调度

```text
agent1 → delivery gate PASS → agent2
```

跨项目的 agent1 可并行；已通过门禁的多个 agent2 也可并行。单个项目内不得把 agent1 与依赖其交付物的 agent2 放进同一个并发 batch。

## 必需交付物

- `.tmp/infocard/<slug>/facts.json`
- `.tmp/infocard/<slug>/research.md`
- `assets/img/<slug>/manifest.json`

`facts.json`至少包含：

- `source_url`
- `retrieved_at`
- `repo_meta`对象
- 非空`claims[]`
- 非空`required_sections[]`
- `assets[]`

## 验证规则

- 三个文件必须存在且非空。
-`facts.source_url`必须与发布 bundle 一致。
- manifest 必须是合法 JSON。
- manifest 中的本地资源必须位于该 bundle 的`asset_dir`内，禁止路径穿越。
- 图片文件必须存在、非 0 字节；扩展名、MIME 与文件签名应一致。
- manifest 声明 bytes 时，应与实际文件大小一致。
- 无图片项目必须显式使用`assets: []`并提供非空`reason`。
- 门禁失败时不得启动 agent2；先由 agent1 或主线程补齐事实/资产缺口。

## 验证命令

```bash
node scripts/verify-agent1-delivery.js --bundle .tmp/publish-bundles/<slug>.json
```

成功输出 JSON 且退出码为 0；失败输出结构化错误并使用非 0 退出码。

## 接管边界

Agent2 明确 timeout/failed 后，主线程先检查已有 HTML/meta：

- 半成品通过内容合同：只做最小修复。
- 缺核心章节、事实覆盖不足或文件损坏：按 facts/research/manifest 接管重写。
- Agent1 门禁未通过时，不得以“已有 README”替代正式事实包继续发布。
