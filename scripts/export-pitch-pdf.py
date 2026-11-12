#!/usr/bin/env python3
"""Export docs/pitch/БЗ-2.0-пре-скрининг.html → PDF 16:9 (3 pages)."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "docs/pitch/БЗ-2.0-пре-скрининг.html"
PDF = ROOT / "docs/pitch/БЗ-2.0-пре-скрининг.pdf"
ASSETS = ROOT / "docs/pitch/assets"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
W, H = 1600, 900

PRINT_CSS = """
<style id="pdf-force">
  html, body { background:#fff !important; height:auto !important; overflow:visible !important; margin:0 !important; }
  .hint, .nav { display:none !important; }
  .deck { display:block !important; padding:0 !important; min-height:0 !important; }
  .stage {
    width:1600px !important; height:auto !important; aspect-ratio:auto !important;
    border-radius:0 !important; box-shadow:none !important; overflow:visible !important;
  }
  .slide {
    display:block !important; position:relative !important;
    width:1600px !important; height:900px !important; margin:0 !important;
  }
  .slide-canvas { transform:none !important; }
</style>
"""


def main() -> None:
    from PIL import Image
    import img2pdf

    if not CHROME.exists():
        raise SystemExit(f"Chrome not found: {CHROME}")

    src = HTML.read_text(encoding="utf-8")
    src = src.replace("</head>", PRINT_CSS + "</head>", 1)
    assets_uri = ASSETS.resolve().as_uri()
    src = src.replace('url("assets/', f'url("{assets_uri}/')
    src = src.replace('src="assets/', f'src="{assets_uri}/')

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        stack = tmp_path / "stack.html"
        stack.write_text(src, encoding="utf-8")
        full_png = tmp_path / "full.png"
        subprocess.run(
            [
                str(CHROME),
                "--headless=new",
                "--disable-gpu",
                f"--window-size={W},{H * 3}",
                "--hide-scrollbars",
                f"--screenshot={full_png}",
                "--default-background-color=FFFFFFFF",
                stack.resolve().as_uri(),
            ],
            check=True,
            capture_output=True,
        )
        im = Image.open(full_png).convert("RGB")
        paths: list[Path] = []
        for i in range(3):
            crop = im.crop((0, i * H, W, (i + 1) * H))
            preview = ASSETS / f"preview-slide-{i + 1}.png"
            crop.save(preview)
            shot = tmp_path / f"slide-{i + 1}.png"
            crop.save(shot)
            paths.append(shot)

        PDF.write_bytes(img2pdf.convert([str(p) for p in paths]))
        print(f"Wrote {PDF} ({PDF.stat().st_size} bytes, {len(paths)} pages)")


if __name__ == "__main__":
    main()
