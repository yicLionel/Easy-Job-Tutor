# Easy-Job-Tutor

Easy-Job-Tutor is an open-source Codex Skill for job description analysis, resume optimization, application materials, interview preparation, and ATS-friendly PDF resume generation.

## Choose Your Language

| Language | README |
| --- | --- |
| English | [README.en.md](docs/readme/README.en.md) |
| 中文 | [README.zh-CN.md](docs/readme/README.zh-CN.md) |
| Français | [README.fr.md](docs/readme/README.fr.md) |
| 日本語 | [README.ja.md](docs/readme/README.ja.md) |
| Español | [README.es.md](docs/readme/README.es.md) |
| Deutsch | [README.de.md](docs/readme/README.de.md) |

## Project Overview

Easy-Job-Tutor helps users turn a target role and their real background into stronger job-search materials.

It can:

- Analyze job descriptions and extract role requirements.
- Score resume fit against a target JD.
- Rewrite resume bullets using real evidence only.
- Draft application emails, cover letters, and referral messages.
- Prepare interview questions and answer frameworks.
- Generate clean, text-based PDF resumes when explicitly requested.

## Skill Preview

![Easy-Job-Tutor workflow](assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](assets/readme/resume-pdf-preview.png)

## Quick Start

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Install as a local Codex Skill:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## License

MIT
