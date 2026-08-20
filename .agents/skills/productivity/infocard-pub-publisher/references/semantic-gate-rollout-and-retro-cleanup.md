# 语义门禁发布与存量清理模式

**2026-07-08 实录**：`desc` 字段从"可选"升级为"必填"时的完整处理流程。

## 背景

`index-build-lib.js` 中 `requiredFields` 原本只包含格式字段（slug、path、category 等），不包含 `desc`。

发卡流程上线后发现 3 张卡（entire-cli、awesome-design-md、last30days-skill）缺 `desc`，在 index 列表页显示"没有描述"。

决策：把 `desc` 升级为必填字段，代码层硬性拦截。

## 语义门禁升级的标准流程

**第一步：代码层面加门禁**

```js
// 格式门禁（字段必须存在）
const requiredFields = ["slug", "path", "category", "title", "date", "tags", "desc"];

// 内容门禁（字段不能为空）
if (!data.desc || !data.desc.trim()) {
  throw new Error(`${metaPath}: desc is empty`);
}
```

**第二步：运行 build，收集存量报错**

```bash
node -e "
const {buildIndexData} = require('./scripts/index-build-lib.js');
try {
  const d = buildIndexData();
  console.log('OK: cards:', d._count);
} catch(e) {
  console.log(e.message);
}
"
```

输出示例：`docs/20260704-memvid.html.meta.yaml: missing fields desc`

**第三步：逐张修复历史卡**

为每张报错卡的 `.meta.yaml` 补上 `desc` 字段，内容压缩为一行中文描述。

**第四步：验证 build 通过**

```js
const bad = idx.cards.filter(c => !c.desc?.trim());
console.log('Empty descs:', bad.length);
```

**第五步：门禁代码 + 存量修复同一次 commit push**

```bash
git add scripts/index-build-lib.js docs/20260704-memvid.html.meta.yaml _index.yaml index.html
git commit -m "fix: require non-empty desc in infocard index build"
git push origin main
```

**第六步：公网验收**

```bash
sleep 50
curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | python3 -c "
import yaml, sys
idx = yaml.safe_load(sys.stdin.read())
bad = [c['slug'] for c in idx['cards'] if not c.get('desc','').strip()]
print('Empty descs:', len(bad))
"
```

## 关键原则

1. **门禁代码和存量修复必须同一次 commit push**。否则门禁代码先上线，存量卡会把 build 堵死，Pages 部署失败。
2. **门禁必须区分"字段缺失"和"字段为空"**。两者都要拦截。
3. **desc 内容必须压缩为单行纯文本**，不要写多行 YAML 或带换行的块。
4. **验证通过后再 push**，不要带着未修复的存量卡闯关。

## 适用场景

- 任何字段从"可选"升级为"必填"
- 任何语义校验（内容长度、格式、正则匹配等）加入 build 阶段
- 任何影响 `npm run build` 能否成功的规则变更
