#!/usr/bin/env python3
"""Build a text-based resume HTML file and PDF from structured JSON."""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
from html import escape
from pathlib import Path
from typing import Any

SUPPORTED_STYLES = {
    "classic-professional",
    "modern-minimal",
    "creative-clean",
}

STYLE_ALIASES = {
    "classic": "classic-professional",
    "classic professional": "classic-professional",
    "classic-professional": "classic-professional",
    "modern": "modern-minimal",
    "modern minimal": "modern-minimal",
    "modern-minimal": "modern-minimal",
    "creative": "creative-clean",
    "creative clean": "creative-clean",
    "creative-clean": "creative-clean",
}


def normalize_style(style: str | None) -> str:
    """Return a supported style slug, defaulting to modern-minimal."""
    if not style:
        return "modern-minimal"
    normalized = style.strip().lower().replace("_", "-")
    return STYLE_ALIASES.get(normalized, "modern-minimal")


def load_resume(path: Path) -> dict[str, Any]:
    """Read and validate the JSON resume input."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"Input file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Input is not valid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise SystemExit("Input JSON must contain one resume object.")
    return data


def text(value: Any, default: str = "") -> str:
    """Convert a simple JSON value to safe display text."""
    if value is None:
        return default
    if isinstance(value, (str, int, float)):
        return str(value).strip()
    return default


def list_values(value: Any) -> list[str]:
    """Return a clean list of text values from a JSON list or scalar."""
    if value is None:
        return []
    if isinstance(value, list):
        return [text(item) for item in value if text(item)]
    single = text(value)
    return [single] if single else []


def html_text(value: Any, default: str = "") -> str:
    """Escape a JSON value for HTML text nodes."""
    return escape(text(value, default))


def join_parts(parts: list[str], separator: str = " | ") -> str:
    """Join non-empty, already-escaped strings."""
    return separator.join(part for part in parts if part)


def read_photo_data_uri(photo_path: str, base_dir: Path) -> str:
    """Load a user-provided photo as a data URI when it exists."""
    if not photo_path:
        return ""

    path = Path(photo_path).expanduser()
    if not path.is_absolute():
        path = base_dir / path

    if not path.exists() or not path.is_file():
        raise SystemExit(f"Photo path does not exist: {path}")

    mime_type, _ = mimetypes.guess_type(path)
    if mime_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise SystemExit("Photo must be a JPEG, PNG, or WebP image.")

    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def render_bullets(items: Any) -> str:
    """Render a bullet list from JSON text values."""
    bullets = list_values(items)
    if not bullets:
        return ""
    rendered = "\n".join(f"<li>{escape(item)}</li>" for item in bullets)
    return f"<ul>{rendered}</ul>"


def render_entries(entries: Any, entry_type: str) -> str:
    """Render education, experience, project, or award entries."""
    if not isinstance(entries, list):
        return ""

    blocks: list[str] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue

        if entry_type == "education":
            title = join_parts(
                [
                    html_text(entry.get("degree")),
                    html_text(entry.get("institution")),
                ],
                ", ",
            )
            subtitle = join_parts(
                [
                    html_text(entry.get("location")),
                    html_text(entry.get("dates")),
                ]
            )
            extra = render_bullets(entry.get("details"))
        elif entry_type == "experience":
            title = join_parts(
                [
                    html_text(entry.get("company")),
                    html_text(entry.get("role")),
                ],
                " - ",
            )
            subtitle = join_parts(
                [
                    html_text(entry.get("location")),
                    html_text(entry.get("dates")),
                ]
            )
            extra = render_bullets(entry.get("bullets"))
        elif entry_type == "projects":
            title = html_text(entry.get("name"))
            subtitle = join_parts(
                [
                    html_text(entry.get("tech_stack")),
                    html_text(entry.get("context")),
                ]
            )
            extra = render_bullets(entry.get("bullets"))
        else:
            title = html_text(entry.get("name"))
            subtitle = join_parts(
                [
                    html_text(entry.get("issuer")),
                    html_text(entry.get("date")),
                ]
            )
            extra = html_text(entry.get("details"))
            extra = f"<p>{extra}</p>" if extra else ""

        if not title and not subtitle and not extra:
            continue

        blocks.append(
            "\n".join(
                [
                    '<article class="entry">',
                    f'<div class="entry-title">{title}</div>' if title else "",
                    f'<div class="entry-meta">{subtitle}</div>' if subtitle else "",
                    extra,
                    "</article>",
                ]
            )
        )

    return "\n".join(blocks)


def render_skills(skills: Any) -> str:
    """Render skills grouped by category when possible."""
    if isinstance(skills, dict):
        rows = []
        for category, values in skills.items():
            rendered_values = ", ".join(escape(item) for item in list_values(values))
            if rendered_values:
                rows.append(
                    f'<p class="skill-row"><strong>{html_text(category)}:</strong> {rendered_values}</p>'
                )
        return "\n".join(rows)

    values = ", ".join(escape(item) for item in list_values(skills))
    return f'<p class="skill-row">{values}</p>' if values else ""


def section(title: str, body: str) -> str:
    """Wrap non-empty content in a resume section."""
    if not body.strip():
        return ""
    return f"""
    <section>
      <h2>{escape(title)}</h2>
      {body}
    </section>
    """


def style_css(style: str, include_photo: bool) -> str:
    """Return printable CSS for the chosen resume style."""
    if style == "classic-professional":
        accent = "#111111"
        font = "Georgia, 'Times New Roman', serif"
        heading_transform = "uppercase"
    elif style == "creative-clean":
        accent = "#2f6f73"
        font = "Aptos, Calibri, Arial, sans-serif"
        heading_transform = "none"
    else:
        accent = "#2563eb"
        font = "Aptos, Calibri, Arial, sans-serif"
        heading_transform = "uppercase"

    photo_css = "grid-template-columns: 1fr 92px;" if include_photo else "grid-template-columns: 1fr;"
    return f"""
    @page {{
      margin: 14mm 15mm;
    }}
    * {{
      box-sizing: border-box;
    }}
    body {{
      margin: 0;
      color: #1f2933;
      font-family: {font};
      font-size: 10.3pt;
      line-height: 1.36;
      background: #ffffff;
    }}
    .resume {{
      max-width: 780px;
      margin: 0 auto;
    }}
    header {{
      display: grid;
      {photo_css}
      gap: 18px;
      align-items: start;
      border-bottom: 1.4px solid {accent};
      padding-bottom: 10px;
      margin-bottom: 13px;
    }}
    h1 {{
      margin: 0 0 5px;
      color: #111827;
      font-size: 25pt;
      line-height: 1.05;
      letter-spacing: 0;
    }}
    .target {{
      margin: 0 0 5px;
      color: {accent};
      font-weight: 700;
    }}
    .contact {{
      color: #374151;
      font-size: 9.5pt;
    }}
    .photo {{
      width: 86px;
      height: 104px;
      object-fit: cover;
      border: 1px solid #d1d5db;
    }}
    section {{
      margin: 0 0 11px;
      break-inside: avoid;
    }}
    h2 {{
      margin: 0 0 5px;
      color: {accent};
      font-size: 10pt;
      letter-spacing: 0;
      text-transform: {heading_transform};
      border-bottom: 1px solid #d8dee8;
      padding-bottom: 2px;
    }}
    .entry {{
      margin: 0 0 7px;
      break-inside: avoid;
    }}
    .entry-title {{
      color: #111827;
      font-weight: 700;
    }}
    .entry-meta {{
      color: #4b5563;
      font-size: 9.4pt;
      margin-top: 1px;
    }}
    p {{
      margin: 0 0 5px;
    }}
    ul {{
      margin: 3px 0 0 17px;
      padding: 0;
    }}
    li {{
      margin: 0 0 2px;
      padding-left: 1px;
    }}
    .skill-row {{
      margin-bottom: 3px;
    }}
    """


def render_resume_html(data: dict[str, Any], style: str, page_size: str) -> str:
    """Build the final HTML document."""
    header = data.get("header") if isinstance(data.get("header"), dict) else {}
    include_photo = bool(data.get("include_photo")) and bool(text(data.get("photo_path")))
    photo_uri = ""
    if include_photo:
        source_dir = Path(text(data.get("_source_dir"), "."))
        photo_uri = read_photo_data_uri(text(data.get("photo_path")), source_dir)

    name = html_text(header.get("name"), "Your Name")
    target_role = html_text(data.get("target_role"))
    target_industry = html_text(data.get("target_industry"))
    target_line = join_parts([target_role, target_industry], " · ")

    contact_items = [
        html_text(header.get("email")),
        html_text(header.get("phone")),
        html_text(header.get("location")),
        html_text(header.get("linkedin")),
        html_text(header.get("github")),
        html_text(header.get("portfolio")),
    ]
    contact_line = join_parts(contact_items)

    photo = f'<img class="photo" src="{photo_uri}" alt="User-provided formal photo">' if photo_uri else ""

    education = render_entries(data.get("education"), "education")
    experience = render_entries(data.get("experience"), "experience")
    projects = render_entries(data.get("projects"), "projects")
    skills = render_skills(data.get("skills"))
    awards = render_entries(data.get("certifications_awards"), "awards")

    candidate_level = text(data.get("candidate_level")).lower()
    experienced = any(word in candidate_level for word in ["senior", "experienced", "mid", "lead"])

    sections = []
    sections.append(section("Professional Summary", f"<p>{html_text(data.get('summary'))}</p>"))
    if experienced:
        sections.extend(
            [
                section("Experience", experience),
                section("Skills", skills),
                section("Education", education),
                section("Projects", projects),
                section("Certifications / Awards", awards),
            ]
        )
    else:
        sections.extend(
            [
                section("Education", education),
                section("Experience", experience),
                section("Projects", projects),
                section("Skills", skills),
                section("Certifications / Awards", awards),
            ]
        )

    css = style_css(style, bool(photo_uri))
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{name} Resume</title>
  <style>{css}</style>
</head>
<body data-page-size="{escape(page_size)}">
  <main class="resume">
    <header>
      <div>
        <h1>{name}</h1>
        {f'<p class="target">{target_line}</p>' if target_line else ''}
        {f'<p class="contact">{contact_line}</p>' if contact_line else ''}
      </div>
      {photo}
    </header>
    {''.join(sections)}
  </main>
</body>
</html>
"""


