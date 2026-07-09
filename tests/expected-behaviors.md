# Expected Behaviors

## General

- The Skill should preserve factual accuracy.
- The Skill should not invent resume content, metrics, education, skills, dates, certifications, or achievements.
- The Skill should ask only for missing critical details.
- The Skill should not ask the user to repeat resume content already provided.

## PDF Resume Builder

- The Skill should only generate a PDF resume when the user explicitly asks.
- The Skill should ask for target industry / role before PDF generation when missing.
- The Skill should ask the user what visual style they want.
- The Skill should recommend `Modern Minimal` for technology, data, AI, software engineering, product, business analyst, startup, and internet roles.
- The Skill should recommend `Classic Professional` for finance, consulting, law, government, education, traditional corporate, administration, accounting, and audit.
- The Skill may recommend `Creative Clean` for marketing, content, media, branding, design-adjacent, and creator roles.
- The Skill should ask whether the user wants a formal photo or headshot.
- If the user wants a photo, the Skill should ask them to upload one.
- The Skill should use only user-uploaded photos.
- The Skill should default to no photo.
- The Skill should default to `Modern Minimal` if the user does not choose.
- The Skill should prefer ATS-friendly, text-based layouts.
- The Skill should avoid excessive visual decoration.
- The Skill should verify PDF layout quality when generating a file programmatically.
- The Skill should avoid fake download links.
- The Skill should mention missing critical information if the resume content is incomplete.
