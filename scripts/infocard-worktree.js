#!/usr/bin/env node
'use strict';

const { cleanupWorktrees, fixedWorktreeRoot, listWorktrees, resolveWorktreePath } = require('./lib/infocard-worktree');

function parseOptions(argv) {
  const options = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) { options._.push(arg); continue; }
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) { options[key] = true; continue; }
    options[key] = value;
    index += 1;
  }
  return options;
}

function printJson(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
}

function printPathOrJson(pathValue, options) {
  if (options.plain) process.stdout.write(pathValue + '\n');
  else printJson({ path: pathValue });
}

function main(argv) {
  const command = argv[0];
  const options = parseOptions(argv.slice(1));
  if (command === 'root') {
    printJson({ root: fixedWorktreeRoot() });
    return 0;
  }
  if (command === 'resolve') {
    printPathOrJson(resolveWorktreePath({ runId: options['run-id'], slug: options.slug }), options);
    return 0;
  }
  if (command === 'list') {
    printJson(listWorktrees({ repo: options.repo || process.cwd() }));
    return 0;
  }
  if (command === 'cleanup') {
    printJson(cleanupWorktrees({ repo: options.repo || process.cwd(), confirm: options.confirm }));
    return options.confirm === 'del-rm' ? 0 : 2;
  }
  printJson({
    valid: false,
    error: 'usage: infocard-worktree.js root|resolve|list|cleanup',
  });
  return 2;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { main };
