#!/usr/bin/env node
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { buildIndexData, writeGeneratedArtifacts, writeIncrementalArtifacts } = require("./index-build-lib");
const ROOT = path.resolve(__dirname, "..");

function git(args) {
  try { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; }
}

function changedFiles() {
  const files = new Set();
  for (const item of git(["diff", "--name-only", "HEAD"]).split(/\r?\n/).filter(Boolean)) files.add(item.replace(/\\/g, "/"));
  for (const item of git(["ls-files", "--others", "--exclude-standard"]).split(/\r?\n/).filter(Boolean)) files.add(item.replace(/\\/g, "/"));
  return [...files];
}

function classify(files) {
  const source = files.filter((file) => !file.startsWith("dist/") && file !== "_index.yaml" && file !== "index.html");
  const global = source.some((file) => file === "_taxonomy.yaml" || file === "_themes.yaml" || file === "themes.html" || file === "manifest.json" || file === "sw.js" || file.startsWith("theme/") || file.startsWith("scripts/"));
  const cardMeta = source.filter((file) => file.startsWith("docs/") && file.endsWith(".meta.yaml"));
  const cardHtml = source.filter((file) => file.startsWith("docs/") && file.endsWith(".html") && file !== "docs/index.html");
  const deletedMeta = files.filter((file) => file.startsWith("docs/") && file.endsWith(".meta.yaml") && !fs.existsSync(path.join(ROOT, file)));
  const docsSupport = source.filter((file) => file.startsWith("docs/") && (!file.endsWith(".html") || file === "docs/index.html") && !file.endsWith(".meta.yaml"));
  return { source, global, cardMeta, cardHtml, deletedMeta, changedDocs: [...new Set([...cardMeta, ...cardHtml, ...docsSupport])], changedAssets: source.filter((file) => file.startsWith("assets/") || file.startsWith("static/")) };
}

function deletedCardPaths(deletedMeta, readHead = (file) => git(["show", `HEAD:${file}`])) {
  return deletedMeta.map((file) => {
    try {
      const raw = readHead(file);
      const match = raw.match(/^path:\s*["']?([^"'\r\n]+)["']?\s*$/m);
      if (match) return match[1].trim();
    } catch {}
    return file.replace(/\.meta\.yaml$/, ".html");
  });
}

function selectBuildMode({ files, forceFull = false, hasSnapshot = true }) {
  const info = classify(files);
  if (!forceFull && info.source.length === 0) return { mode: "noop", info };
  return { mode: forceFull || info.global || !hasSnapshot ? "full" : "incremental", info };
}

function hasFullFlag(args) { return args.includes("--full") || args.includes("-f"); }

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
  const args = new Set(process.argv.slice(2));
  const forceFull = hasFullFlag([...args]);
  const selection = selectBuildMode({ files: changedFiles(), forceFull, hasSnapshot: fs.existsSync(path.join(ROOT, "_index.yaml")) });
  const { info, mode } = selection;
  if (mode === "noop") {
    console.log("[build-site] mode=noop (no effective source changes)");
    return;
  }
  const full = mode === "full";
  const buildTimestamp = shanghaiBuildTimestamp();
  console.log(`[build-site] mode=${full ? "full" : "incremental"} build_ts=${buildTimestamp} Asia/Shanghai`);
  if (full || info.cardMeta.length || info.cardHtml.length) {
    runSyncBuildTimestamps(buildTimestamp);
    if (full) runFixMetaShape();
    if (full) runVerifyMetaTimestamps();
  }
  if (full) {
    const indexData = buildIndexData();
    writeGeneratedArtifacts(indexData);
    console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
    return;
  }
  let indexData;
  try {
    indexData = buildIndexData({
      metaPaths: info.cardMeta.map((file) => path.join(ROOT, file)),
      removedPaths: deletedCardPaths(info.deletedMeta),
    });
  } catch (error) {
    console.warn(`[build-site] incremental snapshot unavailable; falling back to full: ${error.message}`);
    indexData = buildIndexData();
    writeGeneratedArtifacts(indexData);
    console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
    return;
  }
  writeIncrementalArtifacts(indexData, [...new Set([...info.changedDocs, ...info.changedAssets])], { indexChanged: info.changedDocs.length > 0 });
  console.log(`[build-site] updated ${info.changedDocs.length} card file(s), index count=${indexData._count}`);
}

module.exports = { changedFiles, classify, deletedCardPaths, hasFullFlag, selectBuildMode };

if (require.main === module) main();
