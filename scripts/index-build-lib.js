#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const yaml = require("../assets/home/vendor/js-yaml.min.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");
const INDEX_PATH = path.join(ROOT_DIR, "_index.yaml");
const INDEX_HTML_PATH = path.join(ROOT_DIR, "index.html");
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
    return formatLocalDate(value);
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
  let data;
  try {
    data = yaml.load(raw);
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
    data = yaml.load(filtered.join("\n"));
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${normalizeSlashes(path.relative(ROOT_DIR, metaPath))}: not a YAML object`);
  }
  return data;
}

function resolveBusinessSortTsNs(item, metaPath, cardPath) {
  const updatedTs = parseSortTsNs(item.updated);
  if (updatedTs) return updatedTs;
  const dateTs = parseSortTsNs(item.date);
  if (dateTs) return dateTs;
  return latestSourceMtimeNs(metaPath, cardPath);
}

function buildIndexData() {
  const entries = [];
  const errors = [];
  const requiredFields = ["slug", "path", "category", "title", "date", "tags"];

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

function writeGeneratedArtifacts(indexData) {
  writeText(INDEX_PATH, serializeIndexYaml(indexData));
  const htmlText = readText(INDEX_HTML_PATH);
  writeText(INDEX_HTML_PATH, injectIndexDataIntoHtml(htmlText, indexData));
}

module.exports = {
  INDEX_HTML_PATH,
  INDEX_PATH,
  ROOT_DIR,
  buildIndexData,
  extractInjectedIndexData,
  readText,
  runFixMetaDate,
  serializeIndexYaml,
  writeGeneratedArtifacts,
};
