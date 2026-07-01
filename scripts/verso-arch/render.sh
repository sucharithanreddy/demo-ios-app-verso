#!/usr/bin/env bash
# Render all 4 Verso architecture Mermaid diagrams to PNG.
set -euo pipefail

SCRIPT_DIR="/home/z/my-project/scripts/verso-arch"
OUT_DIR="/home/z/my-project/download/verso-arch"
CFG="$SCRIPT_DIR/mermaid-config.json"

mkdir -p "$OUT_DIR"

for mmd in "$SCRIPT_DIR"/*.mmd; do
  name=$(basename "$mmd" .mmd)
  out="$OUT_DIR/${name}.png"
  echo "==> Rendering $name"
  mmdc \
    -i "$mmd" \
    -o "$out" \
    -c "$CFG" \
    -w 1600 \
    -b white \
    --scale 2
  echo "    -> $out  ($(du -h "$out" | cut -f1))"
done

echo ""
echo "=== All diagrams rendered ==="
ls -lh "$OUT_DIR"
