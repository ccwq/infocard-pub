#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

function yamlString(value) { return JSON.stringify(String(value)); }
function generateMeta(bundle) {
  return [
    `slug: ${bundle.slug}`,
    `path: ${yamlString(bundle.html_path)}`,
    `style: ${yamlString(bundle.style)}`,
    `category: ${yamlString(bundle.category)}`,
    `source_url: ${yamlString(bundle.source_url)}`,
    `title: ${yamlString('__AGENT2_FILL_TITLE__')}`,
    `desc: ${yamlString('__AGENT2_FILL_DESC__')}`,
    `tags: [${yamlString('__AGENT2_FILL_TAGS__')}]`, '',
  ].join('\n');
}
function output(body) { process.stdout.write(`${JSON.stringify(body)}\n`); }
function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
function assertSafeTarget(root, target) {
  if (!isWithin(root, target)) throw new Error('meta_path must remain within repository root');
  const relative = path.relative(root, target);
  let current = root;
  for (const component of relative.split(path.sep)) {
    current = path.join(current, component);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`symlink component refused: ${path.relative(root, current)}`);
    } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
  }
  let parent = path.dirname(target);
  while (!fs.existsSync(parent)) parent = path.dirname(parent);
  if (!isWithin(root, fs.realpathSync(parent))) throw new Error('meta parent resolves outside repository root');
}
function writeMeta(root, target, content, replace) {
  assertSafeTarget(root, target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  assertSafeTarget(root, target);
  const helper = path.join(__dirname, 'lib/safe-meta-write.py');
  const relative = path.relative(root, target);
  const result = spawnSync('python3', [helper, root, relative, replace ? 'replace' : 'create'], {
    input: content,
    encoding: 'utf8',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    let message = result.stderr.trim() || result.stdout.trim() || `safe metadata write failed (${result.status})`;
    try { message = JSON.parse(result.stdout).error || message; } catch (_) {}
    throw new Error(message);
  }
}
function main(argv) {
  const bundleIndex = argv.indexOf('--bundle');
  const write = argv.includes('--write');
  const replace = argv.includes('--replace');
  if (bundleIndex === -1 || !argv[bundleIndex + 1] || (replace && !write)) {
    output({ valid: false, errors: [{ field: 'arguments', message: 'usage: --bundle path [--write [--replace]]' }] }); return 2;
  }
  try {
    const bundle = loadBundle(argv[bundleIndex + 1]);
    const validation = validateBundle(bundle);
    if (!validation.valid) { output({ ...validation, written: false }); return 1; }
    const body = generateMeta(bundle);
    if (!write) { output({ valid: true, errors: [], written: false, path: bundle.meta_path, yaml: body }); return 0; }
    const root = fs.realpathSync(process.cwd());
    const metaPath = path.resolve(root, bundle.meta_path);
    writeMeta(root, metaPath, body, replace);
    output({ valid: true, errors: [], written: true, path: bundle.meta_path }); return 0;
  } catch (error) {
    output({ valid: false, errors: [{ field: 'meta_path', message: error.message }], written: false }); return 1;
  }
}
if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { generateMeta, yamlString, main, assertSafeTarget };
