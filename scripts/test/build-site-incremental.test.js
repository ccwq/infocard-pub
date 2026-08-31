'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { classify, selectBuildMode, deletedCardPaths, hasFullFlag } = require('../build-site.js');
const { copyFileIfChanged, mergeIndexSnapshot } = require('../index-build-lib.js');
const { sidecarsForChangedDocs } = require('../sync-build-timestamps.js');

test('无有效变化时选择 noop', () => {
  /**
   * Given：Git 没有有效源文件变化
   * When：选择构建模式
   * Then：返回 noop 且不触发写入
   * 防回归：避免空构建刷新时间戳
   */
  assert.equal(selectBuildMode({ files: [] }).mode, 'noop');
});

test('卡片与支持文件分类为增量输入', () => {
  /**
   * Given：单卡 HTML、sidecar 与 docs 支持资源发生变化
   * When：分析变更文件
   * Then：三者都进入增量同步列表
   * 防回归：docs 下非卡片支持文件不得漏同步到 dist
   */
  const info = classify(['docs/a.html', 'docs/a.html.meta.yaml', 'docs/data.json', 'docs/index.html']);
  assert.equal(info.cardHtml.length, 1);
  assert.equal(info.cardMeta.length, 1);
  assert.deepEqual(info.changedDocs.sort(), ['docs/a.html', 'docs/a.html.meta.yaml', 'docs/data.json', 'docs/index.html']);
});

test('临时夹具验证局部 dist 复制与索引 patch 删除', () => {
  /**
   * Given：临时源文件、dist 目标和已有索引快照
   * When：执行局部复制并合并新增、修改、删除卡片
   * Then：dist 内容更新且索引结果等价于目标快照
   * 防回归：增量构建不得复制遗漏或保留已删除卡片
   */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-build-test-'));
  try {
    const source = path.join(dir, 'docs', 'support.json');
    const target = path.join(dir, 'dist', 'docs', 'support.json');
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.writeFileSync(source, '{"ok":true}');
    copyFileIfChanged(source, target);
    assert.equal(fs.readFileSync(target, 'utf8'), '{"ok":true}');
    const cards = mergeIndexSnapshot(
      [{ path: 'docs/old.html', slug: 'old', _sort_ts: 1 }, { path: 'docs/keep.html', slug: 'keep', _sort_ts: 2 }],
      [{ path: 'docs/new.html', slug: 'new', _sort_ts: 3 }],
      ['docs/old.html']
    );
    assert.deepEqual(cards.map((card) => card.path), ['docs/new.html', 'docs/keep.html']);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('全局输入和显式参数选择 full', () => {
  /**
   * Given：主题或构建脚本发生变化，或用户传入 full
   * When：选择构建模式
   * Then：返回 full
   * 防回归：全局语义变化不能错误走增量
   */
  assert.equal(selectBuildMode({ files: ['theme/base.css'] }).mode, 'full');
  assert.equal(selectBuildMode({ files: [], forceFull: true }).mode, 'full');
  assert.equal(selectBuildMode({ files: ['docs/a.html'], hasSnapshot: false }).mode, 'full');
  assert.equal(hasFullFlag(['--full']), true);
  assert.equal(hasFullFlag(['-f']), true);
});

test('删除 sidecar 从 HEAD 快照读取真实 path', () => {
  /**
   * Given：删除的 sidecar 文件名与其声明 path 不同
   * When：解析删除卡片路径
   * Then：使用 sidecar 原声明 path 移除索引条目
   * 防回归：不能仅按 basename 推断删除路径
   */
  const result = deletedCardPaths(['docs/legacy.meta.yaml'], () => 'slug: legacy\npath: docs/custom-card.html\n');
  assert.deepEqual(result, ['docs/custom-card.html']);
});

test('HTML 变更映射到配对 sidecar 并保留 taxonomy-only 语义', () => {
  /**
   * Given：两种卡片布局的 HTML 发生变化，且 sidecar 均存在
   * When：计算需要更新时间戳的 sidecar
   * Then：foo.html 与 foo/index.html 都映射到各自 sidecar
   * 防回归：HTML-only 修改不能漏更新时间，也不能扫描无关 sidecar
   */
  const result = sidecarsForChangedDocs(
    ['docs/foo.html', 'docs/foo/index.html', 'docs/other.txt'],
    (file) => file === 'docs/foo.html.meta.yaml' || file === 'docs/foo/index.html.meta.yaml'
  );
  assert.deepEqual(result, ['docs/foo.html.meta.yaml', 'docs/foo/index.html.meta.yaml']);
});
