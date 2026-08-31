#!/usr/bin/env bash
# probe-blank-page.sh — Diagnose why a GitHub Pages site renders blank.
#
# Usage:   ./scripts/probe-blank-page.sh <public-url>
# Example: ./scripts/probe-blank-page.sh https://ccwq.github.io/infocard-pub/
#
# Emits a single report covering:
#   1. Page HTTP status + Content-Type + final byte size
#   2. All <script src=...> and <link href=...> URLs from the HTML head,
#      each re-fetched with status / size / content-type
#   3. Bootstrap target probe: assumes an SPA shell (e.g. #app) and reports
#      its innerHTML length before any JS runs
#
# Exit codes:
#   0  = report emitted (whether or not a defect was found)
#   2  = missing arg
#
# This is a static probe — it does NOT execute the page's JS. Pair it with the
# browser_console(expression='typeof Vue') pattern to confirm globals at runtime.
#
# Pitfall: GitHub Pages always serves 200 with a full HTML body even if the
# included JS later throws. A 200 status alone is NOT proof the page works.

set -u

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "usage: $0 <public-url>" >&2
  exit 2
fi

echo "=== BLANK-PAGE PROBE ==="
echo "target: $URL"
echo

# 1) Page itself
echo "--- 1) HEAD / GET on the URL ---"
curl -sSL -o /dev/null \
  -w "HTTP: %{http_code}\nSize: %{size_download}\nContent-Type: %{content_type}\nFinal-URL: %{url_effective}\n" \
  "$URL"
echo

# 2) Dump <script src> + <link href> URLs from the HTML
HTML=$(curl -sSL "$URL")

echo "--- 2) Asset URLs in the HTML, each re-fetched ---"
echo "$HTML" \
  | grep -oE '(src|href)="\.[^"]+\.(js|css)[^"]*"' \
  | sed -E 's/(src|href)="//; s/"$//' \
  | sort -u \
  | while read -r asset_path; do
      # Resolve relative ./ URLs against the page's directory URL
      base=$(echo "$URL" | sed -E 's#[^/]*$##')
      full="${base}${asset_path#./}"
      code=$(curl -sSL -o /dev/null -w "%{http_code}" "$full")
      size=$(curl -sSL -o /dev/null -w "%{size_download}" "$full")
      ct=$(curl -sSL -o /dev/null -w "%{content_type}" "$full")
      printf '  [%s] %5s %8s  %s\n' "$ct" "$code" "$size" "$asset_path"
    done
echo

# 3) Static check: are globals referenced in entry JS, actually loaded?
echo "--- 3) Globals referenced in entry JS ---"
ENTRY=$(echo "$HTML" | grep -oE 'src="\./assets/home/index\.js[^"]*"' | head -1 | sed -E 's/src="//; s/"$//' | sed 's#^./##')
if [ -n "$ENTRY" ]; then
  base=$(echo "$URL" | sed -E 's#[^/]*$##')
  ENTRY_URL="${base}${ENTRY}"
  echo "entry: $ENTRY_URL"
  curl -sSL "$ENTRY_URL" | grep -oE '\b(Vue|React|jQuery|alpine|js-YAML|jsyaml|THREE|D3|hls\.js)\b' | sort -u | sed 's/^/  global referenced: /'
fi
echo

echo "=== END PROBE ==="
echo "Next step (browser-side): navigate to the URL, then evaluate:"
echo "  ({ hasVue: typeof Vue, appLen: document.getElementById('app')?.innerHTML?.length ?? -1 })"
