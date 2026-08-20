# 重复 slug 根因：stray .meta.yaml 文件（2026-07-09）

## 症状

- `npm run build` 本地输出正常（无重复 slug），CI 也 `success`
- 但公网 `_index.yaml` 中出现重复 slug（如 `20260621-camoufox-anti-detect-browser-firefox`）
- 客户端 js-yaml 解析含重复 key 的 YAML 时，后者覆盖前者，导致页面渲染异常
- CI smoke test 只比较"本地 `dist/_index.yaml` 字符串 === 远程 `_index.yaml` 字符串"，不检查 parseability 或重复

## 根因

`docs/` 目录下有大量游离的 `.meta.yaml` 文件（无对应 HTML）：

```
docs/20260621-camoufox-anti-detect-browser-firefox.meta.yaml   # 游离
docs/20260621-camoufox-anti-detect-browser-firefox.html.meta.yaml  # 配对
docs/claude-code-skill清单-full.meta.yaml  # 游离
docs/karpathy-llm-wiki-knowledge-compilation.meta.yaml  # 游离
```

这些来自历史 worktree 子目录（`infocard-claude-init/` 等）遗留。

`npm run build` 会递归扫描 `docs/**/*.meta.yaml`，匹配模式是 `*.meta.yaml`（非 `*.html.meta.yaml`），因此两类文件都被解析：

- `xxx.html.meta.yaml` → 产生 1 条索引
- `xxx.meta.yaml` → 也产生 1 条索引（内容可能不同，如旧版 Camoufox）

两个文件产生相同 slug，进入同一索引，重复。

## 验证方法

```bash
# 统计游离 .meta.yaml（无对应 HTML 的 .meta.yaml）
python3 -c "
import os, glob
files = glob.glob('docs/**/*.meta.yaml', recursive=True)
has_html = [f for f in files if f.replace('.meta.yaml','.html').replace('.html.meta.yaml','.html').endswith('.html') and os.path.exists(f.replace('.meta.yaml','.html'))]
no_html = [f for f in files if not os.path.exists(f.replace('.meta.yaml','.html'))]
print(f'Total: {len(files)}, with-html: {len(has_html)}, stray (no html): {len(no_html)}')
for f in no_html:
    print(f'  STRay: {f}')
"
```

## 修复方法

删除 `docs/` 下所有无对应 HTML 的游离 `.meta.yaml`：

```bash
cd ~/infocard-pub
# 干跑（不删除）
for f in docs/*.meta.yaml; do
    html="${f%.meta.yaml}.html"
    [ -f "$html" ] || echo "Would delete: $f"
done
# 实删
for f in docs/*.meta.yaml; do
    html="${f%.meta.yaml}.html"
    [ -f "$html" ] || rm "$f"
done
# 然后重新 build
npm run build && npm run verify
```

## CI smoke test 局限性

pages.yml 中的 smoke test 只做：

```javascript
if (remoteText === expected && remoteTop === localTop)
```

不检查 YAML parseable、无重复 slug、无空 desc。

**当前 CI 即使有重复 slug 也会 green**。未来如果要加强门禁，应在 `scripts/verify-index.js` 中加入重复 slug 检测。

## GitHub Pages 缓存

修复推送后 Pages 可能仍显示旧数据（`cache-control: max-age=600`）。等待 10 分钟或手动 trigger workflow_dispatch 刷新。

## 预防

- 不在 `docs/` 根目录留游离 `.meta.yaml`
- 任何新信息卡的 meta.yaml 必须以 `.html.meta.yaml` 为文件名后缀
- 定期运行上面的验证脚本检查游离文件
