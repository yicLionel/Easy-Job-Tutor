---
name: easy-job-tutor
description: This skill should be used when the user asks for job description analysis, resume optimization, resume bullet rewriting, application emails, cover letters, LinkedIn or referral messages, interview preparation, or explicit ATS-friendly PDF resume generation, design, export, or formatting.
---

# Easy Job Tutor

## Goal

Help users turn a target role and their real background into stronger job-search materials. Support JD analysis, resume optimization, application messages, interview preparation, and an optional Resume PDF Builder.

## Core Rules

- Preserve factual accuracy. Do not invent experience, education, skills, certifications, dates, grades, metrics, awards, publications, or outcomes.
- Use the user's provided resume and background as the source of truth.
- If information is missing, ask only for the critical missing fields needed for the requested output.
- If the user has already provided optimized resume content, do not ask them to repeat it.
- Keep guidance practical, concise, and suitable for real applications.
- Prefer clear, undergraduate-friendly explanations when explaining edits or strategy.
- Track every candidate fact as `confirmed`, `pending_confirmation`, or `model_inference`, including its source and evidence.
- Only `confirmed` facts may enter the final resume（最终简历）, ATS version, or PDF Builder input.
- A `pending_confirmation` or `model_inference` fact may appear only in diagnostics, follow-up questions, or review notes.

## Resume Optimization Gate

Before making a candidate-fit claim or drafting a final resume, route the request into exactly one of these modes:

| Mode | Required input | Allowed output | Do not output |
| --- | --- | --- | --- |
| 完整材料 | Resume and one target JD | Full diagnosis, rewrite, five-dimension review, and optional PDF handoff | Unsupported facts |
| 多 JD | Resume and two or more target JDs | Shared fact baseline plus a separate version and difference table for each JD | A mixed universal version or cross-version fact changes |
| 仅简历 | Resume without a target JD | Resume baseline diagnosis, structure checks, and targeted questions for a JD | JD-match score or JD-specific final resume |
| 仅 JD | Target JD without a resume | JD analysis, priority requirements, and a fact-collection checklist | Candidate-fit conclusion or resume version |
| 材料不足 | Neither material is usable | Missing-material notice and at most six high-value questions | Scores, rewrites, or a fabricated final version |
| 造假请求 | A request to invent, inflate, or misrepresent facts | A clear refusal, risk explanation, and truthful alternatives | Scoring, rewriting, ATS version, final resume, or PDF handoff |

For complete or multi-JD materials, review the work through five dimensions: JD match, ATS, HR scanability, interview readiness, and credibility. Each score must include evidence, deduction reasons, and an improvement action. Mark a dimension `暂无法评分` when the material is insufficient; do not guess a score.

Use `templates/fact-ledger-template.md` to build a shared factual baseline. Use `templates/five-dimension-review-template.md` for review output and `templates/multi-jd-difference-template.md` for multiple target roles. Multi-JD tailoring may change ordering, emphasis, length, and supported keywords, but never facts, metrics, contribution strength, or ownership.

## Default Workflow

1. Identify the target role, industry, country or region when relevant, candidate level, and available resume content.
2. Analyze the JD for responsibilities, required skills, preferred skills, keywords, seniority signals, and evidence gaps.
3. Optimize the resume by mapping real evidence to the JD and rewriting bullets with action, method, tool, and impact.
4. Run the five-dimension review and expose unresolved fact statuses or evidence gaps.
5. Produce requested application materials, such as emails, cover letters, referral messages, or interview answers.
6. Offer the Resume PDF Builder only as an optional next step after resume optimization and confirmed-fact filtering.

## Resume PDF Builder

Use this feature only when the user explicitly asks to generate, design, export, format, or create a PDF resume. Do not automatically generate a PDF resume in the first response.

Before generating a PDF resume, confirm:

- Target industry and role.
- Preferred resume style.
- Whether the user wants to add a formal photo or headshot.

If the user does not specify a style, recommend one based on the target industry and role. If they do not want to choose or ask to proceed directly, use `Modern Minimal`.

### Style Matching

- `Classic Professional`: Use for finance, consulting, law, government, education, traditional corporate, administration, accounting, and audit roles.
- `Modern Minimal`: Use by default. Best for technology, data, AI, software engineering, product, business analyst, startup, and internet roles.
- `Creative Clean`: Use for marketing, content, media, branding, design-adjacent, and creator roles.

### Photo Rules

- Default to no photo because ATS-friendly resumes usually work better as text-first documents.
- If the user wants a photo, ask them to upload a clear, formal, front-facing image.
- Use only the user's uploaded image. Do not generate, invent, or assume a photo.
- Warn when the target country, industry, or role commonly discourages photos, then respect the user's choice.
- Keep all resume body text selectable and ATS-readable. Never turn the whole resume into an image.

### PDF Quality Rules

- Use optimized resume content as the source of truth.
- Prefer one page for students, interns, fresh graduates, and early-career candidates unless content justifies two pages.
- Use two pages only when the user has enough relevant experience.
- Avoid keyword stuffing, decorative graphics, icons, photos by default, skill bars, complex tables, and heavy colors.
- Ensure no text is clipped, overlapping, unreadable, or reduced to an image.
- If generating files programmatically, render or preview the PDF before finalizing.

## Bundled Resources

- Use `templates/job-analysis-template.md` for JD analysis structure.
- Use `templates/resume-optimization-template.md` for resume rewriting.
- Use `templates/fact-ledger-template.md` to record source, evidence, and fact status.
- Use `templates/five-dimension-review-template.md` for JD match, ATS, HR, interview readiness, and credibility checks.
- Use `templates/multi-jd-difference-template.md` when tailoring the same factual baseline to multiple JDs.
- Use `templates/pdf-resume-template.md` before building PDF resume content.
- Use `design/resume-design-principles.md` and `design/resume-layout-spec.md` when designing PDF layout.
- Use `scripts/build_resume_pdf.py` to build text-based HTML and PDF output.
- Use `scripts/verify_resume_pdf.py` to verify non-empty, text-extractable PDF output.
