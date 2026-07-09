#!/usr/bin/env python3
"""Verify basic quality properties of a generated resume PDF."""

from __future__ import annotations

import argparse
from pathlib import Path

PLACEHOLDERS = [
    "download here",
    "fake link",
    "example.com/download",
    "your-email@example.com",
    "your phone",
    "your name",
    "lorem ipsum",
]


def extract_pdf_text(pdf_path: Path) -> str:
    """Extract text from a PDF using pypdf."""
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise SystemExit("pypdf is not installed. Run: pip install -r requirements.txt") from exc

    try:
        reader = PdfReader(str(pdf_path))
    except Exception as exc:  # pypdf raises several parser-specific exceptions.
        raise SystemExit(f"Could not read PDF: {exc}") from exc

    text_parts: list[str] = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()


def find_placeholders(*contents: str) -> list[str]:
    """Return placeholder phrases found in the provided content."""
    combined = "\n".join(contents).lower()
    return [phrase for phrase in PLACEHOLDERS if phrase in combined]


def verify_pdf(pdf_path: Path, html_path: Path | None) -> list[str]:
    """Return human-readable verification messages."""
    messages: list[str] = []
    if not pdf_path.exists():
        raise SystemExit(f"PDF file does not exist: {pdf_path}")
    if pdf_path.stat().st_size < 1024:
        raise SystemExit("PDF file is unexpectedly small.")

    pdf_text = extract_pdf_text(pdf_path)
    if len(pdf_text) < 80:
        raise SystemExit("PDF text extraction returned too little text; it may be image-only.")
    messages.append("PDF exists and contains extractable text.")

    html_text = ""
    if html_path:
        if not html_path.exists():
            raise SystemExit(f"HTML file does not exist: {html_path}")
        html_text = html_path.read_text(encoding="utf-8")
        messages.append("HTML debug file exists.")

    placeholders = find_placeholders(pdf_text, html_text)
    if placeholders:
        raise SystemExit(f"Placeholder or fake-link text found: {', '.join(placeholders)}")
    messages.append("No obvious placeholder or fake download text found.")

    messages.append("Manual visual review is still required for clipping, overlap, and glyph issues.")
    return messages


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify a generated resume PDF.")
    parser.add_argument("--pdf", required=True, type=Path, help="Generated PDF path.")
    parser.add_argument("--html", type=Path, help="Optional generated HTML path.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    for message in verify_pdf(args.pdf, args.html):
        print(f"- {message}")


if __name__ == "__main__":
    main()
