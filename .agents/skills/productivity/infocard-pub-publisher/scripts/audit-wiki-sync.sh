#!/bin/bash
# infocard-pub → LLM Wiki raw sync integrity audit
# Usage: bash scripts/audit-wiki-sync.sh
set -euo pipefail

REPO="$HOME/hehome/hermes-data/home/qbox/opendir/project/infocard-pub/docs"
WIKI_RAW="$HOME/hehome/hermes-data/home/wiki/raw/articles"
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

echo "=== INTEGRITY AUDIT ==="
echo "repo=$REPO"
echo "wiki_raw=$WIKI_RAW"
echo ""

# 1. Counts
REPO_COUNT=$(ls "$REPO"/*.html 2>/dev/null | wc -l)
WIKI_COUNT=$(ls "$WIKI_RAW"/*.md 2>/dev/null | wc -l)
echo "Repo HTML: $REPO_COUNT"
echo "Wiki raw .md: $WIKI_COUNT"

# 2. Extract slugs
cd "$REPO"
for f in *.html; do
  name="${f%.html}"
  if [[ "$name" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)$ ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
done | sort -u > "$TMP/repo_slugs.txt"

cd "$WIKI_RAW"
for f in *.md; do
  name="${f%.md}"
  suffix="${name#????-??-??-}"
  echo "$suffix"
done | sort -u > "$TMP/wiki_slugs.txt"

# 3. Coverage
MISSING=$(comm -23 "$TMP/repo_slugs.txt" "$TMP/wiki_slugs.txt")
MISSING_COUNT=$(echo "$MISSING" | grep -c .)
REPO_UNIQUE=$(wc -l < "$TMP/repo_slugs.txt")
echo ""
echo "=== COVERAGE ==="
echo "Missing in wiki ($MISSING_COUNT/$REPO_UNIQUE):"
echo "$MISSING" | head -20

# 4. Duplicates
echo ""
echo "=== DUPLICATE SLUGS ==="
cd "$WIKI_RAW"
DUP=$(ls | sed 's/^[0-9-]*-//' | sed 's/.md$//' | sort | uniq -c | sort -rn | grep -v '  1 ')
DUP_COUNT=$(echo "$DUP" | grep -c .)
echo "Total duplicate slugs: $DUP_COUNT"
echo "$DUP" | head -10

# 5. Frontmatter format
echo ""
echo "=== FRONTMATTER FORMAT ==="
FM_TITLE=$(grep -l '^title:' "$WIKI_RAW"/*.md 2>/dev/null | wc -l)
FM_OLD=$(grep -l '^source_url:' "$WIKI_RAW"/*.md 2>/dev/null | wc -l)
FM_NONE=$(grep -L '^---' "$WIKI_RAW"/*.md 2>/dev/null | wc -l)
echo "Standard (title/desc/source/tags/created): $FM_TITLE"
echo "Old format (source_url/slug/ingested): $FM_OLD"
echo "No frontmatter: $FM_NONE"

# 6. Date format
echo ""
echo "=== DATE FORMAT (created field) ==="
ISO_TZ=$(grep '^created:' "$WIKI_RAW"/*.md 2>/dev/null | grep 'T' | grep '+08:00' | wc -l)
SPACE=$(grep '^created:' "$WIKI_RAW"/*.md 2>/dev/null | grep ' ' | grep -v 'T' | wc -l)
PLAIN=$(grep '^created:' "$WIKI_RAW"/*.md 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | wc -l)
echo "ISO T+timezone: $ISO_TZ"
echo "Space format: $SPACE"
echo "Plain YYYY-MM-DD: $PLAIN (should be ≥1)"

# 7. Empty desc
echo ""
echo "=== EMPTY DESC ==="
EMPTY_DESC=$(mktemp)
for f in "$WIKI_RAW"/*.md; do
  desc_line=$(grep '^desc:' "$f" 2>/dev/null)
  if [ -n "$desc_line" ]; then
    desc_val=$(echo "$desc_line" | sed "s/^desc: *['\"]*//" | sed "s/['\"]*$//")
    [ ${#desc_val} -lt 5 ] && echo "$(basename "$f")"
  fi
done
echo "Files with empty/short desc: $(wc -l < $EMPTY_DESC)"

echo ""
echo "=== DONE ==="
