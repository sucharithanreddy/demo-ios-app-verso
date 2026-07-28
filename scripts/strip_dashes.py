#!/usr/bin/env python3
"""
Strip em dashes (U+2014), en dashes (U+2013), and common Unicode box-drawing
horizontal chars (U+2500-U+2503, U+2507, U+2509, U+254C-U+254F) from every
text file under /home/z/my-project, replacing them with a plain ASCII hyphen.

Strategy:
  - Literal character swap: each Unicode horizontal -> ASCII '-'.
  - This preserves surrounding whitespace, so:
      * spaced em dash        -> " - "
      * "wordXword"           -> "word-word"
      * "80X100"              -> "80-100"
      * "XX Section XX"       -> "-- Section --"
  - All common cases produce natural, idiomatic output without further
    post-processing.

Skip rules:
  - VCS / build / cache directories:  .git, node_modules, .next, dist, build,
    .turbo, .cache, coverage, .vscode, .idea
  - Binary / asset file extensions:   images, fonts, archives, lockfiles,
    .env files, PDFs, etc.
  - The demo-ios-app-verso/workspace/pptx_extract/ tree (extracted PPTX XML,
    regenerated artifacts - not authored code).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project")

# Directories we never descend into.
SKIP_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".turbo",
    ".cache",
    "coverage",
    ".vscode",
    ".idea",
    "__pycache__",
    ".pytest_cache",
}

# File extensions we touch (everything text-like we author).
TEXT_EXTENSIONS = {
    # source
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".rb", ".go", ".rs", ".java", ".kt", ".swift",
    ".php", ".pl",
    # web / style
    ".html", ".htm", ".css", ".scss", ".sass", ".less",
    ".vue", ".svelte", ".astro",
    # data / config
    ".json", ".yml", ".yaml", ".toml", ".ini", ".cfg",
    ".xml", ".sql", ".prisma", ".graphql", ".gql",
    ".env.example", ".env.local.example", ".env.sample",
    # docs
    ".md", ".mdx", ".txt", ".rst",
    # shell
    ".sh", ".bash", ".zsh", ".fish",
    # misc
    ".gitignore", ".dockerignore", ".editorconfig", ".babelrc", ".eslintrc",
    ".prettierrc", ".npmrc",
}

# Filenames without an extension that we still want to touch.
TEXT_FILENAMES = {
    ".gitignore",
    ".dockerignore",
    ".editorconfig",
    ".prettierrc",
    ".eslintrc",
    ".babelrc",
    ".npmrc",
    "Makefile",
    "Dockerfile",
    "Procfile",
}

# Files we explicitly skip (binary / lock / generated).
SKIP_FILENAMES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "composer.lock",
}

# Path prefixes we never touch.
SKIP_PATH_PARTS = (
    "demo-ios-app-verso/workspace/pptx_extract",
    "demo-ios-app-verso/node_modules",
    "verso-mobile/node_modules",
)


def should_skip_dir(path: Path) -> bool:
    return path.name in SKIP_DIRS


def should_touch_file(path: Path) -> bool:
    name = path.name
    if name in SKIP_FILENAMES:
        return False
    if name in TEXT_FILENAMES:
        return True
    suffix = path.suffix.lower()
    if suffix in TEXT_EXTENSIONS:
        return True
    # Allow extensionless dotfiles like .env.example
    if "." in name and name.split(".")[-1].lower() in {"example", "sample", "local"}:
        return True
    return False


def should_skip_path(path: Path) -> bool:
    rel = str(path.relative_to(ROOT))
    for part in SKIP_PATH_PARTS:
        if part in rel:
            return True
    return False


# Characters we treat as "horizontal line" and swap to '-'.
# Keyed by codepoint so we can count each kind separately for the report.
TARGET_CHARS = {
    "\u2014": "em_dash",       # em dash
    "\u2013": "en_dash",       # en dash
    "\u2500": "box_light",     # box drawings light horizontal
    "\u2501": "box_heavy",     # box drawings heavy horizontal
    "\u2502": "box_light_d",   # box drawings light double dash horizontal
    "\u2503": "box_heavy_d",   # box drawings heavy double dash horizontal
    "\u2507": "box_heavy_3d",  # box drawings heavy triple dash horizontal
    "\u2509": "box_light_3d",  # box drawings light triple dash horizontal
    "\u254c": "dash_light",    # box drawings light double dash horizontal
    "\u254d": "dash_heavy",    # box drawings heavy double dash horizontal
    "\u254e": "dash_light_v",  # box drawings light double dash vertical
    "\u254f": "dash_heavy_v",  # box drawings heavy double dash vertical
}


def process_file(path: Path) -> dict[str, int]:
    """Return a {char_name: count} dict of replacements made in this file."""
    try:
        original = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        # Binary file or unreadable - skip silently.
        return {}

    counts: dict[str, int] = {}
    new_content = original
    for ch, name in TARGET_CHARS.items():
        c = original.count(ch)
        if c:
            counts[name] = c
            new_content = new_content.replace(ch, "-")

    if not counts:
        return {}

    path.write_text(new_content, encoding="utf-8")
    return counts


def main() -> int:
    total_files = 0
    totals: dict[str, int] = {}
    changed_files: list[tuple[str, dict[str, int]]] = []

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Prune skipped dirs in-place so os.walk doesn't descend.
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        root_path = Path(dirpath)
        if should_skip_path(root_path):
            dirnames[:] = []
            continue

        for fname in filenames:
            file_path = root_path / fname
            if should_skip_path(file_path):
                continue
            if not should_touch_file(file_path):
                continue
            counts = process_file(file_path)
            if counts:
                total_files += 1
                for name, c in counts.items():
                    totals[name] = totals.get(name, 0) + c
                changed_files.append((str(file_path.relative_to(ROOT)), counts))

    # Report
    print("=" * 72)
    print("Unicode dash replacement summary")
    print("=" * 72)
    print(f"Files changed:  {total_files}")
    for name, c in sorted(totals.items()):
        print(f"  {name:<18} {c}")
    print(f"  {'TOTAL':<18} {sum(totals.values())}")
    print("-" * 72)
    for rel, counts in changed_files:
        summary = ", ".join(f"{k}={v}" for k, v in sorted(counts.items()))
        print(f"  {rel}  ({summary})")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
