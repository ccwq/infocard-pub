#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * quote-meta-dates.js
 *
 * 只做一件事：扫描 docs/ 下所有 .meta.yaml，把 date / updated 字段的
 * 裸 wall-clock 时间戳（如 `date: 2026-06-19 06:08:42`）就地加上双引号，
 * 变成 `date: "2026-06-19 06:08:42"`。
 *
 * 不改时间值本身、不改其它字段、不动已经带引号或纯日期格式的行。
 *
 * 目的：build 期 assertQuotedWallClockFields 不再把"加引号"这件机械事
 * 推给写卡片的人。LLM / 人手新增 meta 时直接写裸时间也能 build 通过。
 *
 * 用法：
 *   node scripts/quote-meta-dates.js          # dry-run
 *   node scripts/quote-meta-dates.js --write  # 实际改写
 *
 * 退出码：
 *   0  无变更或写入成功
 *   1  发生错误
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const META_SUFFIX = '.meta.yaml';

// 仅匹配"裸"的 wall-clock 时间戳（无引号、无时区符号），date / updated 各一条
const BARE_DATE_RE = /^(date:\s*)(?!["'])(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?)\s*$/m;
const BARE_UPDATED_RE = /^(updated:\s*)(?!["'])(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?)\s*$/m;

const argv = process.argv.slice(2);
const shouldWrite = argv.includes('--write');

function walkMetaFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMetaFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(META_SUFFIX)) {
      files.push(full);
    }
  }
  return files.sort();
}

function quoteOnce(text, regex) {
  if (!regex.test(text)) return { text, changed: false, value: null };
  let captured = null;
  const next = text.replace(regex, (_m, prefix, value) => {
    captured = value;
    return `${prefix}"${value}"`;
  });
  return { text: next, changed: true, value: captured };
}

function processFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let out = raw;
  const changes = [];

  const dateStep = quoteOnce(out, BARE_DATE_RE);
  out = dateStep.text;
  if (dateStep.changed) changes.push(`date="${dateStep.value}"`);

  const updatedStep = quoteOnce(out, BARE_UPDATED_RE);
  out = updatedStep.text;
  if (updatedStep.changed) changes.push(`updated="${updatedStep.value}"`);

  if (!changes.length) return null;
  if (shouldWrite) fs.writeFileSync(file, out, 'utf8');
  return changes;
}

function main() {
  const files = walkMetaFiles(DOCS_DIR);
  let touched = 0;
  for (const file of files) {
    try {
      const changes = processFile(file);
      if (!changes) continue;
      touched += 1;
      const rel = path.relative(ROOT_DIR, file).split(path.sep).join('/');
      const verb = shouldWrite ? 'QUOTE' : 'WOULD-QUOTE';
      console.log(`[quote-meta-dates] ${verb} ${rel} | ${changes.join(', ')}`);
    } catch (error) {
      console.error(`[quote-meta-dates] ERROR ${file}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  const mode = shouldWrite ? 'write' : 'dry-run';
  console.log(`[quote-meta-dates] mode=${mode} scanned=${files.length} touched=${touched}`);
}

main();
