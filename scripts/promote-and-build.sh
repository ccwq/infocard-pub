#!/bin/bash
# scripts/promote-and-build.sh
# 原子化：promotion → fix taxonomy（显式路径）→ verify taxonomy → build
# 用法：bash scripts/promote-and-build.sh --manifest .docs/<run-id>/<slug>/promotion-manifest.json

set -e

MANIFEST=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --manifest) MANIFEST="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$MANIFEST" ]]; then
  echo "Usage: $0 --manifest <manifest.json>"
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "[promote-and-build] ERROR: manifest not found: $MANIFEST"
  exit 1
fi

# Resolve manifest to absolute path (required because node -e resolves relative paths from cwd, not script dir)
MANIFEST=$(realpath "$MANIFEST")
echo "[promote-and-build] manifest=$MANIFEST"

# Step 1: promotion
echo "[promote-and-build] step 1/4: promotion"
node scripts/promote-infocard.js --manifest "$MANIFEST"

# Step 2: extract sidecar path from manifest, fix taxonomy for exactly those files
echo "[promote-and-build] step 2/4: fix taxonomy"
SIDEARMETA=$(node -e "
const m = require(process.argv[1]);
// Manifest uses 'destination' field, not 'role'; search by .meta.yaml suffix
const sidecar = m.files.find(f => f.destination && f.destination.endsWith('.meta.yaml'));
if (sidecar) console.log(sidecar.destination);
" "$MANIFEST")

if [[ -n "$SIDEARMETA" && -f "$SIDEARMETA" ]]; then
  node scripts/fix-taxonomy.js --write "$SIDEARMETA"
  echo "[promote-and-build] fixed: $SIDEARMETA"
else
  echo "[promote-and-build] WARN: no sidecar found in manifest or file missing"
fi

# Step 3: verify taxonomy
echo "[promote-and-build] step 3/4: verify taxonomy"
if [[ -n "$SIDEARMETA" && -f "$SIDEARMETA" ]]; then
  node scripts/verify-taxonomy.js "$SIDEARMETA"
else
  node scripts/verify-taxonomy.js --changed-only
fi

# Step 4: build
echo "[promote-and-build] step 4/4: build"
npm run build

echo "[promote-and-build] ✓ done"
