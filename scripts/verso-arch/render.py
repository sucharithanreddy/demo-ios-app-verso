#!/usr/bin/env python3
"""Render each .mmd diagram to a high-quality PNG using Playwright + Mermaid 11 CDN.

Implements the skill's mandatory SVG-aware viewport sizing:
reads svg.getBoundingClientRect() (not CSS bounding_box) and uses
max(css_size, svg_size) + padding for the final viewport.
"""

import asyncio
import os
import sys
from pathlib import Path
from playwright.async_api import async_playwright

SCRIPT_DIR = Path("/home/z/my-project/scripts/verso-arch")
OUT_DIR = Path("/home/z/my-project/download/verso-arch")
OUT_DIR.mkdir(parents=True, exist_ok=True)

THEME_VARIABLES = """
  primaryColor: '#EFF6FF',
  primaryBorderColor: '#3B82F6',
  primaryTextColor: '#1E293B',
  lineColor: '#94A3B8',
  secondaryColor: '#F0FDF4',
  secondaryBorderColor: '#10B981',
  secondaryTextColor: '#1E293B',
  tertiaryColor: '#FFF7ED',
  tertiaryBorderColor: '#F59E0B',
  tertiaryTextColor: '#1E293B',
  noteBkgColor: '#F8FAFC',
  noteTextColor: '#6B7280',
  noteBorderColor: '#E2E8F0',
  fontSize: '15px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
"""

FLOWCHART_CFG = """
  flowchart: {
    curve: 'basis',
    padding: 32,
    nodeSpacing: 80,
    rankSpacing: 80,
    htmlLabels: true,
    wrappingWidth: 220
  },
  sequence: {
    mirrorActors: false,
    messageAlign: 'center',
    actorMargin: 70,
    boxMargin: 14,
    noteMargin: 14,
    width: 160
  },
"""


def build_html(mermaid_src: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    background: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }}
  body {{
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 56px;
  }}
  #diagram {{
    width: fit-content;
    min-width: 800px;
    background: #FFFFFF;
  }}
  .mermaid {{
    background: #FFFFFF;
  }}
</style>
</head>
<body>
  <div id="diagram">
    <pre class="mermaid">
{mermaid_src}
    </pre>
  </div>
<script>
  mermaid.initialize({{
    startOnLoad: true,
    theme: 'base',
    themeVariables: {{ {THEME_VARIABLES} }},
    {FLOWCHART_CFG}
    securityLevel: 'loose'
  }});
</script>
</body>
</html>
"""


async def render_one(mmd_path: Path, png_path: Path) -> tuple[int, int]:
    src = mmd_path.read_text()
    html = build_html(src)

    # Write temp HTML
    tmp_html = mmd_path.with_suffix(".html")
    tmp_html.write_text(html)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": 1600, "height": 1000},
            device_scale_factor=2,
        )
        await page.goto(f"file://{tmp_html.resolve()}", wait_until="load", timeout=30000)

        # Wait for Mermaid SVG to render
        await page.wait_for_selector("#diagram svg", timeout=20000)
        # Give it a moment to fully lay out (font loading, etc.)
        await page.wait_for_timeout(1200)

        # ⚠️ Read SVG's ACTUAL rendered size — not CSS box model.
        # Mermaid SVGs often overflow their CSS container.
        svg_size = await page.evaluate(
            """() => {
                const svg = document.querySelector('#diagram svg');
                if (!svg) return null;
                const r = svg.getBoundingClientRect();
                return { width: r.width, height: r.height };
            }"""
        )

        el = page.locator("#diagram")
        css_bbox = await el.bounding_box()

        svg_w = svg_size["width"] if svg_size else 1600
        svg_h = svg_size["height"] if svg_size else 1000
        css_w = css_bbox["width"] if css_bbox else 1600
        css_h = css_bbox["height"] if css_bbox else 1000

        # Use the LARGER of CSS box and SVG actual size + generous padding
        fit_w = max(1600, int(max(svg_w, css_w) + 200))
        fit_h = int(max(svg_h, css_h) + 200)

        await page.set_viewport_size({"width": fit_w, "height": fit_h})
        await page.wait_for_timeout(600)

        await el.screenshot(path=str(png_path), omit_background=False)
        await browser.close()

    return fit_w, fit_h


async def main():
    mmd_files = sorted(SCRIPT_DIR.glob("*.mmd"))
    if not mmd_files:
        print("No .mmd files found")
        sys.exit(1)

    print(f"Found {len(mmd_files)} mermaid diagrams to render\n")
    for mmd in mmd_files:
        png = OUT_DIR / f"{mmd.stem}.png"
        print(f"==> {mmd.name}")
        try:
            w, h = await render_one(mmd, png)
            size_kb = os.path.getsize(png) / 1024
            print(f"    -> {png.name}  ({w}x{h}px, {size_kb:.0f} KB)")
        except Exception as e:
            print(f"    !! FAILED: {e}")
            raise
        finally:
            # Clean up temp HTML
            tmp = mmd.with_suffix(".html")
            if tmp.exists():
                tmp.unlink()

    print("\n=== All diagrams rendered ===")
    for png in sorted(OUT_DIR.glob("*.png")):
        size_kb = os.path.getsize(png) / 1024
        print(f"  {png.name}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    asyncio.run(main())
