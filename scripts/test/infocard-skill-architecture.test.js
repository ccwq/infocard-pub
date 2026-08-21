'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { audit, REQUIRED_ROUTES } = require('../lib/infocard-skill-architecture');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST = path.join(ROOT, '.scratch/infocard-skill-architecture/migration-manifest.md');

test('migration manifest and project tree pass deterministic integrity audit', () => {
  /**
   * Given：迁移 manifest 声明了全局候选、项目目的地和分类。
   * When：审计项目本地 SKILL.md、目的地与 manifest 分类。
   * Then：所有迁移项可定位且 canonical name 唯一。
   * 防回归：避免支持文件迁移后留下空壳或重复 frontmatter。
   */
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global') });
  assert.deepEqual(report.errors, []);
});

test('router declares every required route target and safety boundary', () => {
  /**
   * Given：全局入口只能做薄路由，项目流程必须由本地 canonical skill 承担。
   * When：读取 router 文本并审计八类目标及不可用/授权状态。
   * Then：每个 route family 都指向预期项目 skill，并声明 PROJECT_SKILL_UNAVAILABLE 与授权边界。
   * 防回归：避免入口退化成重复 SOP 或把查询升级为发布。
   */
  const router = path.join(os.tmpdir(), `infocard-router-${process.pid}.md`);
  const text = ['PROJECT_SKILL_UNAVAILABLE', 'authorization', ...Object.values(REQUIRED_ROUTES).flat()].join('\n');
  fs.writeFileSync(router, text);
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global'), router });
  assert.deepEqual(report.errors, []);
  fs.rmSync(router, { force: true });
});

test('router audit rejects a router that only reports project unavailability', () => {
  /**
   * Given：Hermes 从非 infocard-pub 目录启动且项目 skill 不可发现。
   * When：审计入口声明的 unavailable 状态。
   * Then：必须保留 PROJECT_SKILL_UNAVAILABLE，不得静默回退到全局发布流程。
   * 防回归：避免外部工作目录伪造项目能力并产生副作用。
   */
  const router = path.join(os.tmpdir(), `infocard-router-unavailable-${process.pid}.md`);
  fs.writeFileSync(router, 'PROJECT_SKILL_UNAVAILABLE authorization');
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global'), router });
  assert.ok(report.errors.some((error) => error.includes('router create missing')));
  fs.rmSync(router, { force: true });
});
