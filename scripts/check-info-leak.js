#!/usr/bin/env node
/**
 * check-info-leak.js
 *
 * 扫描所有 docs/*.html 文件，检测可能的信息泄露风险。
 * 发现的每一项都会打印到 stdout，由调用方（CI 或人工）决定是否阻断发布。
 *
 * 用法：
 *   node scripts/check-info-leak.js                  # 扫描全部
 *   node scripts/check-info-leak.js docs/foo.html    # 只扫指定文件
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 高风险模式（发现即告警）
const HIGH_RISK_PATTERNS = [
  {
    name: "个人邮箱",
    // 匹配常见个人邮箱格式，排除明显是占位符或示例的
    regex: /[a-zA-Z0-9.\-_]{3,30}@[a-zA-Z0-9\-]+\.(com|org|net|io|me|info|cn|xyz|top|cc|pro|tk|ml|ga|cf|gq|ru|club|cc|edu|gov)\b/gi,
    // 排除这些关键字（常见占位符/示例）
    exclude: /\b(example|test|demo|sample|placeholder|yourname|username|email|mail|xxx|aaa|bbb|foo|bar|baz|admin|support|noreply|no-reply|help|info|contact|hello|get|post|user\d*|name\d*|test\d*|demo\d*)@/i,
    severity: "HIGH",
  },
  {
    name: "User ID / UUID",
    regex: /user-[a-zA-Z0-9]{10,40}|uuid-[a-zA-Z0-9]{10,40}|uid[a-zA-Z0-9]{8,20}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
    exclude: /[a-f0-9]{8}-[a-f0-9]{4}-0000-[a-f0-9]{4}-[a-f0-9]{12}/i, // null UUID
    severity: "HIGH",
  },
  {
    name: "API Key / Token",
    regex: /sk-[a-zA-Z0-9]{20,}|sk[ojo][\-a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9\-_]{20,}|amzn\.mws\.[a-zA-Z0-9\-_]{10,}/gi,
    exclude: /sk-xxxxx|sk-EXAMPL|sk-placeholder|sk-YOUR/i,
    severity: "CRITICAL",
  },
  {
    name: "手机号（中国大陆）",
    regex: /(\+?86)?[1][3-9]\d{9}/g,
    exclude: /(\+?86)?[1][3-9]\d{4}xxxx\d{4}|13800000000|13900000000/,
    // Exclude numbers inside URL query params or path segments (e.g. X post IDs like 2078318406424793326)
    urlContextExclude: /[?&][^=]*=|status\/\d{16,}|id\/\d{16,}/,
    severity: "HIGH",
  },
  {
    name: "IP地址",
    regex: /(?<![a-zA-Z0-9])(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?![a-zA-Z0-9])/g,
    exclude: /0\.0\.0\.0|255\.255\.255\.255|127\.0\.0\.1|localhost/,
    severity: "MEDIUM",
  },
];

// 中风险模式（提示人工复核）
const MEDIUM_RISK_PATTERNS = [
  {
    name: "微信/微信号",
    regex: /微信(?:ID|号|账号)[：:\s]*[a-zA-Z][a-zA-Z0-9_\-]{5,19}|微信号[：:\s]*[a-zA-Z][a-zA-Z0-9_\-]{5,19}/gi,
    severity: "MEDIUM",
  },
  {
    name: "支付宝ID",
    regex: /支付宝(?:ID|账号)[：:\s]*\d{10,16}/gi,
    severity: "MEDIUM",
  },
  {
    name: "信用卡号（片段）",
    regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{1,4}\b/g,
    exclude: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b(?=.{0,5}(?:test|demo|card|card_number|credit))/i,
    severity: "HIGH",
  },
  {
    name: "真实姓名（常见组合）",
    regex: /(?:姓名|名字|真实姓名)[：:\s]*[\u4e00-\u9fa5]{2,4}/g,
    severity: "MEDIUM",
  },
];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const issues = [];

  const allPatterns = [...HIGH_RISK_PATTERNS, ...MEDIUM_RISK_PATTERNS];

  for (const pattern of allPatterns) {
    let match;
    // Reset regex lastIndex
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(content)) !== null) {
      const value = match[0];
      if (pattern.exclude && pattern.exclude.test(value)) continue;
      // Exclude matches inside URL path segments (e.g. /status/2078318406424793326).
      // Check the surrounding source context: `value` is only the 11-digit
      // substring matched by the phone regex and cannot contain `status/`.
      if (pattern.urlContextExclude) {
        const context = content.slice(
          Math.max(0, match.index - 120),
          Math.min(content.length, match.index + value.length + 120)
        );
        if (pattern.urlContextExclude.test(context)) continue;
      }
      // Deduplicate
      if (issues.some(i => i.value === value)) continue;
      issues.push({
        pattern: pattern.name,
        value: maskValue(value),
        severity: pattern.severity,
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  }

  return issues;
}

function maskValue(value) {
  if (value.length <= 6) return "***";
  return value.slice(0, 3) + "***" + value.slice(-3);
}

function main() {
  const args = process.argv.slice(2);
  let files;

  if (args.length > 0) {
    files = args.map(f => path.resolve(f));
  } else {
    // 扫描 docs/ 下所有 html
    files = execSync(
      'find docs/ -name "*.html" -type f | grep -v node_modules',
      { encoding: "utf-8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(f => path.resolve(f));
  }

  let totalIssues = 0;
  let hasBlocking = false;

  // 只阻断新文件（untracked）或本次 args 指定文件；已提交文件只警告不阻断
  const isNewFile = !args.length; // 无 args = 全量扫描 = 历史基线，只警告
  const isTargeted = args.length > 0; // 指定文件 = 必须阻断

  if (isNewFile && !process.env.LEAK_CHECK_BLOCK_ALL) {
    console.log(
      "\n[REVIEW] Running full scan in review mode (historical baseline)."
    );
    console.log(
      "  For new submissions, run: node scripts/check-info-leak.js <new-file>"
    );
    process.exit(0); // 全量扫描不阻断（历史内容）
  }

  for (const file of files) {
    const issues = scanFile(file);
    if (issues.length === 0) continue;

    const rel = path.relative(process.cwd(), file);
    console.log(`\n[INFO-LEAK] ${rel}`);

    for (const issue of issues) {
      const emoji =
        issue.severity === "CRITICAL"
          ? "🚨"
          : issue.severity === "HIGH"
          ? "❗"
          : "⚠️";
      console.log(
        `  ${emoji} [${issue.severity}] ${issue.pattern} (line ${issue.line}): ${issue.value}`
      );
      if (issue.severity === "CRITICAL" || issue.severity === "HIGH") {
        hasBlocking = true;
      }
      totalIssues++;
    }
  }

  console.log(`\n[check-info-leak] Total: ${totalIssues} issue(s) found.`);

  if (hasBlocking) {
    console.log(
      "\n[BLOCK] HIGH/CRITICAL issues detected. Review before publishing."
    );
    console.log(
      "  To bypass: set CI variable SKIP_INFO_LEAK_CHECK=true or remove --exit-code from this script."
    );
    process.exit(1);
  } else if (totalIssues > 0) {
    console.log(
      "\n[REVIEW] MEDIUM issues found. Please review the output above before publishing."
    );
    process.exit(0); // Non-blocking, just warning
  } else {
    console.log("\n[OK] No info-leak issues detected.");
    process.exit(0);
  }
}

if (require.main === module) main();

module.exports = { scanFile };
