# Resume Layout Specification

## Default Page

- Page size: A4 by default.
- Alternative: US Letter if the user requests it.
- Margins: controlled inside the resume page canvas, not by browser print defaults.
- Layout: one-column content flow with a structured header block.
- Font: professional sans-serif by default; serif only for conservative classic style.
- Color: black, white, neutral gray, and one subtle accent.
- Export: HTML preview plus PDF generated from the same screen layout.

## Recommended Visual Hierarchy

1. Name.
2. Contact line.
3. Section headings.
4. Role / project titles.
5. Company / institution names.
6. Dates and locations.
7. Bullet points.

## Section Order

Default order for students and early-career candidates:

1. Header.
2. Summary.
3. Education.
4. Experience.
5. Projects.
6. Skills.
7. Certifications / Awards.

Default order for experienced candidates:

1. Header.
2. Summary.
3. Experience.
4. Skills.
5. Education.
6. Projects.
7. Certifications / Awards.

## ATS Compatibility Rules

- Prefer text-based PDF output.
- Avoid embedding resume content as images.
- Avoid complex tables.
- Avoid multi-column layouts for core experience content.
- Avoid text boxes that may disrupt parsing.
- Use standard section names.
- Keep bullet points as real text.
- Keep contact information selectable.

## VibeResume-Inspired Delivery Rules

- Use a fixed `.resume` page container so preview and PDF share the same visual frame.
- Use a profile header block with a top accent rule, clear name hierarchy, and compact contact chips.
- Use section headings with line rules to improve scanning.
- Use timeline-like entry blocks for education, experience, projects, and awards.
- Use a light skills panel for grouped skill categories.
- During export, render with screen media, remove preview-only shadow/background, measure the page content, and output with zero browser PDF margins.
