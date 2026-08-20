import subprocess
import tempfile
import unittest
from pathlib import Path

from audit_repo_paths import audit
from repo_root import RepoRootError, resolve_repo_path, resolve_repo_root


class RepoRootTests(unittest.TestCase):
    def test_audit_scripts_anchor_card_globs_to_validated_root(self):
        # Given：audit 脚本可能从 active checkout 之外的当前目录启动
        # When：读取卡片和元数据的 glob 实现
        # Then：glob 必须锚定已验证的 root/docs，而不是进程当前目录
        # 防回归：避免解析 root 后仍然从 Path.cwd 隐式读取另一份 docs
        for name in ("audit-index.py", "audit-infocard-index.py"):
            script = Path(__file__).with_name(name).read_text(encoding="utf-8")
            self.assertIn('docs_dir = root / "docs"', script)
            self.assertNotIn('glob.glob("docs/', script)

    def test_audit_wiki_sync_uses_validated_dynamic_root_contract(self):
        # Given：wiki 同步审计脚本位于 repo-local Skill scripts 目录
        # When：读取其根目录解析逻辑
        # Then：脚本使用 Git 当前 worktree 与项目标志校验，不含历史固定 checkout 路径
        # 防回归：避免审计误读 primary checkout 或 Linux 专属 home 路径
        script = Path(__file__).with_name("audit-wiki-sync.sh").read_text(encoding="utf-8")
        self.assertIn('python3 "$SCRIPT_DIR/repo_root.py" "$SCRIPT_DIR"', script)
        self.assertNotIn("project/" + "infocard-pub", script)
        self.assertNotIn("$HOME/hehome", script)

    def test_audit_wiki_sync_records_short_descriptions(self):
        # Given：Wiki 审计发现不足 5 个字符的 desc
        # When：脚本记录空或过短描述
        # Then：命中文件名写入统一临时审计文件
        # 防回归：EMPTY_DESC 不能创建后从未写入而永远报告 0
        script = Path(__file__).with_name("audit-wiki-sync.sh").read_text(encoding="utf-8")
        self.assertIn('>> "$EMPTY_DESC"', script)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "repo with spaces"
        self.root.mkdir()
        (self.root / "package.json").write_text(
            '{"name":"infocard-pub","scripts":{"build":"node scripts/build-site.js"}}'
        )
        (self.root / "scripts").mkdir()
        (self.root / "scripts" / "build-site.js").write_text("")
        (self.root / ".agents" / "skills").mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)

    def tearDown(self):
        self.temp.cleanup()

    def test_primary_nested_and_override(self):
        # Given：主 checkout 与嵌套脚本路径具备完整项目标志
        # When：解析嵌套路径与合法 override
        # Then：均返回当前 checkout 根
        # 防回归：路径可包含空格且不得依赖当前目录
        nested = self.root / ".agents" / "skills" / "x.py"
        self.assertEqual(resolve_repo_root(nested), self.root.resolve())
        self.assertEqual(resolve_repo_root(Path("."), self.root), self.root.resolve())

    def test_linked_worktree_git_file(self):
        # Given：linked worktree 的 .git 为文件且具备项目标志
        # When：从 worktree 内路径解析
        # Then：返回 linked worktree 根
        # 防回归：不得跳回 primary checkout
        subprocess.run(["git", "-C", str(self.root), "add", "."], check=True)
        subprocess.run(["git", "-C", str(self.root), "commit", "-qm", "test"], check=True)
        linked = Path(self.temp.name) / "linked"
        subprocess.run(["git", "-C", str(self.root), "worktree", "add", "-qb", "resolver-test", str(linked)], check=True)
        try:
            (linked / "scripts").mkdir(exist_ok=True)
            (linked / ".agents" / "skills").mkdir(parents=True, exist_ok=True)
            self.assertEqual(resolve_repo_root(linked / ".agents" / "skills"), linked.resolve())
        finally:
            subprocess.run(["git", "-C", str(self.root), "worktree", "remove", "--force", str(linked)], check=True)

    def test_unrelated_non_git_and_invalid_override_fail_closed(self):
        # Given：无项目标志的 Git 仓库、普通目录和不合格 override
        # When：尝试解析
        # Then：全部拒绝并 fail closed
        # 防回归：不能把任意 Git 或 Path.cwd 当成目标项目
        unrelated = Path(self.temp.name) / "unrelated"
        unrelated.mkdir()
        subprocess.run(["git", "init", "-q", str(unrelated)], check=True)
        with self.assertRaises(RepoRootError):
            resolve_repo_root(unrelated)
        with self.assertRaises(RepoRootError):
            resolve_repo_root(Path(self.temp.name) / "plain")
        with self.assertRaises(RepoRootError):
            resolve_repo_root(self.root, Path(self.temp.name))

    def test_repository_resource_paths_cannot_escape_root(self):
        # Given：索引中的资源路径可能是相对路径、绝对路径或目录穿越
        # When：相对 active checkout 解析资源
        # Then：只接受仓库内部相对路径
        # 防回归：绝对路径不能绕过 root，../ 不能读取 worktree 外文件
        self.assertEqual(
            resolve_repo_path(self.root, "docs/card.html"),
            (self.root / "docs/card.html").resolve(),
        )
        for value in ("../outside.html", "/tmp/outside.html", "C:\\outside.html"):
            with self.assertRaises(RepoRootError):
                resolve_repo_path(self.root, value)

    def test_literal_path_audit_classifies_historical_evidence(self):
        # Given：active Skill、普通 reference 与明确标记的历史现场都包含旧 checkout 字面量
        # When：执行确定性 literal-path 分类审计
        # Then：只有紧邻历史标签的 reference 允许保留
        # 防回归：旧路径不能重新进入可复制命令，事故证据仍可被有条件保存
        skills = Path(self.temp.name) / "skills"
        active = skills / "demo" / "SKILL.md"
        general = skills / "demo" / "references" / "general.md"
        historical = skills / "demo" / "references" / "incident.md"
        active.parent.mkdir(parents=True)
        general.parent.mkdir(parents=True)
        old_path = "/old/project/" + "infocard-pub"
        active.write_text(f"cd {old_path}")
        general.write_text(f"cd {old_path}")
        historical.write_text(f"历史现场值（不可复制执行）：{old_path}")
        findings = audit(skills)
        allowed_by_name = {Path(item["path"]).name: item["allowed"] for item in findings}
        self.assertEqual(
            allowed_by_name,
            {"SKILL.md": False, "general.md": False, "incident.md": True},
        )
