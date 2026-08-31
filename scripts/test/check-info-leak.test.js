const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { scanFile } = require("../check-info-leak.js");

test("X status ID is not misclassified as a phone number", () => {
  /**
   * Given：HTML contains a public X status URL whose long numeric ID includes an 11-digit phone-like substring
   * When：运行信息泄漏扫描器扫描该 HTML
   * Then：不产生手机号告警
   * 防回归：避免社媒来源卡因 X status ID 被误阻断发布
   */
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "check-info-leak-"));
  const file = path.join(tempDir, "card.html");
  fs.writeFileSync(
    file,
    '<a href="https://x.com/user/status/2094218611112263944">source</a>\n',
    "utf8"
  );

  try {
    assert.deepEqual(scanFile(file), []);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("phone number in ordinary text remains blocking", () => {
  /**
   * Given：HTML contains an ordinary 11-digit Chinese mobile number
   * When：运行信息泄漏扫描器扫描该 HTML
   * Then：仍报告 HIGH 手机号告警
   * 防回归：修复 URL 误报不能削弱真实敏感信息检测
   */
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "check-info-leak-"));
  const file = path.join(tempDir, "card.html");
  fs.writeFileSync(file, "联系号码：18612345678\n", "utf8");

  try {
    const issues = scanFile(file);
    assert.equal(issues.length, 1);
    assert.equal(issues[0].pattern, "手机号（中国大陆）");
    assert.equal(issues[0].severity, "HIGH");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("GitHub long numeric ID is not misclassified as a phone number", () => {
  /**
   * Given：HTML 包含 GitHub actions 或 discussions 的长数字公开 ID。
   * When：运行信息泄漏扫描器。
   * Then：不产生手机号告警。
   * 防回归：定向 leak gate 不应阻断公开平台资源 ID。
   */
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "check-info-leak-"));
  const file = path.join(tempDir, "card.html");
  fs.writeFileSync(file, '<a href="https://github.com/org/repo/actions/runs/2094218611112263944">run</a>\n', "utf8");
  try { assert.deepEqual(scanFile(file), []); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
});

test("numeric contact URL is not broadly exempted", () => {
  /**
   * Given：普通 HTTP URL 的数字路径并非已知公开平台资源 ID。
   * When：运行信息泄漏扫描器。
   * Then：仍报告手机号风险。
   * 防回归：公开 ID 例外不能演变为任意 URL 数字白名单。
   */
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "check-info-leak-"));
  const file = path.join(tempDir, "card.html");
  fs.writeFileSync(file, '<a href="https://example.com/contact/18612345678">contact</a>\n', "utf8");
  try { assert.equal(scanFile(file)[0].severity, "HIGH"); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
});
