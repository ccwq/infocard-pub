# Avatar / Asset Subdirectory Commit Trap

## 陷阱描述

创建含头像图片的信息卡时，avatar 文件通常放在：

```
docs/assets/images/{slug}/avatar.png
```

在发布流程中如果只执行：
```bash
git add docs/{slug}.html docs/{slug}.html.meta.yaml
```

**`docs/assets/images/{slug}/` 目录不会被包含**，因为 `git add docs/{slug}.html` 只暂存指定的 HTML 文件，不递归包含其引用的资产目录。

结果：commit 成功，Pages 部署成功，但 `avatar.png` 在 GitHub Pages 上 404（文件从未进入仓库）。

## 正确做法

创建卡片含资产时，必须显式添加资产目录：

```bash
mkdir -p docs/assets/images/{slug}
cp /tmp/avatar.png docs/assets/images/{slug}/

# 发布时一起暂存
git add docs/{slug}.html \
       docs/{slug}.html.meta.yaml \
       docs/assets/images/{slug}/   # ← 必须显式 add
```

或用 glob pattern：
```bash
git add docs/{slug}.html docs/{slug}.html.meta.yaml docs/assets/images/{slug}/
```

## 诊断方法

```bash
# 检查 avatar 是否在 git 跟踪列表中
git ls-files | grep "{slug}/avatar.png"

# 如果输出为空 → 文件未被 commit，需要补 commit
```

## 验证方法

```bash
# Pages 传播后（等待 ~88s）验证
curl -sI "https://ccwq.github.io/infocard-pub/docs/assets/images/{slug}/avatar.png"
# 期望：HTTP/2 200
```

## 相关教训

- mattpocock-teach (2026-06-12)：首次 commit `10d2c7d` 遗漏 avatar，需要补 commit `65d6189`
- ai-devkit (2026-06-12)：发布前先 mkdir 并 cp，在 commit 时一起 add，成功率 100%

## 预防规则

所有含 `src="assets/images/{slug}/..."` 引用路径的 HTML 发布时，
必须确认 `docs/assets/images/{slug}/` 目录已进 git index。
