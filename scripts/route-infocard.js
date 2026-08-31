'use strict';
const fs = require('node:fs');
const { classifyRoute } = require('./lib/infocard-route');

function main(argv = process.argv.slice(2)) {
  const input = argv[0] ? JSON.parse(fs.readFileSync(argv[0], 'utf8')) : JSON.parse(fs.readFileSync(0, 'utf8'));
  const result = classifyRoute(input);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return 0;
}
if (require.main === module) { try { process.exitCode = main(); } catch (cause) { console.error(cause.message); process.exitCode = 2; } }
module.exports = { main };
