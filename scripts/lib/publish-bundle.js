'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ALLOWED_STYLES = new Set([
  'darkblue', 'redswiss', 'hardblue', 'main-style', 'darkgreen',
  'graph-paper', 'handline', 'wood', 'black-head', 'pixelstack',
  'q-style', 'paper-warm', 'white-purple', 'color-material',
]);

function loadBundle(bundlePath) {
  return JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
}

function isRelativePath(value) {
  return typeof value === 'string'
    && value.length > 0
    && !path.posix.isAbsolute(value)
    && !value.split('/').includes('..')
    && value === value.replaceAll('\\', '/');
}

function validateBundle(bundle) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });

  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
    return { valid: false, errors: [{ field: 'bundle', message: 'must be an object' }] };
  }

  const slug = bundle.slug;
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    add('slug', 'must use lowercase kebab-case');
  } else if (/^\d{8}-/.test(slug)) {
    add('slug', 'must not start with YYYYMMDD-');
  }

  const expectedHtml = typeof slug === 'string'
    ? new RegExp(`^docs/\\d{8}-${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.html$`)
    : null;
  if (typeof bundle.html_path !== 'string' || !expectedHtml || !expectedHtml.test(bundle.html_path)) {
    add('html_path', 'must be docs/YYYYMMDD-${slug}.html');
  }
  if (bundle.meta_path !== `${bundle.html_path}.meta.yaml`) {
    add('meta_path', 'must equal html_path + .meta.yaml');
  }
  if (bundle.asset_dir !== `assets/img/${slug}`) {
    add('asset_dir', 'must be assets/img/${slug}');
  }
  if (bundle.manifest_path !== `${bundle.asset_dir}/manifest.json`) {
    add('manifest_path', 'must be asset_dir/manifest.json');
  }

  try {
    const url = new URL(bundle.source_url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
  } catch (_) {
    add('source_url', 'must be a valid http(s) URL');
  }

  if (!ALLOWED_STYLES.has(bundle.style)) add('style', 'must be an allowed repository style');
  if (typeof bundle.category !== 'string' || bundle.category.trim() === '') add('category', 'must be non-empty');
  if (!Array.isArray(bundle.keywords) || bundle.keywords.length === 0
      || bundle.keywords.some((value) => typeof value !== 'string' || value.trim() === '')) {
    add('keywords', 'must be a non-empty array of non-empty strings');
  }

  if (!bundle.wiki || typeof bundle.wiki !== 'object') {
    add('wiki.raw_path', 'is required and must be relative');
    add('wiki.knowledge_path', 'is required and must be relative');
  } else {
    if (!isRelativePath(bundle.wiki.raw_path)) add('wiki.raw_path', 'is required and must be relative');
    if (!isRelativePath(bundle.wiki.knowledge_path)) add('wiki.knowledge_path', 'is required and must be relative');
  }

  return { valid: errors.length === 0, errors };
}

function bundleAllowlist(bundle) {
  return [
    bundle.html_path,
    bundle.meta_path,
    `${bundle.asset_dir}/**`,
    '_index.yaml',
    'index.html',
  ];
}

module.exports = { ALLOWED_STYLES, loadBundle, validateBundle, bundleAllowlist };
