#!/usr/bin/env node
/**
 * 根据每个 meta 文件指向的 HTML 文件 git 最近一次提交时间，回填 meta.date。
 *
 * 默认 dry-run，只预览差异；加 --write 才真正写回。
 * 默认跳过已经包含时分秒的 date；如需覆盖，增加 --force。
 *
 * 用法：
 *   node scripts/fix-meta-date.js
 *   node scripts/fix-meta-date.js --write
 *   node scripts/fix-meta-date.js --write --force
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const META_SUFFIX = '.meta.yaml';
const DATE_LINE_RE = /^(date:\s*)(["']?)([^\r\n"']*)(\2)\s*$/m;
const PATH_LINE_RE = /^(path:\s*)([^\r\n]+)\s*$/m;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const shouldForce = args.has('--force');

function walkMetaFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMetaFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(META_SUFFIX)) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function toRepoRelative(absolutePath) {
  return path.relative(ROOT_DIR, absolutePath).split(path.sep).join('/');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractYamlScalar(text, regex, fieldName) {
  const match = text.match(regex);
  if (!match) {
    return null;
  }
  return match[3] ?? match[2] ?? null;
}

function getMetaPathValue(text) {
  const match = text.match(PATH_LINE_RE);
  if (!match) {
    return null;
  }
  return match[2].trim().replace(/^['"]|['"]$/g, '');
}

function hasFullDatetime(dateValue) {
  return DATETIME_RE.test((dateValue || '').trim());
}

function getLatestGitCommitDate(targetPath) {
  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--date=format-local:%Y-%m-%d %H:%M:%S', '--format=%cd', '--', targetPath],
      {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    ).trim();

    return output || null;
  } catch (error) {
    return null;
  }
}

function replaceDateLine(text, nextDate) {
  if (DATE_LINE_RE.test(text)) {
    return text.replace(DATE_LINE_RE, `$1"${nextDate}"`);
  }

  const pathMatch = text.match(PATH_LINE_RE);
  if (!pathMatch) {
    throw new Error('缺少 path 字段，无法安全插入 date');
  }

  return text.replace(PATH_LINE_RE, `${pathMatch[0]}\ndate: "${nextDate}"`);
}

function main() {
  const metaFiles = walkMetaFiles(DOCS_DIR);
  const summary = {
    scanned: 0,
    changed: 0,
    skipped: 0,
    missingHtml: 0,
    missingGitHistory: 0,
    alreadyDatetime: 0,
    unchanged: 0,
    invalidMeta: 0,
    errors: 0,
  };

  console.log(
    `[fix-meta-date] mode=${shouldWrite ? 'write' : 'dry-run'} force=${shouldForce ? 'true' : 'false'} files=${metaFiles.length}`
  );

  for (const metaFile of metaFiles) {
    summary.scanned += 1;
    const metaRelative = toRepoRelative(metaFile);

    try {
      const raw = readText(metaFile);
      const currentDate = extractYamlScalar(raw, DATE_LINE_RE, 'date');
      const htmlRelative = getMetaPathValue(raw);

      if (!htmlRelative) {
        summary.invalidMeta += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | 缺少 path 字段`);
        continue;
      }

      const htmlAbsolute = path.join(ROOT_DIR, htmlRelative);
      if (!fs.existsSync(htmlAbsolute)) {
        summary.missingHtml += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | HTML 不存在 -> ${htmlRelative}`);
        continue;
      }

      if (!shouldForce && hasFullDatetime(currentDate)) {
        summary.alreadyDatetime += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | 已是完整时间 -> ${currentDate}`);
        continue;
      }

      const commitDate = getLatestGitCommitDate(htmlRelative);
      if (!commitDate) {
        summary.missingGitHistory += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | HTML 无 git 历史 -> ${htmlRelative}`);
        continue;
      }

      if (currentDate === commitDate) {
        summary.unchanged += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | date 无变化 -> ${commitDate}`);
        continue;
      }

      const nextText = replaceDateLine(raw, commitDate);
      summary.changed += 1;
      console.log(`CHANGE ${metaRelative} | ${currentDate || '<missing>'} -> ${commitDate}`);

      if (shouldWrite) {
        fs.writeFileSync(metaFile, nextText, 'utf8');
      }
    } catch (error) {
      summary.errors += 1;
      console.log(`ERROR ${metaRelative} | ${error.message}`);
    }
  }

  console.log('');
  console.log('[fix-meta-date] summary');
  console.log(`- scanned: ${summary.scanned}`);
  console.log(`- changed: ${summary.changed}`);
  console.log(`- skipped: ${summary.skipped}`);
  console.log(`- missingHtml: ${summary.missingHtml}`);
  console.log(`- missingGitHistory: ${summary.missingGitHistory}`);
  console.log(`- alreadyDatetime: ${summary.alreadyDatetime}`);
  console.log(`- unchanged: ${summary.unchanged}`);
  console.log(`- invalidMeta: ${summary.invalidMeta}`);
  console.log(`- errors: ${summary.errors}`);

  if (!shouldWrite) {
    console.log('');
    console.log('提示：当前为 dry-run，仅预览结果；如需真正写回，请添加 --write。');
  }
}

main();
