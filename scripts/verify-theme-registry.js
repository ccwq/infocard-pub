#!/usr/bin/env node
'use strict';

const { validateThemeRegistry } = require('./lib/theme-registry');

try {
  const result = validateThemeRegistry(process.cwd());
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exitCode = result.valid ? 0 : 1;
} catch (error) {
  process.stdout.write(JSON.stringify({ valid: false, errors: [error.message] }, null, 2) + '\n');
  process.exitCode = 1;
}

module.exports = { main: validateThemeRegistry };
