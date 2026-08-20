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


def has_posix_dirfd_support():
    return (
        hasattr(os, "O_DIRECTORY")
        and hasattr(os, "O_NOFOLLOW")
        and os.open in getattr(os, "supports_dir_fd", set())
        and os.stat in getattr(os, "supports_dir_fd", set())
        and os.unlink in getattr(os, "supports_dir_fd", set())
        and os.replace in getattr(os, "supports_dir_fd", set())
    )


def split_relative(relative):
    normalized = relative.replace("\\", os.sep).replace("/", os.sep)
    parts = normalized.split(os.sep)
    if os.path.isabs(relative) or not parts or any(part in ("", ".", "..") for part in parts):
        raise ValueError("target contains invalid path component")
    return parts


def is_inside(root, target):
    root_real = os.path.realpath(root)
    target_real = os.path.realpath(target)
    try:
        return os.path.commonpath([root_real, target_real]) == root_real
    except ValueError:
        return False


def ensure_safe_parent(root, parts):
    root_real = os.path.realpath(root)
    if not os.path.isdir(root_real):
        raise OSError("root must be a directory")
    current = root_real
    for component in parts[:-1]:
        current = os.path.join(current, component)
        if not os.path.exists(current):
            raise FileNotFoundError(component)
        if os.path.islink(current):
            raise OSError("symlink component refused: " + component)
        current_real = os.path.realpath(current)
        if not is_inside(root_real, current_real):
            raise OSError("target parent resolves outside repository root")
        if not os.path.isdir(current_real):
            raise OSError("target parent component must be a directory")
    return root_real, current


def write_all(fd, data):
    view = memoryview(data)
    while view:
        written = os.write(fd, view)
        if written <= 0:
            raise OSError("short write")
        view = view[written:]


def main_portable(root, relative, mode, data, test_swap):
    parts = split_relative(relative)
    root_real, parent = ensure_safe_parent(root, parts)
    final_name = parts[-1]
    final_path = os.path.join(parent, final_name)
    if not is_inside(root_real, final_path):
        raise OSError("meta_path must remain within repository root")
    if os.path.islink(final_path):
        raise OSError("replace target must be a regular file")

    swapped_path = None
    original_path = None
    if test_swap is not None:
        for index, component in enumerate(parts[:-1]):
            if component == test_swap:
                original_path = os.path.join(root_real, *parts[: index + 1])
                swapped_path = original_path + ".safe-meta-write-swapped"
                os.rename(original_path, swapped_path)
                break

    temp_path = os.path.join(parent, f".{final_name}.{os.getpid()}.{secrets.token_hex(8)}.tmp")
    fd = None
    try:
        if swapped_path is not None:
            raise OSError("swapped component refused")
        fd = os.open(temp_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        write_all(fd, data)
        os.fsync(fd)
        os.close(fd)
        fd = None
        if os.environ.get("SAFE_META_WRITE_FAIL_AFTER_FSYNC") == "1":
            raise OSError("injected failure after fsync")
        if mode == "create":
            if os.path.exists(final_path) or os.path.islink(final_path):
                raise FileExistsError(final_name)
            os.link(temp_path, final_path)
            os.unlink(temp_path)
        else:
            if os.path.islink(final_path) or not os.path.isfile(final_path):
                raise OSError("replace target must be a regular file")
            os.replace(temp_path, final_path)
        try:
            parent_fd = os.open(parent, os.O_RDONLY)
            try:
                os.fsync(parent_fd)
            finally:
                os.close(parent_fd)
        except OSError:
            pass
        emit({"ok": True, "mode": mode, "path": relative})
        return 0
    finally:
        if fd is not None:
            try:
                os.close(fd)
            except OSError:
                pass
        if os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except OSError:
                pass
        if swapped_path is not None:
            os.rename(swapped_path, original_path)


def main(argv):
    test_swap = None
    if len(argv) == 5 and argv[3] == "--test-swap-component":
        if os.environ.get("SAFE_META_WRITE_ENABLE_TEST_HOOKS") != "1":
            return fail("test hooks are disabled")
        test_swap = argv[4]
        argv = argv[:3]
    if len(argv) != 3 or argv[2] not in ("create", "replace"):
        return fail("usage: safe-meta-write.py ROOT RELATIVE_TARGET create|replace")
    root, relative, mode = argv
    try:
        parts = split_relative(relative)
    except ValueError as error:
        return fail(error)

    data = sys.stdin.buffer.read()
    if not has_posix_dirfd_support():
        try:
            return main_portable(root, relative, mode, data, test_swap)
        except Exception as error:
            return fail(error)

    root_fd = parent_fd = temp_fd = None
    temp_name = None
    swapped_parent_fd = None
    swapped_component = None
    swapped_name = None
    try:
        root_fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        parent_fd = os.dup(root_fd)
        for component in parts[:-1]:
            if test_swap == component and swapped_component is None:
                swapped_parent_fd = os.dup(parent_fd)
                swapped_component = component
                swapped_name = component + ".safe-meta-write-swapped"
                os.rename(component, swapped_name, src_dir_fd=parent_fd, dst_dir_fd=parent_fd)
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
        if swapped_parent_fd is not None:
            try:
                os.rename(
                    swapped_name,
                    swapped_component,
                    src_dir_fd=swapped_parent_fd,
                    dst_dir_fd=swapped_parent_fd,
                )
            finally:
                os.close(swapped_parent_fd)
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
