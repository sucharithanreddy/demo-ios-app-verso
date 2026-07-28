#!/usr/bin/env python3
"""
Strip em dashes (-, U+2014) and en dashes (-, U+2013) from every text file
under /home/z/my-project, replacing them with a plain ASCII hyphen (-).

Strategy:
  - Literal character swap:  - -> -   and   - -> -
  - This preserves surrounding whitespace, so:
      * " - " (spaced em dash)   -> " - "   (spaced hyphen)
      * "word-word"              -> "word-word"
      * "80-100"                 -> "80-100"
      * "Apr 2024 - Aug 2025"    -> "Apr 2024 - Aug 2025"
  - All four common cases produce natural, idiomatic output without further
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


def process_file(path: Path) -> tuple[int, int]:
    """Return (em_dash_count, en_dash_count) replaced in this file."""
    try:
        original = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        # Binary file or unreadable - skip silently.
        return (0, 0)

    em_count = original.count("\u2014")
    en_count = original.count("\u2013")
    if em_count == 0 and en_count == 0:
        return (0, 0)

    new_content = original.replace("\u2014", "-").replace("\u2013", "-")
    path.write_text(new_content, encoding="utf-8")
    return (em_count, en_count)


def main() -> int:
    total_files = 0
    total_em = 0
    total_en = 0
    changed_files: list[tuple[str, int, int]] = []

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
            em, en = process_file(file_path)
            if em or en:
                total_files += 1
                total_em += em
                total_en += en
                changed_files.append((str(file_path.relative_to(ROOT)), em, en))

    # Report
    print("=" * 72)
    print("Em/en dash replacement summary")
    print("=" * 72)
    print(f"Files changed:   {total_files}")
    print(f"Em dashes (-):   {total_em}")
    print(f"En dashes (-):   {total_en}")
    print(f"Total replaced:  {total_em + total_en}")
    print("-" * 72)
    for rel, em, en in changed_files:
        print(f"  {rel}  (-={em}, -={en})")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