def write_html(html: str, path: Path) -> None:
    """Write HTML output, creating parent directories."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")


def build_pdf(html_path: Path, pdf_path: Path, page_size: str) -> None:
    """Render a PDF with Playwright Chromium."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "Playwright is not installed. Run: pip install -r requirements.txt"
        ) from exc

    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.goto(html_path.resolve().as_uri(), wait_until="load")
        page.pdf(
            path=str(pdf_path),
            format=page_size,
            print_background=True,
            prefer_css_page_size=False,
        )
        browser.close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build an ATS-friendly resume PDF.")
    parser.add_argument("--input", required=True, type=Path, help="Input resume JSON path.")
    parser.add_argument("--output", required=True, type=Path, help="Output PDF path.")
    parser.add_argument("--html", required=True, type=Path, help="Debug HTML output path.")
    parser.add_argument(
        "--style",
        default=None,
        help="classic-professional, modern-minimal, or creative-clean.",
    )
    parser.add_argument(
        "--page-size",
        default="A4",
        choices=["A4", "Letter"],
        help="PDF page size.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = load_resume(args.input)
    data["_source_dir"] = str(args.input.parent)
    style = normalize_style(args.style or text(data.get("style")))
    if style not in SUPPORTED_STYLES:
        raise SystemExit(f"Unsupported style: {style}")

    html = render_resume_html(data, style, args.page_size)
    write_html(html, args.html)
    build_pdf(args.html, args.output, args.page_size)
    print(f"Wrote HTML: {args.html}")
    print(f"Wrote PDF: {args.output}")
    print("Review the rendered PDF for clipping, overlap, and glyph issues before final use.")


if __name__ == "__main__":
    main()
