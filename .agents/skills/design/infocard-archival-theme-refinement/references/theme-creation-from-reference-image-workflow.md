# Reference-image-driven theme creation workflow

## Correct repo path

```
/home/ccwq/qbox/opendir/project/infocard-pub/
```

**NOT** `/home/ccwq/infocard-pub/` (does not exist) or other paths.
Always use the full absolute path when verifying file existence.

## Target path for theme files

```
/home/ccwq/qbox/opendir/project/infocard-pub/theme/<slug>.html
```

Theme slugs follow kebab-case: `sage-swiss`, `archive-green`, `redswiss`.

## File existence verification (mandatory after every write)

```bash
ls -la /home/ccwq/qbox/opendir/project/infocard-pub/theme/<slug>.html
```

Do NOT just `ls <slug>.html` from an unknown cwd — always include the full path.

## Live-server startup

```bash
cd /home/ccwq/qbox/opendir/project/infocard-pub
npx live-server --port=5588 --host=0.0.0.0 --no-browser
```

**Why `0.0.0.0` not `10.6.8.14`**: binding to `10.6.8.14` only accepts connections from that exact interface. Binding to `0.0.0.0` accepts from all interfaces including `10.6.8.14`.

Verify: `curl -s -o /dev/null -w "%{http_code}" http://10.6.8.14:5588/theme/<slug>.html` → expect `200`.

## Browser screenshot

```bash
google-chrome --headless=new --disable-gpu \
  --screenshot=/tmp/preview.png \
  --window-size=1280,900 \
  http://10.6.8.14:5588/theme/<slug>.html
```

Available at `/usr/bin/google-chrome`.

## Review round protocol

1. Report LAN preview URL: `http://10.6.8.14:5588/theme/<slug>.html`
2. Attach screenshot in reply
3. Wait for user feedback
4. Apply fixes
5. Re-screenshot and repeat up to the agreed cap

## After review passes

```bash
# 1. Add to _themes.yaml (position N, key <slug>-style, hex swatch)
# 2. Regenerate theme gallery
python3 scripts/rebuild_themes.py

# 3. Commit together
git add theme/<slug>.html _themes.yaml themes.html
git commit -m "feat: add <slug> theme"
git push origin main

# 4. Verify public
sleep 90
curl -s -o /dev/null -w "%{http_code}" \
  https://ccwq.github.io/infocard-pub/theme/<slug>.html
```

## Common failure modes

| Failure | Root cause | Fix |
|---|---|---|
| File 404 after write | File written to wrong directory | `ls -la /home/ccwq/qbox/opendir/project/infocard-pub/theme/<slug>.html` |
| live-server unreachable | Bound to wrong host (`10.6.8.14` instead of `0.0.0.0`) | Kill and restart with `0.0.0.0` |
| `curl` to live-server returns `000` | Server not running or port wrong | Check `ps aux | grep live-server` |
| Review rounds exceed cap | No cap was agreed upfront | Set cap explicitly at round 1 ("up to N rounds") |
| Theme not in public gallery after push | `_themes.yaml` not updated + gallery not rebuilt | Run `python3 scripts/rebuild_themes.py` before commit |
