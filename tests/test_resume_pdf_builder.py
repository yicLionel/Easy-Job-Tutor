from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


builder = load_module("build_resume_pdf", ROOT / "scripts" / "build_resume_pdf.py")
verifier = load_module("verify_resume_pdf", ROOT / "scripts" / "verify_resume_pdf.py")


def test_normalize_style_defaults_and_aliases():
    assert builder.normalize_style(None) == "modern-minimal"
    assert builder.normalize_style("Modern Minimal") == "modern-minimal"
    assert builder.normalize_style("classic") == "classic-professional"
    assert builder.normalize_style("Creative Clean") == "creative-clean"
    assert builder.normalize_style("unknown") == "modern-minimal"


def test_render_resume_html_escapes_user_content():
    data = {
        "header": {
            "name": "<Alex>",
            "email": "alex@example.com",
            "phone": "+61 400 000 000",
        },
        "summary": "Built <script>alert(1)</script> safely.",
        "education": [],
        "experience": [],
        "projects": [],
        "skills": ["Python"],
        "certifications_awards": [],
        "target_role": "Software Engineer",
        "target_industry": "Technology",
        "candidate_level": "student",
        "include_photo": False,
    }

    html = builder.render_resume_html(data, "modern-minimal", "A4")

    assert "&lt;Alex&gt;" in html
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html
    assert "Software Engineer" in html
    assert 'class="resume-header"' in html
    assert 'class="contact-item"' in html


def test_missing_photo_path_raises_when_photo_requested(tmp_path):
    data = {
        "header": {"name": "Alex Chen"},
        "include_photo": True,
        "photo_path": "missing.png",
        "_source_dir": str(tmp_path),
    }

    with pytest.raises(SystemExit):
        builder.render_resume_html(data, "modern-minimal", "A4")


def test_find_placeholders_detects_fake_download_text():
    found = verifier.find_placeholders("Click download here for the resume.")
    assert "download here" in found


def test_sample_resume_renders_required_sections():
    data = builder.load_resume(ROOT / "examples" / "sample-resume.json")
    html = builder.render_resume_html(data, "modern-minimal", "A4")

    assert "Alex Chen" in html
    assert "Professional Summary" in html
    assert "Education" in html
    assert "Projects" in html
    assert "Skills" in html
    assert 'class="page-shell"' in html
    assert 'class="skills-list"' in html


def test_style_css_uses_vibe_style_page_canvas():
    css = builder.style_css("modern-minimal", include_photo=False, page_size="A4")

    assert "--page-width: 794px" in css
    assert ".resume-header" in css
    assert ".section h2::after" in css
    assert "@media print" in css
