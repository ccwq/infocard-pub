#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

const NAMED = { amp: '&', quot: '"', apos: "'", colon: ':', sol: '/', tab: '\t', newline: '\n' };
function entities(value) {
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (all, entity) => {
    if (entity[0] === '#') { const hex = entity[1].toLowerCase() === 'x'; const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10); try { return String.fromCodePoint(code); } catch { return all; } }
    return Object.hasOwn(NAMED, entity.toLowerCase()) ? NAMED[entity.toLowerCase()] : all;
  });
}
function cssUnescape(value) { return value.replace(/\\([0-9a-f]{1,6})[\t\n\f\r ]?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/\\(.)/gs, '$1'); }
function canonical(value, css = false) { const decoded = css ? cssUnescape(entities(value)) : entities(value); return decoded.replace(/[\u0000-\u0020\u007f]+/g, ''); }
function attrs(tag) { const result = {}; const re = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g; let match; while ((match = re.exec(tag))) result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4]; return result; }
function pushSrcset(out, value) {
  // A data URL owns its first comma; remove complete data candidates before splitting other candidates.
  const withoutData = entities(value).replace(/(?:^|,)\s*data:[^\s]+(?:\s+[^,\s]+)?/gi, '');
  for (const item of withoutData.split(',')) {
    const url = item.trim().split(/[\t\n\f\r ]+/)[0];
    if (url) out.push(url);
  }
}
/* Conservative inventory: only resource-bearing contexts are scanned; comments are stripped.
 * HTML: img/src/srcset, SVG image/use href/xlink:href, object/data, embed+iframe+script/src,
 * stylesheet/icon link/href, audio/video/source/track src/srcset/poster, input[type=image]/src.
 * CSS: url() and @import in style blocks and style attributes. Unknown/malformed schemes fail closed. */
