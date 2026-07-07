#!/usr/bin/env node
/**
 * Verify timestamp discipline for changed infocard sidecar metadata.
 *
 * Scope: only metadata files under docs/ touched by the current git diff
 * (staged, unstaged, and untracked). This avoids blocking normal publishing on
 * historical legacy metadata while still gating every new/rebuilt card.
 *
 * Required release timestamp format:
 *   date: "YYYY-MM-DD HH:MM:SS"
 *   updated: "YYYY-MM-DD HH:MM:SS"
 *
 * Semantics:
 * - New cards must have both date and updated.
 * - The two fields are Asia/Shanghai wall-clock strings, not ISO strings.
 * - No bare YAML dates, no date-only values, no timezone suffixes, no `T`.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const TS_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
}

function git(args) {
  return execFileSync("git", args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function collectChangedMetaFiles() {
  const files = new Set();

  // Staged + unstaged tracked changes.
  const tracked = git(["diff", "--name-only", "HEAD"]);
  for (const line of tracked.split(/\r?\n/).filter(Boolean)) files.add(normalizeSlashes(line));

  // Untracked sidecars that are not in HEAD yet.
  const untracked = git(["ls-files", "--others", "--exclude-standard", "--", "docs"]);
  for (const line of untracked.split(/\r?\n/).filter(Boolean)) files.add(normalizeSlashes(line));

  return [...files].filter((file) => file.startsWith("docs/") && file.endsWith(".meta.yaml"));
}

function getTopLevelScalar(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) return null;
  return match[1].trim();
}

function unquote(value) {
  if (value == null) return value;
  return value.replace(/^["']|["']$/g, "");
}

function isQuoted(value) {
  return /^".*"$/.test(value) || /^'.*'$/.test(value);
}

function main() {
  const files = collectChangedMetaFiles();
  if (!files.length) {
    console.log("[verify-meta-timestamps] OK: no changed meta sidecars");
    return;
  }

  const errors = [];
  for (const rel of files) {
    const abs = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(abs)) continue; // deleted sidecar: deletion workflow handles index rebuild.
    const raw = fs.readFileSync(abs, "utf8");
    for (const key of ["date", "updated"]) {
      const scalar = getTopLevelScalar(raw, key);
      if (scalar == null || scalar === "") {
        errors.push(`${rel}: missing required ${key}; changed/new cards must carry both date and updated`);
        continue;
      }
      const value = unquote(scalar);
      if (!isQuoted(scalar)) {
        errors.push(`${rel}: ${key} must be quoted, got ${scalar}`);
      }
      if (!TS_RE.test(value)) {
        errors.push(`${rel}: ${key} must be Asia/Shanghai wall-clock "YYYY-MM-DD HH:MM:SS", got ${scalar}`);
      }
      if (/[TZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
        errors.push(`${rel}: ${key} must not use ISO/T/Z/timezone suffix, got ${scalar}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(["Timestamp metadata gate failed:", ...errors.map((line) => `- ${line}`), "", "Use:", "  publish_ts=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')", "  date: \"$publish_ts\"", "  updated: \"$publish_ts\""].join("\n"));
  }

  console.log(`[verify-meta-timestamps] OK: ${files.length} changed meta sidecar(s)`);
}

main();
