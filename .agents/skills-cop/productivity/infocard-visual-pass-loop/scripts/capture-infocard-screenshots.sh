#!/usr/bin/env bash
# capture-infocard-screenshots.sh
# 验证过的 infocard 视觉验证截图脚本（Chrome headless）
# 用法：./capture-infocard-screenshots.sh <worktree-path> <slug> <port>

set -euo pipefail

WT="${1:?usage: $0 <worktree> <slug> <port>}"
SLUG="${2:?missing slug}"
PORT="${3:-4183}"

cd "$WT"

# 1. 起本地 preview
python3 -m http.server "$PORT" >/tmp/preview-$SLUG.log 2>&1 &
PREVIEW_PID=$!
trap "kill $PREVIEW_PID 2>/dev/null || true" EXIT

sleep 3

# 2. 验活
STATUS=$(curl -sI --max-time 10 "http://localhost:$PORT/docs/$SLUG.html" | head -1 || echo "FAIL")
if [[ "$STATUS" != *"200"* ]]; then
  echo "preview not 200: $STATUS"
  exit 1
fi

# 3. Isolated screenshots: each temporary profile belongs only to this script.
# No broad Chrome cleanup is permitted; Chrome exits normally after each capture.
PROFILE_DIR="$(mktemp -d /tmp/hermes-infocard-profile.XXXXXX)"
trap 'rm -rf "$PROFILE_DIR"; kill "$PREVIEW_PID" 2>/dev/null || true' EXIT

google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir="$PROFILE_DIR/desktop" \
  --window-size=1280,1800 --screenshot=/tmp/$SLUG-desktop.png \
  "http://localhost:$PORT/docs/$SLUG.html?v=1"

google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir="$PROFILE_DIR/mobile" \
  --window-size=720,1600 --screenshot=/tmp/$SLUG-mobile.png \
  "http://localhost:$PORT/docs/$SLUG.html?v=1m"

# 5. 报告
echo "captured:"
ls -la /tmp/$SLUG-desktop.png /tmp/$SLUG-mobile.png

echo "next: vision_analyze both files; fix any critical/major; rerun."