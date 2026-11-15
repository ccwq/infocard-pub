'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..', '..');
const cardPath = path.join(repoRoot, 'docs', '20261109-herdr-cookbook.html');
const manifestPath = path.join(repoRoot, 'docs', 'herdr-cookbook.webmanifest');

const read = (p) => fs.readFileSync(p, 'utf8');
const card = read(cardPath);
const manifest = JSON.parse(read(manifestPath));

test('herdr-cookbook PWA manifest: independent id, entry, standalone display', () => {
  assert.equal(manifest.name, 'Herdr Cookbook');
  assert.equal(manifest.short_name, 'Herdr手册');
  assert.equal(manifest.display, 'standalone');
  // 独立 id，不能与站点 PWA（id=/infocard-pub/）相同
  assert.equal(manifest.id, '/infocard-pub/docs/herdr-cookbook');
  assert.notEqual(manifest.id, '/infocard-pub/');
  // start_url 必须落在 scope 内
  assert.ok(manifest.start_url.startsWith(manifest.scope));
  assert.equal(manifest.start_url, '/infocard-pub/docs/20261109-herdr-cookbook.html');
  assert.equal(manifest.scope, '/infocard-pub/docs/20261109-herdr-cookbook.html');
  assert.ok(!'/infocard-pub/docs/20261115-my-prompts.html'.startsWith(manifest.scope));
  assert.ok(!'/infocard-pub/'.startsWith(manifest.scope));
});

test('herdr-cookbook PWA manifest icons exist on disk and are declared', () => {
  const purposes = manifest.icons.map((i) => i.purpose);
  assert.ok(purposes.includes('any'));
  assert.ok(purposes.includes('maskable'));
  assert.equal(manifest.icons.length, 4, 'icon four-piece set: svg + 192 + 512 + maskable 512');
  for (const icon of manifest.icons) {
    const rel = icon.src.replace('/infocard-pub/', '');
    assert.ok(fs.existsSync(path.join(repoRoot, rel)), `missing icon file: ${icon.src}`);
    if (icon.sizes.includes('x')) {
      const [w] = icon.sizes.split('x').map(Number);
      assert.ok(w >= 192, `icon ${icon.src} too small for install: ${w}`);
    }
  }
});

test('herdr-cookbook card links its own manifest and theme assets', () => {
  assert.match(card, /<link rel="manifest" href="herdr-cookbook\.webmanifest">/);
  assert.match(card, /<meta name="theme-color" content="#0a0a0a">/);
  assert.match(card, /<link rel="apple-touch-icon" href="herdr-cookbook-icon-512\.png">/);
  assert.match(card, /<meta name="apple-mobile-web-app-title" content="Herdr Cookbook">/);
  assert.match(card, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(card, /<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">/);
});

test('herdr-cookbook card reuses the site service worker and adds no new worker file', () => {
  assert.match(card, /navigator\.serviceWorker\.register\('\/infocard-pub\/sw\.js'/);
  // 不得走 docs/sw.js：根目录下的 sw.js 才是当前全站 SW
  assert.ok(!card.includes("'./sw.js'"));
  assert.ok(fs.existsSync(path.join(repoRoot, 'sw.js')), 'site sw.js must remain in place');
  // 本次任务不新增任何 per-card worker
  assert.ok(!fs.existsSync(path.join(repoRoot, 'docs', 'herdr-cookbook-sw.js')), 'no per-card service worker file');
  // 不修改全站 SW：站点 sw.js 不出现本卡路径的预缓存条目
  const siteSw = read(path.join(repoRoot, 'sw.js'));
  assert.ok(!siteSw.includes('herdr-cookbook'));
});

test('herdr-cookbook card install entry handles prompt, iOS and standalone states', () => {
  assert.match(card, /addEventListener\('beforeinstallprompt'/);
  assert.match(card, /addEventListener\('appinstalled'/);
  assert.match(card, /deferredInstallPrompt\.prompt\(\)/);
  assert.match(card, /userChoice/);
  assert.match(card, /添加到主屏幕/);
  assert.match(card, /display-mode: standalone/);
  // 非一键安装浏览器的菜单手动添加说明
  assert.match(card, /浏览器菜单/);
});

test('herdr-cookbook install entries sit in first-screen hero and last-line footer', () => {
  // 本卡无中部工具栏：两个入口按钮 = 首屏 hero（header#hero）+ 页尾 footer
  const triggers = card.match(/<button[^>]*data-install-trigger/g) || [];
  assert.equal(triggers.length, 2, 'install trigger button count must be exactly 2');
  const heroStart = card.indexOf('<header class="header" id="hero">');
  const heroEnd = card.indexOf('</header>', heroStart);
  const footStart = card.indexOf('<footer');
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

test('herdr-cookbook install buttons are hidden by default (no inert default button)', () => {
  // 首屏与页尾按钮必须带 hidden 初始属性，仅在 beforeinstallprompt / iOS 说明时出现
  assert.match(card, /<button[^>]*data-install-trigger hidden>/);
  // JS 初始化即隐藏全部触发按钮，事件驱动显示
  assert.match(card, /setInstallVisible\(false\)/);
  assert.match(card, /function setInstallVisible/);
});

test('herdr-cookbook card adds no local state and keeps original content intact', () => {
  // 本卡为纯静态阅读卡：不新增 localStorage / 交互状态（skill: 无此类状态/交互的卡不新增）
  assert.ok(!card.includes('localStorage'), 'no new local state on a static card');
  // 原 URL 的正文关键内容保持不变
  assert.match(card, /<title>Herdr Cookbook：从入门到 Agent 协作<\/title>/);
  assert.match(card, /先认清产品边界：三个东西，三套命令/);
  assert.match(card, /irm https:\/\/releases\.herdr\.dev\/app\/install\.ps1/);
  assert.match(card, /hc run --bg --name reviewer codex "Review the current diff"/);
  assert.match(card, /herdr agent wait w1:p2/);
});
