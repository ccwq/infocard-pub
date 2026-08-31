'use strict';

const path = require('node:path');
const { loadArchitecture, validateArchitecture } = require('./lib/infocard-layered-architecture');

const root = path.resolve(process.argv[2] || process.cwd());
const report = validateArchitecture(root, loadArchitecture(root));
process.stdout.write(`${JSON.stringify(report)}\n`);
process.exitCode = report.errors.length ? 1 : 0;
