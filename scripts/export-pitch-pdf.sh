#!/usr/bin/env bash
# Обёртка: HTML → PDF 16:9
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/.venv-pitch/bin/python" "$ROOT/scripts/export-pitch-pdf.py"
