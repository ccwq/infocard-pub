#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * register-theme.js --slug <slug> --title <skill-name> [options]
 *
 * Theme entry scaffold for _themes.yaml. Safe-by-default:
 *   - dry-run unless --write is passed
 *   - refuses duplicate slug/title
 *   - requires theme/<slug-without-style>.html unless --allow-missing-preview
 *   - only appends a draft YAML entry; you still review description/position/note
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const THEMES_YAML = path.join(ROOT_DIR, '_themes.yaml');

function arg(name, fallback = '') {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1] || '';
  const pref = process.argv.find((a) => a.startsWith(`--${name}=`));
  return pref ? pref.split('=').slice(1).join('=') : fallback;
}
const shouldWrite = process.argv.includes('--write');
const allowMissingPreview = process.argv.includes('--allow-missing-preview');
const slug = arg('slug');
const title = arg('title') || (slug ? `infocard-${slug}` : '');
const subtitle = arg('subtitle', '待审主题 / draft scaffold');
const pill = arg('pill', slug ? slug.replace(/-style$/, '').replace(/[^a-z0-9]+/gi, ' ').trim().toUpperCase().slice(0, 18) : 'DRAFT');
const description = arg('description', 'TODO: 请补充主题定位、视觉特征、适用内容与边界。');
const note = arg('note', 'TODO: 请补充适用/不适用场景；生成后必须人工审查。');
const cssClass = arg('css-class', slug ? slug.replace(/-style$/, '').replace(/[^a-z0-9_-]/gi, '-') : 'draft');
const swatch = (arg('swatch', '#FFF5E6,#2D1B00,#E65100,#81D4FA,#1E5CB5').split(',').map((s) => s.trim()).filter(Boolean));
const position = arg('position', '99');
const preview = arg('preview', `./theme/${cssClass}.html`);

if (!slug || !title || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.error('Usage: node scripts/register-theme.js --slug pixelstack-style --title infocard-pixelstack-style --write');
  process.exit(2);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`[register-theme] FAIL invalid slug: ${slug}`);
  process.exit(1);
}
const raw = fs.readFileSync(THEMES_YAML, 'utf8');
if (new RegExp(`^\s*-\s+slug:\s+${slug}\s*$`, 'm').test(raw)) {
  console.error(`[register-theme] FAIL duplicate slug in _themes.yaml: ${slug}`);
  process.exit(1);
}
if (raw.includes(`title: ${title}`)) {
  console.error(`[register-theme] FAIL duplicate title in _themes.yaml: ${title}`);
  process.exit(1);
}
const previewPath = preview.replace(/^\.\//, '');
if (!allowMissingPreview && !fs.existsSync(path.join(ROOT_DIR, previewPath))) {
  console.error(`[register-theme] FAIL preview missing: ${previewPath} (use --allow-missing-preview for draft)`);
  process.exit(1);
}
function q(v) { return `"${String(v).replace(/"/g, '\\"')}"`; }
const entry = `
  - slug: ${slug}
    css_class: ${cssClass}
    pill: ${pill}
    position: ${position}
    title: ${title}
    subtitle: ${subtitle}
    description: ${description}
    keywords:
      - TODO
    swatch:
${swatch.map((c) => `      - ${q(c)}`).join('\n')}
    preview_url: ${preview}
    ref_links:
      - title: ${slug} preview
        href: ${preview}
        note: 新主题预览页
    note: ${note}
`;

console.log(`[register-theme] ${shouldWrite ? 'APPEND' : 'DRY-RUN'} slug=${slug} title=${title} preview=${preview}`);
console.log(entry);
if (shouldWrite) {
  fs.writeFileSync(THEMES_YAML, raw.replace(/\s*$/, '') + '\n' + entry, 'utf8');
  console.log('[register-theme] wrote _themes.yaml; now run: python3 scripts/rebuild_themes.py');
}
