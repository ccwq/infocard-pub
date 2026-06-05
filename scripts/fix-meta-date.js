#!/usr/bin/env node
/**
 * 根据每个 meta 文件指向的 HTML 文件 git 提交时间，按安全规则补齐元数据。
 *
 * 默认 dry-run，只预览差异；加 --write 才真正写回。
 * 默认只补缺失的 date，不覆盖已有 date。
 * 默认 date 来源为首次提交；可通过 --date-source last 切到最后一次提交。
 * 如需同步 updated，显式增加 --sync-updated。
 * 如需强制覆盖已有 date / updated，增加 --force。
 *
 * 用法：
 *   node scripts/fix-meta-date.js
 *   node scripts/fix-meta-date.js --write --date-source first
 *   node scripts/fix-meta-date.js --write --date-source last
 *   node scripts/fix-meta-date.js --write --date-source first --sync-updated
 *   node scripts/fix-meta-date.js --write --date-source last --sync-updated --force
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const META_SUFFIX = '.meta.yaml';
const DATE_LINE_RE = /^(date:\s*)(["']?)([^\r\n"']*)(\2)\s*$/m;
const UPDATED_LINE_RE = /^(updated:\s*)(["']?)([^\r\n"']*)(\2)\s*$/m;
const PATH_LINE_RE = /^(path:\s*)([^\r\n]+)\s*$/m;

const args = new Set(process.argv.slice(2));
const argList = process.argv.slice(2);
const shouldWrite = args.has('--write');
const shouldForce = args.has('--force');
const shouldSyncUpdated = args.has('--sync-updated');
const shouldShowHelp = argList.length === 0 || args.has('-h') || args.has('--help');
const DEFAULT_DATE_SOURCE = 'first';

function printHelp() {
  console.log('fix-meta-date');
  console.log('');
  console.log('根据每个 meta 文件指向的 HTML 文件 git 提交时间，按安全规则补齐元数据。');
  console.log('');
  console.log('用法：');
  console.log('  node scripts/fix-meta-date.js --write --date-source first');
  console.log('  node scripts/fix-meta-date.js --write --date-source last');
  console.log('  node scripts/fix-meta-date.js --write --date-source first --sync-updated');
  console.log('  node scripts/fix-meta-date.js --write --date-source last --sync-updated --force');
  console.log('');
  console.log('参数：');
  console.log('  -h, --help           打印帮助');
  console.log('  --write              真正写回文件；默认仅预览');
  console.log('  --date-source <v>    git 时间来源，可选 first / last；默认 first');
  console.log('  --sync-updated       同时处理 updated 字段；默认只处理 date');
  console.log('  --force              覆盖已有 date / updated；默认仅补全缺失字段');
}

function getArgValue(flagName) {
  const flagIndex = argList.indexOf(flagName);
  if (flagIndex === -1) {
    return null;
  }

  const nextValue = argList[flagIndex + 1];
  if (!nextValue || nextValue.startsWith('--')) {
    throw new Error(`参数 ${flagName} 缺少值`);
  }

  return nextValue;
}

function resolveDateSource() {
  const rawValue = getArgValue('--date-source');
  if (!rawValue) {
    return DEFAULT_DATE_SOURCE;
  }

  if (rawValue !== 'first' && rawValue !== 'last') {
    throw new Error(`参数 --date-source 仅支持 first 或 last，当前收到: ${rawValue}`);
  }

  return rawValue;
}

const dateSource = resolveDateSource();

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

function getGitCommitDate(targetPath, source) {
  const gitArgs =
    source === 'first'
      ? ['log', '--reverse', '--date=format-local:%Y-%m-%d %H:%M:%S', '--format=%cd', '--', targetPath]
      : ['log', '-1', '--date=format-local:%Y-%m-%d %H:%M:%S', '--format=%cd', '--', targetPath];

  try {
    const output = execFileSync('git', gitArgs, {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    if (!output.length) {
      return null;
    }

    return source === 'first' ? output[0] : output[output.length - 1];
  } catch (error) {
    return null;
  }
}

function replaceOrInsertYamlLine(text, fieldName, regex, nextValue) {
  if (regex.test(text)) {
    return text.replace(regex, `$1"${nextValue}"`);
  }

  const pathMatch = text.match(PATH_LINE_RE);
  if (!pathMatch) {
    throw new Error(`缺少 path 字段，无法安全插入 ${fieldName}`);
  }

  return text.replace(PATH_LINE_RE, `${pathMatch[0]}\n${fieldName}: "${nextValue}"`);
}

function main() {
  if (shouldShowHelp) {
    printHelp();
    return;
  }

  // Keep the default mode safe for build automation: only fill missing values
  // unless the caller explicitly opts into replacement with --force.
  const metaFiles = walkMetaFiles(DOCS_DIR);
  const summary = {
    scanned: 0,
    changed: 0,
    skipped: 0,
    missingHtml: 0,
    missingGitHistory: 0,
    unchanged: 0,
    invalidMeta: 0,
    errors: 0,
  };

  console.log(
    `[fix-meta-date] mode=${shouldWrite ? 'write' : 'dry-run'} force=${shouldForce ? 'true' : 'false'} syncUpdated=${shouldSyncUpdated ? 'true' : 'false'} dateSource=${dateSource} files=${metaFiles.length}`
  );

  for (const metaFile of metaFiles) {
    summary.scanned += 1;
    const metaRelative = toRepoRelative(metaFile);

    try {
      const raw = readText(metaFile);
      const currentDate = extractYamlScalar(raw, DATE_LINE_RE, 'date');
      const currentUpdated = extractYamlScalar(raw, UPDATED_LINE_RE, 'updated');
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

      const commitDate = getGitCommitDate(htmlRelative, dateSource);
      if (!commitDate) {
        summary.missingGitHistory += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | HTML 无 git 历史 -> ${htmlRelative}`);
        continue;
      }

      const nextDate = !currentDate || shouldForce ? commitDate : currentDate;
      const nextUpdated = shouldSyncUpdated && (!currentUpdated || shouldForce) ? commitDate : currentUpdated;
      const dateChanged = nextDate !== currentDate;
      const updatedChanged = shouldSyncUpdated && nextUpdated !== currentUpdated;

      if (!dateChanged && !updatedChanged) {
        summary.unchanged += 1;
        summary.skipped += 1;
        console.log(`SKIP ${metaRelative} | 无需变更`);
        continue;
      }

      let nextText = raw;
      if (dateChanged) {
        nextText = replaceOrInsertYamlLine(nextText, 'date', DATE_LINE_RE, nextDate);
      }
      if (updatedChanged) {
        nextText = replaceOrInsertYamlLine(nextText, 'updated', UPDATED_LINE_RE, nextUpdated);
      }

      summary.changed += 1;
      console.log(
        `CHANGE ${metaRelative} | date: ${currentDate || '<missing>'} -> ${nextDate}${shouldSyncUpdated ? ` | updated: ${currentUpdated || '<missing>'} -> ${nextUpdated || '<missing>'}` : ''}`
      );

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
  console.log(`- unchanged: ${summary.unchanged}`);
  console.log(`- invalidMeta: ${summary.invalidMeta}`);
  console.log(`- errors: ${summary.errors}`);

  if (!shouldWrite) {
    console.log('');
    console.log('提示：当前为 dry-run，仅预览结果；如需真正写回，请添加 --write。');
  }
}

main();
