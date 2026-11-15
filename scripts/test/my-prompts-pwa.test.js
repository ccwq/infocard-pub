'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..', '..');
const cardPath = path.join(repoRoot, 'docs', '20261115-my-prompts.html');
const manifestPath = path.join(repoRoot, 'docs', 'my-prompts.webmanifest');

const read = (p) => fs.readFileSync(p, 'utf8');
const card = read(cardPath);
const manifest = JSON.parse(read(manifestPath));

test('my-prompts PWA manifest: independent id, entry, standalone display', () => {
  assert.equal(manifest.name, '我的提示词');
  assert.equal(manifest.short_name, '我的提示词');
  assert.equal(manifest.display, 'standalone');
  // 独立 id，不能与站点 PWA（id=/infocard-pub/）相同
  assert.equal(manifest.id, '/infocard-pub/docs/my-prompts');
  assert.notEqual(manifest.id, '/infocard-pub/');
  // start_url 必须落在 scope 内
  assert.ok(manifest.start_url.startsWith(manifest.scope));
  assert.equal(manifest.start_url, '/infocard-pub/docs/20261115-my-prompts.html');
  assert.equal(manifest.scope, '/infocard-pub/docs/20261115-my-prompts.html');
  assert.ok(!'/infocard-pub/docs/20261110-sag2-sagwiki.html'.startsWith(manifest.scope));
  assert.ok(!'/infocard-pub/'.startsWith(manifest.scope));
});

test('my-prompts PWA manifest icons exist on disk and are declared', () => {
  const purposes = manifest.icons.map((i) => i.purpose);
  assert.ok(purposes.includes('any'));
  assert.ok(purposes.includes('maskable'));
  for (const icon of manifest.icons) {
    const rel = icon.src.replace('/infocard-pub/', '');
    assert.ok(fs.existsSync(path.join(repoRoot, rel)), `missing icon file: ${icon.src}`);
    if (icon.sizes.includes('x')) {
      const [w] = icon.sizes.split('x').map(Number);
      assert.ok(w >= 192, `icon ${icon.src} too small for install: ${w}`);
    }
  }
});

test('my-prompts card links its own manifest and theme assets', () => {
  assert.match(card, /<link rel="manifest" href="my-prompts\.webmanifest">/);
  assert.match(card, /<meta name="theme-color" content="#17324d">/);
  assert.match(card, /<link rel="apple-touch-icon" href="my-prompts-icon-512\.png">/);
  assert.match(card, /<meta name="apple-mobile-web-app-title" content="我的提示词">/);
});

test('my-prompts card reuses the site service worker and adds no new worker file', () => {
  assert.match(card, /navigator\.serviceWorker\.register\('\/infocard-pub\/sw\.js'/);
  // 不得走 docs/sw.js：根目录下的 sw.js 才是当前全站 SW（docs/sw.js 为过期 v2，且跨目录 scope 会被 Pages 头拒绝）
  assert.ok(!card.includes("'./sw.js'"));
  assert.ok(fs.existsSync(path.join(repoRoot, 'sw.js')), 'site sw.js must remain in place');
  // 本次任务不新增任何 per-card worker（docs/sw.js 为他人既有文件，不属于本卡）
  assert.ok(!fs.existsSync(path.join(repoRoot, 'docs', 'my-prompts-sw.js')), 'no per-card service worker file');
  // 不修改全站 SW：站点 sw.js 不出现本卡路径的预缓存条目
  const siteSw = read(path.join(repoRoot, 'sw.js'));
  assert.ok(!siteSw.includes('my-prompts'));
});

test('my-prompts card install entry handles prompt, iOS and standalone states', () => {
  assert.match(card, /id="install-btn"/);
  assert.match(card, /addEventListener\('beforeinstallprompt'/);
  assert.match(card, /addEventListener\('appinstalled'/);
  assert.match(card, /deferredInstallPrompt\.prompt\(\)/);
  assert.match(card, /id="install-ios"/);
  assert.match(card, /添加到主屏幕/);
  assert.match(card, /display-mode: standalone/);
});

test('my-prompts install entries sit in first-screen hero and last-line footer', () => {
  // 三个入口按钮：首屏 hero、中部 toolbar（原有）、最后一行 footer（不含 JS 选择器引用）
  const triggers = card.match(/<button[^>]*data-install-trigger/g) || [];
  assert.equal(triggers.length, 3, 'install trigger button count must be exactly 3');
  const heroStart = card.indexOf('<section class="hero"');
  const heroEnd = card.indexOf('</section>', heroStart);
  const footStart = card.indexOf('<footer class="foot">');
  const footEnd = card.indexOf('</footer>', footStart);
  assert.ok(heroStart > -1 && footStart > -1);
  assert.ok(card.slice(heroStart, heroEnd).includes('data-install-trigger'), 'hero must carry an install trigger');
  assert.ok(card.slice(heroStart, heroEnd).includes('添加到主屏幕'), 'hero must carry the iOS manual hint');
  assert.ok(card.slice(footStart, footEnd).includes('data-install-trigger'), 'footer must carry an install trigger');
  assert.ok(card.slice(footStart, footEnd).includes('添加到主屏幕'), 'footer must carry the iOS manual hint');
  // footer 是页面最后一个内容区块
  const lastBlock = card.lastIndexOf('</footer>');
  assert.ok(card.slice(lastBlock).indexOf('<footer') === -1);
});

test('my-prompts install buttons are hidden by default (no inert default button)', () => {
  // 首屏与页尾按钮必须带 hidden 初始属性，仅在 beforeinstallprompt / iOS 说明时出现
  assert.match(card, /<button[^>]*data-install-trigger hidden>/);
  // JS 初始化即隐藏全部触发按钮，事件驱动显示
  assert.match(card, /setInstallVisible\(false\)/);
  assert.match(card, /function setInstallVisible/);
});

test('my-prompts card keeps existing localStorage copy-count import/export intact', () => {
  assert.match(card, /id="export-btn"/);
  assert.match(card, /id="import-btn"/);
  assert.match(card, /KEY = 'infocard-my-prompts:copy-counts:v1:20261115-my-prompts'/);
  assert.match(card, /format: 'infocard-my-prompts-copy-counts'/);
  // 计数/导入导出逻辑体量未被 PWA 改动破坏
  assert.match(card, /function handleImport\(text\)/);
});

test('my-prompts card first-screen revision remains in place', () => {
  assert.match(card, /\.hero\{padding:20px min\(5vw,44px\) 14px/);
  assert.match(card, /'copy-btn small'/);
  assert.match(card, /使用指数 · 26 项按复制次数降序/);
});