function collect(html) {
  const out = [];
  const clean = String(html).replace(/<!--[\s\S]*?-->/g, ' ');
  const tagRe = /<([a-z][\w:-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagRe.exec(clean))) {
    const name = match[1].toLowerCase(), a = attrs(match[0]);
    const add = key => { if (a[key] !== undefined) out.push(a[key]); };
    if (name === 'img') { add('src'); if (a.srcset) pushSrcset(out, a.srcset); }
    else if (name === 'image' || name === 'use') { add('href'); add('xlink:href'); }
    else if (name === 'object') add('data');
    else if (['embed', 'iframe', 'script', 'audio', 'track'].includes(name)) add('src');
    else if (name === 'video') { add('src'); add('poster'); }
    else if (name === 'source') { add('src'); if (a.srcset) pushSrcset(out, a.srcset); }
    else if (name === 'input' && (a.type || '').toLowerCase() === 'image') add('src');
    else if (name === 'link' && /(?:^|\s)(?:stylesheet|icon|shortcut icon)(?:\s|$)/i.test(a.rel || '')) add('href');
    if (a.style) collectCss(a.style).forEach(value => out.push(value));
  }
  const styles = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while ((match = styles.exec(clean))) collectCss(match[1]).forEach(value => out.push(value));
  return out.map(value => entities(value));
}
function collectCss(css) {
  const out = [], clean = String(css).replace(/\/\*[\s\S]*?\*\//g, ' ');
  let match;
  const url = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi;
  while ((match = url.exec(clean))) out.push(cssUnescape(match[1] ?? match[2] ?? match[3]));
  const imports = /@import\s+(?:url\(\s*)?(?:"([^"]*)"|'([^']*)'|([^\s;)]+))/gi;
  while ((match = imports.exec(clean))) out.push(cssUnescape(match[1] ?? match[2] ?? match[3]));
  return out;
}
function readJson(file, field, errors) { try { const stat = fs.statSync(file); if (!stat.isFile() || !stat.size) throw new Error('must exist and be nonempty'); return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { errors.push({ field, message: error.message }); return null; } }
function stripSuffix(ref) { return ref.split('#', 1)[0].split('?', 1)[0]; }
function networkScheme(ref) { const value = canonical(ref, true); if (value.startsWith('//')) return true; const match = /^([a-z][a-z0-9+.-]*):/i.exec(value); return !!match && !['data'].includes(match[1].toLowerCase()); }
function verifyLocalAssets(bundle, rootDir = process.cwd()) {
  const errors = [], contract = validateBundle(bundle);
  if (!contract.valid) errors.push(...contract.errors.map(error => ({ ...error, field: `bundle.${error.field}` })));
  if (!bundle || typeof bundle.asset_dir !== 'string') return { valid: false, errors, references: [] };
  const manifest = readJson(path.resolve(rootDir, bundle.manifest_path), 'manifest', errors);
  let html = ''; try { html = fs.readFileSync(path.resolve(rootDir, bundle.html_path), 'utf8'); } catch (error) { errors.push({ field: 'html', message: error.message }); }
  const repoLex = path.resolve(rootDir), assetLex = path.resolve(rootDir, bundle.asset_dir); let repoReal = repoLex, assetReal = assetLex;
  try { repoReal = fs.realpathSync(repoLex); assetReal = fs.realpathSync(assetLex); if (assetReal !== repoReal && !assetReal.startsWith(repoReal + path.sep)) errors.push({ field: 'bundle.asset_dir', message: 'must resolve inside repository' }); } catch (error) { errors.push({ field: 'bundle.asset_dir', message: error.message }); }
  const referenced = new Set();
  for (const raw of collect(html)) {
    const ref = raw.trim(); if (!ref || ref.startsWith('#') || /^data:/i.test(canonical(ref, true))) continue;
    if (networkScheme(ref)) { errors.push({ field: 'references', message: `network resource forbidden: ${ref}` }); continue; }
    let decoded; try { decoded = decodeURIComponent(stripSuffix(ref)); } catch { errors.push({ field: 'references', message: `malformed URL encoding: ${ref}` }); continue; }
    const fileLex = decoded.startsWith('/') ? path.resolve(rootDir, '.' + decoded) : path.resolve(path.dirname(path.resolve(rootDir, bundle.html_path)), decoded);
    if (fileLex !== assetLex && !fileLex.startsWith(assetLex + path.sep)) { errors.push({ field: 'references', message: `local resource must stay under ${bundle.asset_dir}: ${ref}` }); continue; }
    let stat, real; try { stat = fs.statSync(fileLex); real = fs.realpathSync(fileLex); } catch { errors.push({ field: 'references', message: `local resource missing/unreadable: ${ref}` }); continue; }
    if (!stat.isFile() || stat.size <= 0) { errors.push({ field: 'references', message: `local resource must be nonempty file: ${ref}` }); continue; }
    if (real !== assetReal && !real.startsWith(assetReal + path.sep)) { errors.push({ field: 'references', message: `local resource symlink escapes asset_dir: ${ref}` }); continue; }
    if (real !== repoReal && !real.startsWith(repoReal + path.sep)) { errors.push({ field: 'references', message: `local resource escapes repository: ${ref}` }); continue; }
    referenced.add(path.relative(rootDir, fileLex).split(path.sep).join('/'));
  }
  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    if (!Array.isArray(manifest.assets)) errors.push({ field: 'manifest.assets', message: 'must be array' });
    else {
      const seen = new Set();
      manifest.assets.forEach((asset, index) => {
        const field = `manifest.assets.${index}`;
        if (!asset || typeof asset !== 'object' || typeof asset.local_path !== 'string' || !asset.local_path) return errors.push({ field, message: 'local_path required' });
        if (Object.hasOwn(asset, 'required') && typeof asset.required !== 'boolean') errors.push({ field, message: 'required must be boolean' });
        if (Object.hasOwn(asset, 'embed') && typeof asset.embed !== 'boolean') errors.push({ field, message: 'embed must be boolean' });
        const localPath = asset.local_path.replace(/\\/g, '/');
        if (path.posix.isAbsolute(localPath) || path.posix.normalize(localPath) !== localPath || localPath.split('/').includes('..')) errors.push({ field, message: 'local_path must be a normalized relative path without traversal' });
        if (seen.has(localPath)) errors.push({ field, message: `duplicate local_path: ${localPath}` }); else seen.add(localPath);
        const required = asset.required === false && asset.embed === false ? false : (asset.required === true || asset.embed === true || (!Object.hasOwn(asset, 'required') && !Object.hasOwn(asset, 'embed')));
        if (!required) return;
        const local = localPath.startsWith(bundle.asset_dir + '/') ? localPath : `${bundle.asset_dir}/${localPath}`;
        if (!referenced.has(path.posix.normalize(local))) errors.push({ field, message: `embed-required asset not referenced: ${asset.local_path}` });
      });
    }
  }
  return { valid: errors.length === 0, errors, references: [...referenced].sort() };
}
function main(argv) { const index = argv.indexOf('--bundle'); if (index < 0 || !argv[index + 1]) { process.stdout.write(JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }], references: [] }) + '\n'); return 2; } try { const result = verifyLocalAssets(loadBundle(path.resolve(argv[index + 1])), process.cwd()); process.stdout.write(JSON.stringify(result) + '\n'); return result.valid ? 0 : 1; } catch (error) { process.stdout.write(JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }], references: [] }) + '\n'); return 1; } }
if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { verifyLocalAssets, main, collect };
