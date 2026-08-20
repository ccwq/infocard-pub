#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const yaml = require("../assets/home/vendor/js-yaml.min.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const INDEX_PATH = path.join(DIST_DIR, "_index.yaml");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const SOURCE_INDEX_YAML_PATH = path.join(ROOT_DIR, "_index.yaml");
const SOURCE_INDEX_HTML_PATH = path.join(ROOT_DIR, "index.html");
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const INDEX_DATA_START = '<script id="home-index-data" type="application/json">';
const INDEX_DATA_END = "</script>";

function normalizeSlashes(value) {
  return String(value || "").split(path.sep).join("/");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function listMetaFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMetaFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".meta.yaml")) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) =>
    normalizeSlashes(path.relative(ROOT_DIR, a)).localeCompare(
      normalizeSlashes(path.relative(ROOT_DIR, b)),
      "zh-Hans-CN"
    )
  );
}

function formatLocalDate(dateValue) {
  const local = new Date(dateValue.getTime() + SHANGHAI_OFFSET_MS);
  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  const ss = String(local.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function normalizeDateValue(value) {
  if (value == null) return value;
  if (value instanceof Date) {
    // JS-YAML may coerce bare YAML timestamps into Date objects.
    // We keep those as wall-clock strings by reading the UTC fields directly
    // instead of applying an extra timezone shift.
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")} ${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}:${String(value.getUTCSeconds()).padStart(2, "0")}`;
  }
  if (typeof value === "string") {
    const raw = value.trim().replace(/^["']|["']$/g, "");
    if (DATE_ONLY_RE.test(raw)) return raw;
    if (DATETIME_RE.test(raw)) {
      const hasExplicitTimezone = raw.includes("Z") || /[+-]\d{2}:?\d{2}$/.test(raw);
      const isoCandidate = hasExplicitTimezone
        ? raw.replace(" ", "T").replace("Z", "+00:00")
        : `${raw.replace(" ", "T")}+08:00`;
      const parsed = new Date(isoCandidate);
      if (!Number.isNaN(parsed.getTime())) {
        return formatLocalDate(parsed);
      }
    }
    return raw;
  }
  return value;
}

function assertQuotedWallClockFields(raw, metaPath) {
  const fields = [];
  if (new RegExp(`^date:\\s*(?!["'])\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2}(?::\\d{2})?)?\\s*$`, "m").test(raw)) {
    fields.push("date");
  }
  if (new RegExp(`^updated:\\s*(?!["'])\\d{4}-\\d{2}-\\d{2}(?:[ T]\\d{2}:\\d{2}(?::\\d{2})?)?\\s*$`, "m").test(raw)) {
    fields.push("updated");
  }
  if (fields.length) {
    throw new Error(
      `${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: ${fields.join(", ")} must be quoted strings; bare wall-clock timestamps are parsed as YAML timestamps and can drift in the index`
    );
  }
}

function parseSortTsNs(value) {
  const normalized = normalizeDateValue(value);
  if (!normalized || typeof normalized !== "string") return 0;
  if (DATE_ONLY_RE.test(normalized)) {
    const parsed = new Date(`${normalized}T00:00:00+08:00`);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime() * 1_000_000;
  }
  if (DATETIME_RE.test(normalized)) {
    const parsed = new Date(`${normalized.replace(" ", "T")}+08:00`);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime() * 1_000_000;
  }
  return 0;
}

function formatSortDate(tsNs) {
  if (!tsNs) return "";
  return formatLocalDate(new Date(Math.floor(tsNs / 1_000_000)));
}

function fileMtimeNs(targetPath) {
  try {
    return Number(fs.statSync(targetPath).mtimeNs || 0n);
  } catch {
    return 0;
  }
}

function latestSourceMtimeNs(...paths) {
  return paths.reduce((maxValue, current) => Math.max(maxValue, fileMtimeNs(current)), 0);
}

function runFixMetaDate() {
  execFileSync(
    process.execPath,
    [path.join(ROOT_DIR, "scripts", "fix-meta-date.js"), "--write", "--date-source", "first"],
    {
      cwd: ROOT_DIR,
      stdio: "inherit",
    }
  );
}

function loadMetaYaml(metaPath) {
  const raw = readText(metaPath);
  assertQuotedWallClockFields(raw, metaPath);
  let data;
  try {
    data = yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA });
  } catch (error) {
    if (!/duplicated mapping key/i.test(String(error && error.message))) {
      throw error;
    }
    // Align with the historical Python loader behavior: when duplicate top-level
    // keys exist in a sidecar, keep the last declaration instead of hard failing.
    const lines = raw.split(/\r?\n/);
    const seen = new Map();
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^(\S[^:]*):\s*/.test(line)) {
        const key = line.replace(/:.*/, "").trim();
        seen.set(key, index);
      }
    }
    const filtered = lines.filter((line, index) => {
      const match = line.match(/^(\S[^:]*):\s*/);
      if (!match) return true;
      return seen.get(match[1]) === index;
    });
    data = yaml.load(filtered.join("\n"), { schema: yaml.FAILSAFE_SCHEMA });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: not a YAML object`);
  }
  return data;
}

function resolveBusinessSortTsNs(item, metaPath, cardPath) {
  const dateTs = parseSortTsNs(item.date);
  if (dateTs) return dateTs;
  const updatedTs = parseSortTsNs(item.updated);
  if (updatedTs) return updatedTs;
  return latestSourceMtimeNs(metaPath, cardPath);
}

function buildIndexData() {
  const entries = [];
  const errors = [];
  const requiredFields = ["slug", "path", "category", "title", "date", "tags", "desc"];

  for (const metaPath of listMetaFiles(DOCS_DIR)) {
    try {
      const data = loadMetaYaml(metaPath);
      const missing = requiredFields.filter((key) => !(key in data));
      if (missing.length) {
        errors.push(`${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: missing fields ${missing.join(", ")}`);
        continue;
      }
      const cardPath = path.join(ROOT_DIR, String(data.path));
      if (!fs.existsSync(cardPath)) {
        errors.push(`${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: target path missing -> ${data.path}`);
        continue;
      }
      const item = { ...data };
      // Normalize description → desc (fix legacy cards using wrong field name)
      if (item.description != null && item.desc == null) {
        item.desc = item.description;
        delete item.description;
      }
      // desc must be non-empty (not just present but actually filled)
      const descValue = typeof item.desc === "string" ? item.desc.trim() : "";
      if (!descValue) {
        errors.push(`${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: desc is empty — a meaningful description is required`);
        continue;
      }
      item.date = normalizeDateValue(item.date);
      if (Object.prototype.hasOwnProperty.call(item, "updated")) {
        item.updated = normalizeDateValue(item.updated);
      }

      const sortTs = resolveBusinessSortTsNs(item, metaPath, cardPath);
      item._sort_ts = sortTs;
      item._modified_date = formatSortDate(sortTs);
      entries.push(item);
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length) {
    const message = ["Index build failed:", ...errors.map((item) => `- ${item}`)].join("\n");
    throw new Error(message);
  }

  const cards = entries.sort((a, b) => {
    const sortDiff = Number(b._sort_ts || 0) - Number(a._sort_ts || 0);
    if (sortDiff !== 0) return sortDiff;
    const titleDiff = String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN");
    if (titleDiff !== 0) return titleDiff;
    return String(a.slug || "").localeCompare(String(b.slug || ""), "zh-Hans-CN");
  });

  return {
    _count: cards.length,
    cards,
  };
}

function collectIndexReconciliationData() {
  const metas = [];
  const duplicateSlugGroups = new Map();
  const duplicatePathGroups = new Map();
  const htmlMetaMismatches = [];
  const repoOnlyHtmlPaths = [];
  const repoHtmlPaths = new Set();
  const metaPaths = new Set();

  for (const metaPath of listMetaFiles(DOCS_DIR)) {
    const relMetaPath = normalizeSlashes(path.relative(ROOT_DIR, metaPath));
    metaPaths.add(relMetaPath);
    const data = loadMetaYaml(metaPath);
    const slug = String(data.slug || "").trim();
    const declaredPath = String(data.path || "").trim();
    const expectedPath = normalizeSlashes(path.relative(ROOT_DIR, metaPath.slice(0, -".meta.yaml".length)));

    metas.push({
      meta_path: relMetaPath,
      slug,
      path: declaredPath,
    });

    if (slug) {
      if (!duplicateSlugGroups.has(slug)) duplicateSlugGroups.set(slug, []);
      duplicateSlugGroups.get(slug).push(relMetaPath);
    }
    if (declaredPath) {
      if (!duplicatePathGroups.has(declaredPath)) duplicatePathGroups.set(declaredPath, []);
      duplicatePathGroups.get(declaredPath).push(relMetaPath);
      if (declaredPath !== expectedPath) {
        htmlMetaMismatches.push({
          meta_path: relMetaPath,
          declared_path: declaredPath,
          expected_path: expectedPath,
        });
      }
    }
  }

  const htmlFiles = [];
  const stack = [DOCS_DIR];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
      const relHtmlPath = normalizeSlashes(path.relative(ROOT_DIR, fullPath));
      htmlFiles.push(relHtmlPath);
      repoHtmlPaths.add(relHtmlPath);
    }
  }

  const nonCardHtmlPaths = new Set([
    "docs/index.html",
    "docs/infocard-style-demo.html",
    "docs/20260531-huawei-tau-scaling-law/index.html",
  ]);

  for (const htmlPath of htmlFiles.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))) {
    if (nonCardHtmlPaths.has(htmlPath)) continue;
    if (metaPaths.has(`${htmlPath}.meta.yaml`) || metaPaths.has(`${htmlPath.replace(/\.html$/, ".meta.yaml")}`)) continue;
    repoOnlyHtmlPaths.push(htmlPath);
  }

  const indexOnlyCards = [];
  if (fs.existsSync(INDEX_PATH)) {
    try {
      const indexData = yaml.load(readText(INDEX_PATH), { schema: yaml.FAILSAFE_SCHEMA });
      const cards = Array.isArray(indexData && indexData.cards) ? indexData.cards : [];
      for (const card of cards) {
        const pathValue = String(card && card.path ? card.path : "").trim();
        if (!pathValue) continue;
        const hasMeta = metas.some((meta) => meta.path === pathValue);
        if (!hasMeta) {
          indexOnlyCards.push(pathValue);
        }
      }
    } catch {
      // Read-only audit: malformed index is reported elsewhere.
    }
  }

  const duplicateSlugs = [...duplicateSlugGroups.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([slug, files]) => ({ slug, files: files.sort((a, b) => a.localeCompare(b, "zh-Hans-CN")) }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "zh-Hans-CN"));

  const duplicatePaths = [...duplicatePathGroups.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([pathValue, files]) => ({ path: pathValue, files: files.sort((a, b) => a.localeCompare(b, "zh-Hans-CN")) }))
    .sort((a, b) => a.path.localeCompare(b.path, "zh-Hans-CN"));

  return {
    duplicate_slugs: duplicateSlugs,
    duplicate_paths: duplicatePaths,
    html_meta_mismatches: htmlMetaMismatches.sort((a, b) => a.meta_path.localeCompare(b.meta_path, "zh-Hans-CN")),
    repo_only_html_paths: repoOnlyHtmlPaths,
    index_only_paths: indexOnlyCards.sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
    scanned_meta_count: metas.length,
    scanned_html_count: htmlFiles.length,
  };
}

function formatIndexReconciliationData(report) {
  const lines = [
    `[index-reconciliation] metas=${report.scanned_meta_count} html=${report.scanned_html_count}`,
    `[index-reconciliation] duplicate_slugs=${report.duplicate_slugs.length} duplicate_paths=${report.duplicate_paths.length} mismatches=${report.html_meta_mismatches.length} repo_only_html=${report.repo_only_html_paths.length} index_only=${report.index_only_paths.length}`,
  ];

  for (const group of report.duplicate_slugs) {
    lines.push(`[index-reconciliation] DUPLICATE_SLUG ${group.slug} | ${group.files.join(", ")}`);
  }
  for (const group of report.duplicate_paths) {
    lines.push(`[index-reconciliation] DUPLICATE_PATH ${group.path} | ${group.files.join(", ")}`);
  }
  for (const mismatch of report.html_meta_mismatches) {
    lines.push(`[index-reconciliation] HTML_META_MISMATCH ${mismatch.meta_path} | path=${mismatch.declared_path} | expected=${mismatch.expected_path}`);
  }
  for (const htmlPath of report.repo_only_html_paths) {
    lines.push(`[index-reconciliation] REPO_ONLY_HTML ${htmlPath}`);
  }
  for (const indexPath of report.index_only_paths) {
    lines.push(`[index-reconciliation] INDEX_ONLY ${indexPath}`);
  }

  return `${lines.join("\n")}\n`;
}

function serializeIndexYaml(indexData) {
  return yaml.dump(indexData, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

function escapeInlineJson(jsonText) {
  return jsonText.replace(/<\//g, "<\\/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function injectIndexDataIntoHtml(htmlText, indexData) {
  const payload = escapeInlineJson(`${JSON.stringify(indexData, null, 2)}\n`);
  const block = `${INDEX_DATA_START}\n${payload}${INDEX_DATA_END}`;
  const existingPattern = new RegExp(`${escapeRegExp(INDEX_DATA_START)}[\\s\\S]*?${escapeRegExp(INDEX_DATA_END)}`);

  if (existingPattern.test(htmlText)) {
    return htmlText.replace(existingPattern, block);
  }

  const anchor = '<div id="app" class="app-shell"></div>';
  if (!htmlText.includes(anchor)) {
    throw new Error("index.html missing #app anchor for home-index-data injection");
  }

  return htmlText.replace(anchor, `${anchor}\n  ${block}`);
}

function extractInjectedIndexData(htmlText) {
  const pattern = new RegExp(`${escapeRegExp(INDEX_DATA_START)}\\s*([\\s\\S]*?)\\s*${escapeRegExp(INDEX_DATA_END)}`);
  const match = htmlText.match(pattern);
  if (!match) {
    throw new Error("index.html missing injected home-index-data payload");
  }
  return JSON.parse(match[1]);
}

// Plan-B rewrite: explicit allowlist instead of full-repo recursion.
// Only published content enters dist/.
const COPY_SUBDIRS = [
  "assets",
  "docs",
  "published",
  "static",
  "theme",
  "infocard-claude-init",
  "infocard-deepseek",
  "infocard-openwiki",
  "infocard-watermark-removal",
  "integration",
  "subagent-matrix",
];

const COPY_ROOT_FILES = [
  "index.html",
  "_index.yaml",
  "_taxonomy.yaml",
  "_themes.yaml",
  "themes.html",
  "manifest.json",
  "sw.js",
  "README.md",
];

function copyDir(src, dst) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

function copyStaticTreeToDist() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy allowlisted subdirectories.
  for (const subdir of COPY_SUBDIRS) {
    const src = path.join(ROOT_DIR, subdir);
    const dst = path.join(DIST_DIR, subdir);
    if (!fs.existsSync(src)) continue;
    copyDir(src, dst);
  }

  // Copy allowlisted root files.
  for (const file of COPY_ROOT_FILES) {
    const src = path.join(ROOT_DIR, file);
    const dst = path.join(DIST_DIR, file);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function writeGeneratedArtifacts(indexData) {
  // Source preview, filter checks, and deployment must consume the same index.
  writeText(SOURCE_INDEX_YAML_PATH, serializeIndexYaml(indexData));
  const sourceHtml = readText(SOURCE_INDEX_HTML_PATH);
  writeText(SOURCE_INDEX_HTML_PATH, injectIndexDataIntoHtml(sourceHtml, indexData));

  copyStaticTreeToDist();
  writeText(INDEX_PATH, serializeIndexYaml(indexData));
}

module.exports = {
  DIST_DIR,
  INDEX_HTML_PATH,
  INDEX_PATH,
  SOURCE_INDEX_YAML_PATH,
  ROOT_DIR,
  buildIndexData,
  collectIndexReconciliationData,
  extractInjectedIndexData,
  formatIndexReconciliationData,
  readText,
  runFixMetaDate,
  serializeIndexYaml,
  writeGeneratedArtifacts,
};
