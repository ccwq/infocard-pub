#!/usr/bin/env python3
import json
import os
import secrets
import stat
import sys


def emit(body):
    sys.stdout.write(json.dumps(body, separators=(",", ":")) + "\n")


def fail(message):
    emit({"ok": False, "error": str(message)})
    return 1


def main(argv):
    if len(argv) != 3 or argv[2] not in ("create", "replace"):
        return fail("usage: safe-meta-write.py ROOT RELATIVE_TARGET create|replace")
    root, relative, mode = argv
    if os.path.isabs(relative):
        return fail("target must be relative")
    parts = relative.split(os.sep)
    if not parts or any(part in ("", ".", "..") for part in parts):
        return fail("target contains invalid path component")

    data = sys.stdin.buffer.read()
    root_fd = parent_fd = temp_fd = None
    temp_name = None
    try:
        root_fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        parent_fd = os.dup(root_fd)
        swap = os.environ.get("SAFE_META_WRITE_SWAP_COMPONENT")
        for component in parts[:-1]:
            if swap == component:
                os.rename(component, component + ".safe-meta-write-swapped", src_dir_fd=parent_fd, dst_dir_fd=parent_fd)
            next_fd = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent_fd)
            os.close(parent_fd)
            parent_fd = next_fd

        final_name = parts[-1]
        temp_name = f".{final_name}.{os.getpid()}.{secrets.token_hex(8)}.tmp"
        temp_fd = os.open(
            temp_name,
            os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
            0o600,
            dir_fd=parent_fd,
        )
        view = memoryview(data)
        while view:
            written = os.write(temp_fd, view)
            if written <= 0:
                raise OSError("short write")
            view = view[written:]
        os.fsync(temp_fd)
        os.close(temp_fd)
        temp_fd = None

        if os.environ.get("SAFE_META_WRITE_FAIL_AFTER_FSYNC") == "1":
            raise OSError("injected failure after fsync")

        if mode == "create":
            os.link(temp_name, final_name, src_dir_fd=parent_fd, dst_dir_fd=parent_fd, follow_symlinks=False)
            os.unlink(temp_name, dir_fd=parent_fd)
            temp_name = None
        else:
            info = os.stat(final_name, dir_fd=parent_fd, follow_symlinks=False)
            if not stat.S_ISREG(info.st_mode):
                raise OSError("replace target must be a regular file")
            os.replace(temp_name, final_name, src_dir_fd=parent_fd, dst_dir_fd=parent_fd)
            temp_name = None
        os.fsync(parent_fd)
        emit({"ok": True, "mode": mode, "path": relative})
        return 0
    except Exception as error:
        if temp_fd is not None:
            try:
                os.close(temp_fd)
            except OSError:
                pass
        if temp_name is not None and parent_fd is not None:
            try:
                os.unlink(temp_name, dir_fd=parent_fd)
            except OSError:
                pass
        return fail(error)
    finally:
        if parent_fd is not None:
            try:
                os.close(parent_fd)
            except OSError:
                pass
        if root_fd is not None:
            try:
                os.close(root_fd)
            except OSError:
                pass


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
