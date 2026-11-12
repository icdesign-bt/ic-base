#!/usr/bin/env bash
# Рендер реалистичных превью файлов (как миниатюры Drive) через Chrome headless.
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/scripts/preview-sources"
OUT="$ROOT/public/previews"

render() {
  local html="$1" w="$2" h="$3" base="$4"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size="${w},${h}" \
    --screenshot="${OUT}/${base}.png" \
    "file://${SRC}/${html}" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 88 "${OUT}/${base}.png" --out "${OUT}/${base}.jpg" >/dev/null
  rm -f "${OUT}/${base}.png"
  echo "wrote ${base}.jpg"
}

mkdir -p "$OUT"
cd "$OUT"
render docx.html 640 800 preview-docx
render pdf.html 640 800 preview-pdf
render xlsx.html 720 540 preview-xlsx
render pptx.html 720 480 preview-pptx
render md.html 640 800 preview-md
render image.html 720 540 preview-image
