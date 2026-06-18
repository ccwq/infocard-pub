#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Backward-compatible wrapper.
 * Date quoting is now handled by fix-meta-shape.js together with other
 * mechanical meta repairs. Keep this entrypoint so old commands keep working.
 */

const { execFileSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'fix-meta-shape.js');
const args = process.argv.slice(2);
execFileSync(process.execPath, [script, ...args], { stdio: 'inherit' });
