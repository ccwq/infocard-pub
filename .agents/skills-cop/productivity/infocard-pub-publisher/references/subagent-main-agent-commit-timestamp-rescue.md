# Subagent Timestamp: Main-Agent-Commits Pattern (2026-07-09)

## Failure Mode

子智能体执行了 `TZ=Asia/Shanghai date` 写进 meta.yaml，但超时后主线程接手 commit。
最终 git commit 时间与 meta.yaml 时间仍不一致。

**根因**：dispatch 时间 ≠ 子智能体执行时间 ≠ 主线程 commit 时间。三者互相独立。

## Decision Rules

| 场景 | 用哪个时间 |
|------|-----------|
| 子智能体写完并成功 push | 子智能体执行时 meta 里写的时间 |
| 子智能体超时未 push，主线程接手 commit | **永远从 `git log` 取实际 commit 时间**回填 meta |

## Recovery Script

主线程接管后，用 git commit 时间回填 meta.yaml（适用所有日期的卡）：

```bash
python3 - <<'PY'
from pathlib import Path
import subprocess
repo = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip())
for meta in sorted((repo/'docs').glob('20260709-*.html.meta.yaml')):
    html = meta.name.replace('.meta.yaml','')
    ts = subprocess.check_output(['git','-C',str(repo),'log',
        '--format=%ad','--date=format:%Y-%m-%d %H:%M:%S','-1','--',
        str(Path('docs')/html)], text=True).strip()
    if not ts: continue
    txt = meta.read_text()
    new = []
    for line in txt.splitlines():
        if line.startswith('date:'):   new.append(f'date: "{ts}"')
        elif line.startswith('updated:'): new.append(f'updated: "{ts}"')
        else: new.append(line)
    meta.write_text('\n'.join(new) + '\n')
    print(meta.name, '=>', ts)
PY
```

Then:
```bash
npm run build
git add docs/<date>-*.meta.yaml _index.yaml index.html
git commit -m "fix: align meta timestamps with actual git commit times"
git push
sleep 60 && curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

## Prevention

子智能体 prompt 里的时间戳说明应改为：
> 时间戳由主线程 commit 时从 git log 提取回填。子智能体写 meta 时先写 `date: "TBD"` 占位，commit 时间由主线程填入。不要把 `TZ=Asia/Shanghai date` 的结果直接写进 meta.yaml。

## Related Existing References

- `references/subagent-timestamp-discipline.md`：旧的“子智能体写 meta”纪律，需与本文件一起看。
- `references/batch-meta-time-fix.md`：批量回填 commit 时间的脚本范式。
- `references/meta-timestamp-format-trap.md`：`date/updated` 必须加引号，且必须是 `YYYY-MM-DD HH:MM:SS`。
