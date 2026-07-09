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

PAGE_WIDTHS = {
    "A4": 794,
    "Letter": 816,
}

PAGE_MIN_HEIGHTS = {
    "A4": 1123,
    "Letter": 1056,
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


def render_bullets(items: Any, class_name: str = "bullet-list") -> str:
    """Render a bullet list from JSON text values."""
    bullets = list_values(items)
    if not bullets:
        return ""
    rendered = "\n".join(f"<li>{escape(item)}</li>" for item in bullets)
    return f'<ul class="{class_name}">{rendered}</ul>'


def render_entries(entries: Any, entry_type: str) -> str:
    """Render education, experience, project, or award entries."""
    if not isinstance(entries, list):
        return ""

    blocks: list[str] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue

        if entry_type == "education":
            primary = html_text(entry.get("institution"))
            secondary = html_text(entry.get("degree"))
            meta = html_text(entry.get("dates"))
            context = html_text(entry.get("location"))
            extra = render_bullets(entry.get("details"))
        elif entry_type == "experience":
            primary = html_text(entry.get("company"))
            secondary = html_text(entry.get("role"))
            meta = html_text(entry.get("dates"))
            context = html_text(entry.get("location"))
            extra = render_bullets(entry.get("bullets"))
        elif entry_type == "projects":
            primary = html_text(entry.get("name"))
            secondary = html_text(entry.get("tech_stack"))
            meta = ""
            context = html_text(entry.get("context"))
            extra = render_bullets(entry.get("bullets"))
        else:
            primary = html_text(entry.get("name"))
            secondary = html_text(entry.get("issuer"))
            meta = html_text(entry.get("date"))
            context = ""
            extra = html_text(entry.get("details"))
            extra = f'<p class="entry-note">{extra}</p>' if extra else ""

        if not primary and not secondary and not meta and not context and not extra:
            continue

        title_line = join_parts([primary, secondary], " - ")
        meta_line = join_parts([context, meta])
        blocks.append(
            "\n".join(
                [
                    '<article class="entry">',
                    '<div class="entry-head">',
                    f'<strong class="entry-title">{title_line}</strong>' if title_line else "",
                    f'<span class="entry-meta">{meta_line}</span>' if meta_line else "",
                    "</div>",
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
                    f'<li><strong>{html_text(category)}:</strong> {rendered_values}</li>'
                )
        return f'<ul class="skills-list">{"".join(rows)}</ul>' if rows else ""

    values = ", ".join(escape(item) for item in list_values(skills))
    return f'<ul class="skills-list"><li>{values}</li></ul>' if values else ""


def section(title: str, body: str) -> str:
    """Wrap non-empty content in a resume section."""
    if not body.strip():
        return ""
    return f"""
    <section class="section">
      <h2>{escape(title)}</h2>
      {body}
    </section>
    """


def style_css(style: str, include_photo: bool, page_size: str) -> str:
    """Return printable CSS for the chosen resume style."""
    if style == "classic-professional":
        accent = "#111827"
        accent_soft = "#f3f4f6"
        panel = "#f9fafb"
        rust = "#6b7280"
        top_border = "#111827"
        font = "Georgia, 'Times New Roman', serif"
    elif style == "creative-clean":
        accent = "#2f6f73"
        accent_soft = "#e9f5f4"
        panel = "#f7fbfb"
        rust = "#d97757"
        top_border = "#2f6f73"
        font = "'Noto Sans CJK SC', 'Microsoft YaHei', 'PingFang SC', Aptos, Calibri, Arial, sans-serif"
    else:
        accent = "#2563eb"
        accent_soft = "#eaf1ff"
        panel = "#f7f9fc"
        rust = "#d97757"
        top_border = "#111827"
        font = "'Noto Sans CJK SC', 'Microsoft YaHei', 'PingFang SC', Aptos, Calibri, Arial, sans-serif"

    photo_css = "grid-template-columns: 112px minmax(0, 1fr);" if include_photo else "grid-template-columns: 1fr;"
    page_width = "816px" if page_size == "Letter" else "794px"
    page_min_height = "1056px" if page_size == "Letter" else "1123px"
    return f"""
    :root {{
      --page-width: {page_width};
      --page-min-height: {page_min_height};
      --accent: {accent};
      --accent-soft: {accent_soft};
      --rust: {rust};
      --ink: #141922;
      --muted: #667085;
      --hairline: #dbe2ea;
      --panel: {panel};
      --screen-bg: #eef2f7;
      --top-border: {top_border};
    }}
    @page {{
      margin: 0;
      size: {page_size};
    }}
    * {{
      box-sizing: border-box;
    }}
    html,
    body {{
      margin: 0;
      min-height: 100%;
    }}
    body {{
      background: linear-gradient(180deg, #eef2f7 0%, #f8fafc 48%, #eef2f7 100%);
      color: var(--ink);
      font-family: {font};
      font-size: 13.5px;
      line-height: 1.28;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}
    .page-shell {{
      padding: 22px 0 30px;
    }}
    .resume {{
      background: #fff;
      border: 1px solid rgba(148, 163, 184, 0.24);
      box-shadow: 0 18px 52px rgba(15, 23, 42, 0.13);
      margin: 0 auto;
      min-height: var(--page-min-height);
      padding: 34px 40px 38px;
      width: min(calc(100vw - 48px), var(--page-width));
    }}
    .resume-header {{
      align-items: stretch;
      background: #fff;
      border: 1px solid var(--hairline);
      border-radius: 6px;
      border-top: 4px solid var(--top-border);
      display: grid;
      {photo_css}
      gap: 20px;
      margin-bottom: 20px;
      padding: 18px 20px 20px;
    }}
    h1 {{
      margin: 0 0 8px;
      color: #111827;
      font-size: 34px;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: 0;
    }}
    .profile-main {{
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }}
    .target {{
      color: var(--muted);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.2;
      margin: 0 0 12px;
    }}
    .contact {{
      align-items: flex-start;
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 0;
    }}
    .contact-item {{
      background: #f8fafc;
      border: 1px solid var(--hairline);
      border-radius: 4px;
      color: #1f2937;
      display: inline-flex;
      font-size: 12.2px;
      font-weight: 650;
      line-height: 1.2;
      min-height: 27px;
      padding: 5px 8px;
    }}
    .photo {{
      aspect-ratio: 3 / 4;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      display: block;
      height: 136px;
      object-fit: cover;
      width: 102px;
    }}
    .section {{
      margin-top: 16px;
      break-inside: avoid;
    }}
    .section:first-of-type {{
      margin-top: 0;
    }}
    .section h2 {{
      align-items: center;
      color: #101828;
      display: flex;
      font-size: 16px;
      font-weight: 800;
      gap: 9px;
      line-height: 1.05;
      margin: 0 0 9px;
    }}
    .section h2::after {{
      background: linear-gradient(90deg, var(--accent) 0%, rgba(37, 99, 235, 0.11) 100%);
      content: "";
      flex: 1;
      height: 2px;
      margin-left: 2px;
    }}
    .entry {{
      border-left: 3px solid var(--accent-soft);
      break-inside: avoid;
      margin-top: 12px;
      padding-left: 12px;
      position: relative;
    }}
    .entry::before {{
      background: var(--accent);
      border: 2px solid #fff;
      border-radius: 999px;
      box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.24);
      content: "";
      height: 7px;
      left: -5px;
      position: absolute;
      top: 3px;
      width: 7px;
    }}
    .entry:first-of-type {{
      margin-top: 0;
    }}
    .entry-head {{
      align-items: start;
      display: grid;
      gap: 10px;
      grid-template-columns: minmax(0, 1fr) max-content;
      line-height: 1.18;
      margin-bottom: 4px;
    }}
    .entry-title {{
      color: #111827;
      font-size: 13.7px;
      font-weight: 800;
    }}
    .entry-meta {{
      color: #4b5563;
      font-size: 12.1px;
      font-weight: 700;
      text-align: right;
    }}
    p {{
      margin: 0 0 5px;
    }}
    .section > p,
    .entry-note {{
      font-size: 13.2px;
      line-height: 1.34;
    }}
    .bullet-list {{
      font-size: 13.05px;
      line-height: 1.34;
      list-style-position: outside;
      margin: 0;
      padding-left: 19px;
    }}
    .bullet-list li {{
      margin: 3px 0 0;
      padding-left: 2px;
    }}
    .bullet-list li::marker {{
      color: var(--accent);
      font-size: 0.9em;
    }}
    .skills-list {{
      background: var(--panel);
      border: 1px solid var(--hairline);
      border-radius: 8px;
      columns: 2;
      column-gap: 24px;
      font-size: 12.9px;
      line-height: 1.35;
      list-style: none;
      margin: 0;
      padding: 10px 12px;
    }}
    .skills-list li {{
      break-inside: avoid;
      margin: 3px 0 0;
      padding-left: 11px;
      position: relative;
    }}
    .skills-list li::before {{
      background: var(--rust);
      border-radius: 999px;
      content: "";
      height: 5px;
      left: 0;
      position: absolute;
      top: 6px;
      width: 5px;
    }}
    @media (max-width: 720px) {{
      .page-shell {{
        padding: 0;
      }}
      .resume {{
        border: 0;
        box-shadow: none;
        padding: 26px 20px 32px;
        width: 100vw;
      }}
      .resume-header {{
        grid-template-columns: 1fr;
        padding: 16px;
      }}
      .entry-head {{
        grid-template-columns: 1fr;
        gap: 3px;
      }}
      .entry-meta {{
        text-align: left;
      }}
      .skills-list {{
        columns: 1;
      }}
    }}
    @media print {{
      html,
      body {{
        background: #fff;
        width: var(--page-width);
      }}
      .page-shell {{
        padding: 0;
      }}
      .resume {{
        border: 0;
        box-shadow: none;
        margin: 0;
        min-height: var(--page-min-height);
        width: var(--page-width);
      }}
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
    contact_line = "".join(
        f'<span class="contact-item">{item}</span>' for item in contact_items if item
    )

    photo = f'<img class="photo" src="{photo_uri}" alt="User-provided formal photo">' if photo_uri else ""

    education = render_entries(data.get("education"), "education")
    experience = render_entries(data.get("experience"), "experience")
    projects = render_entries(data.get("projects"), "projects")
    skills = render_skills(data.get("skills"))
    awards = render_entries(data.get("certifications_awards"), "awards")

    candidate_level = text(data.get("candidate_level")).lower()
    experienced = any(word in candidate_level for word in ["senior", "experienced", "mid", "lead"])

    sections = []
    summary = html_text(data.get("summary"))
    sections.append(section("Professional Summary", f'<p class="summary">{summary}</p>'))
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

    css = style_css(style, bool(photo_uri), page_size)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{name} Resume</title>
  <style>{css}</style>
</head>
<body data-page-size="{escape(page_size)}">
  <div class="page-shell">
    <main class="resume" aria-label="{name} resume">
      <header class="resume-header">
        {photo}
        <div class="profile-main">
        <h1>{name}</h1>
        {f'<p class="target">{target_line}</p>' if target_line else ''}
        {f'<p class="contact">{contact_line}</p>' if contact_line else ''}
      </div>
      </header>
      {''.join(sections)}
    </main>
  </div>
</body>
</html>
"""


def write_html(html: str, path: Path) -> None:
    """Write HTML output, creating parent directories."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")


def build_pdf(html_path: Path, pdf_path: Path, page_size: str) -> None:
    """Render a PDF from the screen layout, matching the HTML preview closely."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "Playwright is not installed. Run: pip install -r requirements.txt"
        ) from exc

    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    page_width = PAGE_WIDTHS[page_size]
    min_height = PAGE_MIN_HEIGHTS[page_size]
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(
            device_scale_factor=1,
            viewport={"width": page_width, "height": 1800},
        )
        page.emulate_media(media="screen")
        page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
        page.evaluate("() => document.fonts && document.fonts.ready")
        page.add_style_tag(
            content=f"""
            html, body {{
              background: #fff !important;
              margin: 0 !important;
              padding: 0 !important;
            }}
            .page-shell {{
              padding: 0 !important;
            }}
            .resume {{
              border: 0 !important;
              box-shadow: none !important;
              margin: 0 !important;
              min-height: {min_height}px !important;
              width: {page_width}px !important;
            }}
            """
        )
        measured = page.evaluate(
            """() => {
              const resume = document.querySelector(".resume");
              if (!resume) {
                throw new Error("Could not find .resume element.");
              }
              const rect = resume.getBoundingClientRect();
              const lastChild = resume.lastElementChild;
              const lastRect = lastChild ? lastChild.getBoundingClientRect() : null;
              const paddingBottom = Number.parseFloat(getComputedStyle(resume).paddingBottom) || 0;
              const contentBottom = lastRect ? lastRect.bottom - rect.top + paddingBottom : resume.scrollHeight;
              return {
                width: Math.ceil(rect.width),
                height: Math.ceil(Math.max(resume.scrollHeight, contentBottom))
              };
            }"""
        )
        pdf_width = int(measured["width"])
        pdf_height = max(min_height, int(measured["height"]) + 16)
        page.add_style_tag(
            content=f"""
            @page {{
              margin: 0;
              size: {pdf_width}px {pdf_height}px;
            }}
            """
        )
        page.set_viewport_size({"width": pdf_width, "height": pdf_height})
        page.pdf(
            path=str(pdf_path),
            width=f"{pdf_width}px",
            height=f"{pdf_height}px",
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            print_background=True,
            prefer_css_page_size=True,
            scale=1,
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
