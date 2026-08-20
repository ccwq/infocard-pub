# 子智能体超时：Commit 已完成 vs Push 卡住（2026-07-13）

## 核心教训

subagent 超时 600s 后，**通常 HTML + meta + build + index 全部已落盘**，只是 HTTP push 阶段卡住导致 subagent 无法正常退出。

## 判断流程

```
subagent 超时报告
  ↓
git log --oneline -3
  ↓
若有 commit SHA：
  ├── git push 成功 → 发布完成 ✅
  └── git push 卡住 → 主线程接手 push ✅
若无 commit SHA：
  ├── HTML/meta 文件存在 → 检查质量，主线程接手
  └── HTML/meta 不存在 → 主线程重建
```

## 实测案例

| 卡 | 超时时间 | commit SHA | 状态 |
|----|----------|-----------|------|
| Colibri MoE | 600s | `c5aa03b` | commit 完成，push 已成功 |
| Codespaces | 600s | `c0b8c3c` | commit 完成，push 已成功 |
| awesome-autoresearch | 600s | 无 | HTML/meta 存在，主线程接手后完成 |

## 主线程接手命令

```bash
cd ~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub
npm run build && cp dist/_index.yaml _index.yaml && cp dist/index.html index.html
git add docs/<slug>.html docs/<slug>.meta.yaml _index.yaml index.html
git commit -m "feat: add <slug>"
git push origin main
```

## 不要做的事

- ❌ 超时后立即判重建（浪费已有产出）
- ❌ 等 subagent 重试（600s 超时通常不会再产出）
- ❌ 先问用户"要重建吗"（发布链路是幂等的，主线程直接接手最快）
