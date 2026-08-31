# Taxonomy 教训与治理陷阱

## taxonomy.source 双层架构（核心教训）

每张卡的元数据有**两个 source 字段**，职责完全不同：

| 字段 | 位置 | 约束 | 用途 |
|------|------|------|------|
| `taxonomy.source` | `meta.yaml` 的 `taxonomy:` 下 | **必须是 `_taxonomy.yaml` 枚举**（GitHub / Website / Paper 等 11 个） | 筛选器读取 |
| `source_url` | `meta.yaml` 顶层 | 任意合法外部 URL | 跳转溯源 |

**禁止行为**：
- ❌ 把 URL 或域名写入 `taxonomy.source`
- ❌ 把机构名（如 "腾讯云社区"、"CSDN"）写入 `taxonomy.source`
- ❌ 把自由文本（如 "官方文档"、"用户提供内容"）写入 `taxonomy.source`

**正确迁移模式**：
```yaml
# 旧写法（脏）
source: https://aisa.one  # ❌

# 正确写法
source_url: https://aisa.one  # ✅ 跳转链接
taxonomy:
  source:
    - Website  # ✅ 枚举
```

## dist/ vs 根目录同步陷阱（build 输出位置）

**症状**：`npm run build` 成功，但 `_index.yaml` 里 taxonomy.source 脏值数量不变。

**根因**：`scripts/index-build-lib.js` 把 `_index.yaml` 写到 `dist/_index.yaml`，不是仓库根目录。根目录的 `_index.yaml` 是旧版本。

```javascript
// index-build-lib.js
const INDEX_PATH = path.join(DIST_DIR, "_index.yaml");  // → dist/_index.yaml
// NOT → _index.yaml (root)
```

**正确发布链路**：
```bash
npm run build          # 写 dist/_index.yaml + dist/index.html
cp dist/_index.yaml _index.yaml   # 必须手动同步到根目录
cp dist/index.html index.html
npm run verify
git add _index.yaml index.html ...
```

每次 build 后都要同步这两个文件。

## mergeTaxonomy 的 append-only bug

**症状**：`fix-taxonomy --write --all` 运行后，`taxonomy.source` 仍然包含脏值（如 URL、机构名）。

**根因**：`taxonomy-lib.js` 的 `mergeTaxonomy()` 逻辑：

```javascript
if (have.length > 0) {
  result[dim] = have.map(...);  // 已有值就保留，不覆盖
} else if (fill.length > 0) {
  result[dim] = fill;
} else {
  result[dim] = [];  // 脏值在 have 里，永远不到这里
}
```

当旧值已存在但含脏值时，`mergeTaxonomy` 保留旧值（因为 `have.length > 0`），不会清理脏的部分。

**修复方案**：不用 `fix-taxonomy --write` 来清理已有脏值，直接用 Node 脚本按 slug 精确 patch：

```javascript
// 按 slug 找到 meta.yaml，直接设 taxonomy.source = ['Website']
const meta = yaml.load(fs.readFileSync(fp, 'utf8'));
meta.taxonomy.source = ['Website'];
fs.writeFileSync(fp, yaml.dump(meta, {...}), 'utf8');
```

## 兜底默认值必须用枚举中的值

**症状**：`fix-taxonomy` 写入了 `style: [main]`，`verify-taxonomy --strict` 报 `invalid value "main"`。

**根因**：`_taxonomy.yaml` 的 `style` 枚举中**没有 `main`**。

**正确兜底值**：
```javascript
// ❌ 错误
if (!merged.style.length) merged.style = ['main'];

// ✅ 正确（hardblue 在 _taxonomy.yaml 枚举中）
if (!merged.style.length) merged.style = ['hardblue'];
```

枚举列表（截至 2026-07）：
hardblue, redswiss, q-style, wood, black-head, graph-paper, pixelstack, archive-green, darkblue, darkgreen, scrapbook, white-purple, color-material, dang-ai-dark

## Python yaml vs Node js-yaml 解析差异

**症状**：Python `yaml.safe_load()` 在某些 meta.yaml 上报 `ScannerError`。

**根因**：meta.yaml 文件里混入了 HTML 内容（CSS 片段），Python yaml 解析器遇到冒号报错。Node 的 `js-yaml` 更友好。

**解决方案**：对 meta.yaml 只用 Node 脚本读写，不用 Python。

## verify-taxonomy --strict 级联失败

`verify-taxonomy.js --all --strict` 检查 4 个必填维度：`source`, `style`, `risk`, `content_type`。

