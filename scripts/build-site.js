#!/usr/bin/env node
const { execFileSync } = require("child_process");
const path = require("path");
const { buildIndexData, writeGeneratedArtifacts } = require("./index-build-lib");

function runVerifyMetaTimestamps() {
  const script = path.join(__dirname, "verify-meta-timestamps.js");
  execFileSync(process.execPath, [script], { stdio: "inherit" });
}

function shanghaiBuildTimestamp() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date()).reduce((out, part) => ({ ...out, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function runSyncBuildTimestamps(timestamp) {
  const script = path.join(__dirname, "sync-build-timestamps.js");
  execFileSync(process.execPath, [script, "--timestamp", timestamp], { stdio: "inherit" });
}

function runFixMetaShape() {
  // Normalize mechanical meta shape before strict index validation:
  // date/updated quotes, description->desc, safe path correction.
  const script = path.join(__dirname, "fix-meta-shape.js");
  execFileSync(process.execPath, [script, "--write"], { stdio: "inherit" });
}

function main() {
  const buildTimestamp = shanghaiBuildTimestamp();
  console.log(`[build-site] build_ts=${buildTimestamp} Asia/Shanghai`);
  runSyncBuildTimestamps(buildTimestamp);
  runFixMetaShape();
  runVerifyMetaTimestamps();
  const indexData = buildIndexData();
  writeGeneratedArtifacts(indexData);
  console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
}

main();
