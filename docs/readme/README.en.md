# Easy-Job-Tutor

[Back to language selection](../../README.md)

## Skill Preview

![Easy-Job-Tutor workflow](../../assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](../../assets/readme/resume-pdf-preview.png)

## What It Does

Easy-Job-Tutor is an open-source Codex Skill for job description analysis, resume optimization, application materials, interview preparation, and ATS-friendly PDF resume generation.

It helps users turn a target role and their real background into stronger job-search materials.

It can:

- Analyze job descriptions and extract role requirements.
- Score resume fit against a target JD.
- Rewrite resume bullets using real evidence only.
- Draft application emails, cover letters, and referral messages.
- Prepare interview questions and answer frameworks.
- Generate clean, text-based PDF resumes when explicitly requested.

## Resume PDF Builder

The optional Resume PDF Builder turns optimized resume content into a polished, recruiter-friendly PDF.

Supported styles:

- `Classic Professional`: finance, consulting, law, government, education, traditional corporate, administration, accounting, and audit.
- `Modern Minimal`: default; technology, data, AI, software engineering, product, business analyst, startup, and internet roles.
- `Creative Clean`: marketing, content, media, branding, design-adjacent, and creator roles.

Photo behavior:

- No photo by default.
- If the user wants a photo, they must upload a clear, formal, front-facing image.
- The builder uses only user-provided photos and keeps resume text selectable.

## Installation

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

To install as a local Codex Skill:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## Build a Sample PDF

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

Verify the generated PDF:

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

## Quality Principles

- Do not fabricate resume content.
- Prefer ATS-friendly, text-based PDF output.
- Avoid excessive decoration, complex tables, skill bars, and image-only resumes.
- Verify layout quality before treating the PDF as final.
- Do not create fake download links in examples or responses.

## License

MIT
