"""Resolve and validate the active infocard-pub checkout or linked worktree."""
from __future__ import annotations
import argparse
import json
import subprocess
from pathlib import Path, PureWindowsPath

class RepoRootError(RuntimeError):
    """Raised when a path cannot be proven to be an infocard-pub checkout."""

def _project_markers(root: Path) -> bool:
    try:
        package = json.loads((root / "package.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    return (
        package.get("name") == "infocard-pub"
        and isinstance(package.get("scripts"), dict)
        and "build" in package["scripts"]
        and (root / "scripts" / "build-site.js").is_file()
        and (root / ".agents" / "skills").is_dir()
    )

def _git_root(candidate: Path) -> Path | None:
    try:
        result = subprocess.run(
            ["git", "-C", str(candidate), "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return Path(result.stdout.strip()).resolve() if result.stdout.strip() else None

def resolve_repo_root(start: str | Path, override: str | Path | None = None) -> Path:
    if override is not None:
        candidate = Path(override).expanduser().resolve()
        if _git_root(candidate) != candidate or not _project_markers(candidate):
            raise RepoRootError(f"invalid project root override: {candidate}")
        return candidate
    path = Path(start).expanduser().resolve()
    if path.is_file():
        path = path.parent
    for candidate in (path, *path.parents):
        if _git_root(candidate) == candidate and _project_markers(candidate):
            return candidate
    raise RepoRootError(f"unable to resolve a validated infocard-pub checkout from: {path}")

def resolve_repo_path(root: Path, value: str) -> Path:
    """Resolve an index path inside root, rejecting absolute and traversal paths."""
    relative = Path(value)
    if relative.is_absolute() or PureWindowsPath(value).is_absolute():
        raise RepoRootError(f"repository path must be relative: {value}")
    candidate = (root / relative).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError as exc:
        raise RepoRootError(f"repository path escapes the active checkout: {value}") from exc
    return candidate

def script_repo_root(script_file: str | Path, override: str | Path | None = None) -> Path:
    return resolve_repo_root(Path(script_file), override)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("start", nargs="?", default=__file__)
    parser.add_argument("--root")
    args = parser.parse_args()
    try:
        print(resolve_repo_root(args.start, args.root))
    except RepoRootError as exc:
        parser.exit(1, f"ERROR: {exc}\n")

if __name__ == "__main__":
    main()