**级联现象**：当 style 推断失败时，4 个维度全部报错，即使其他正常。**一张卡的 style 失败不等于该卡整体"脏"**。

发布时：source 脏值 = 0 是首要验收指标；其他维度失败属于历史债务，不阻断 source 干净的卡发布。

## `--amend` 陷阱与 `git reset` 恢复（2026-07-12）

**症状**：多次 `git commit --amend` 后发现提交里少了 `_index.yaml` 和 `index.html`，但 dist/ 里有正确内容。

**根因**：`amend` 只修改暂存区内容，不读取工作区。典型错误序列：
```bash
git commit -m "feat: publish lemma"          # 暂存了 HTML + meta
cp dist/_index.yaml _index.yaml              # 工作区更新，暂存区没变
git add _index.yaml index.html               # 暂存了旧版本
git commit --amend --no-edit                 # amend 提交暂存区，不含 lemma-platform
```

**正确链路**：build → cp → add → commit（顺序固定），详见 `SKILL.md`「发布链路 Git 操作陷阱」。

**恢复流程**（当发现 amend 遗漏了 build 产物）：
```bash
# 1. 确认 dist/ 里的内容是正确的（含新卡）
grep -c "lemma-platform" dist/_index.yaml   # 应 > 0

# 2. 硬重置到 HEAD（丢弃 amend 的错误版本）
git reset --hard HEAD

# 3. 从 dist/ 重新同步
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html

# 4. 重新 add + commit（一次性完成，不 amend）
git add _index.yaml index.html docs/lemma.html docs/lemma.meta.yaml
git commit -m "feat: publish lemma"
```

**禁止的恢复方式**：
- ❌ 再次 amend → 继续遗漏新文件
- ❌ `git revert` → 产生反向提交，混乱历史
- ❌ 强推覆盖 → 需要用户明确授权

## `fix-taxonomy --all` 只改本地 meta，不自动触发 build

运行 `fix-taxonomy --write --all` 后需要单独执行 `npm run build` 才能更新 `_index.yaml` 和 `index.html`。

## 脏值扫描工具

```javascript
node -e "
const fs=require('fs'), yaml=require('./assets/home/vendor/js-yaml.min.js');
const idx=yaml.load(fs.readFileSync('_index.yaml','utf8'));
const canonical=new Set(['github','x / twitter','website','blog','pdf','paper','wikipedia','screenshot','user-provided','news','video']);
const dirty=(idx.cards||[]).filter(c=>{
  const src=(c.taxonomy||{}).source||[];
  return src.some(v=>!canonical.has(v.toLowerCase()));
});
console.log('dirty:', dirty.length);
dirty.forEach(c=>console.log(' ',c.slug,(c.taxonomy||{}).source));
"
```

## taxonomy.source 规范化映射

推断 source 时按优先级取第一个有效值：

```javascript
function inferSource(data) {
  const have = Array.isArray(data.taxonomy?.source) ? data.taxonomy.source : [];
  if (have.some(v => canonical.has(v.toLowerCase()))) return uniq(have);

  const url = data.source_url || '';
  if (/github\.com/.test(url)) return ['GitHub'];
  if (/x\.com|twitter\.com/.test(url)) return ['X / Twitter'];
  if (/arxiv|doi\.org/.test(url)) return ['Paper'];
  if (/\.pdf($|\?)/i.test(url)) return ['PDF'];
  if (/youtube\.com|youtu\.be|bilibili\.com/.test(url)) return ['Video'];
  if (/wikipedia\.org/.test(url)) return ['Wikipedia'];

  return ['User-provided'];
}
```

## inferStyle HTML data-theme 读取（2026-07-12）

旧卡（6月发布）大量没有 `meta.yaml` 的 `style` 字段，需要从 HTML `data-theme` 属性推断。

```javascript
function inferStyle(data) {
  const top = canonicalizeStyle(data.style);
  if (top) return [top];

  if (data._htmlPath) {
    const html = require('fs').readFileSync(data._htmlPath, 'utf8');
    const match = html.match(/data-theme=["']([^"']+)["']/);
    if (match) {
      const canon = canonicalizeStyle(match[1]);
      if (canon) return [canon];
    }
  }
  return [];
}
```

调用 `fix-taxonomy.js` 时传入 HTML 路径：
```javascript
const htmlPath = file.replace(/\.meta\.yaml$/, '.html').replace(/\/index\.meta\.yaml$/, '/index.html');
const inferred = buildTaxonomy({ ...data, _htmlPath: htmlPath });
```
