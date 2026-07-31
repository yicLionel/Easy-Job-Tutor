# 🎓 Easy-Job-Tutor — Your AI Resume Coach

> **Getting no replies after sending out dozens of resumes? Don't know how to make your experiences sound impressive? Easy-Job-Tutor is like having an AI career coach who knows what recruiters look for — it walks you through every step, from analyzing job descriptions to polishing your resume until it shines.**

![MIT License](https://img.shields.io/badge/License-MIT-blue)
![AI Skill Easy Job Tutor](https://img.shields.io/badge/AI%20Skill-Easy--Job--Tutor-7c3aed)
![Language English](https://img.shields.io/badge/Language-English-blue)
![PDF Resume Builder](https://img.shields.io/badge/PDF-VibeResume--inspired-2563eb)

[回到中文](../../README.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Quick Start ↓](#-quick-start) · [Installation ↓](#installation-one-line)

---

## 🤔 Does This Sound Like You?

| You're struggling with... | Here's how this tool helps |
| :--- | :--- |
| **"I don't have much work experience. What do I even put on my resume?"** | It helps you dig into class projects, campus activities, and competitions — things you already did but didn't realize were valuable — and shows you how to present them like an employer would want to see |
| **"The job description lists so many requirements I don't meet."** | It breaks down every requirement and shows you where you're strong, where you're weak, and what missing info you can add — **no lying, but making the most of what you actually have** |
| **"I keep rewriting my resume but it still sounds the same."** | Instead of just swapping synonyms, it asks structured questions to help you unpack your experiences and **add real substance, not just fancy words** |
| **"I've sent 50+ applications and heard nothing back."** | It scores your resume across 5 dimensions — JD match, ATS readability, recruiter scan-ability, interview readiness, and credibility — so you know **exactly what to fix** |
| **"I freeze when interviewers ask about details on my resume."** | It turns every line on your resume into **potential interview questions + how you should answer them**, so you can prepare beforehand |

> 💡 **Bottom line: It does with AI what you'd otherwise pay a career coach hundreds of dollars for — and it never makes things up.**

---

## 🎯 What It Can Do For You

### 1️⃣ Read Between the Lines of a Job Description
Paste any job description and it will tell you:
- What the role **actually requires** (beyond the surface-level words)
- **Hard skills** (tools, technologies) vs **soft skills** (communication, teamwork)
- **Hidden filters** — unspoken expectations recruiters will judge you on

### 2️⃣ Match Your Experience Against the Job
Give it your resume and the job description, and it compares them point by point:
- ✅ **Strong match**: Your experience lines up perfectly
- ⚠️ **Weak match**: Related but not compelling enough
- ❌ **Gap**: Missing evidence — here's what you need to add

### 3️⃣ Ask Targeted Questions to Fill in Blanks
Instead of inventing things you never did, it asks specific questions like:
> "You mentioned you handled social media for your student club — what tools did you use? How many posts? What was the engagement?"
> "Your class project — what was the grade? How many teammates? Any recognition?"

These details are what turn a vague resume into a convincing one.

### 4️⃣ Rewrite Your Bullet Points
Before: "Responsible for WeChat official account operations"
After: 🎯 **"Managed my department's WeChat account — published 40+ articles in 6 months, highest single piece reached 32K reads, grew followers by 1,200."**

### 5️⃣ Draft Application Materials
- 📧 **Cold application emails**
- ✉️ **Cover letters**
- 💬 **LinkedIn / referral messages**

### 6️⃣ Prepare for Interviews
Each bullet point on your optimized resume gets turned into:
- Likely **interview questions**
- Suggested **answer frameworks**

### 7️⃣ Generate a Beautiful PDF Resume (Optional)
When you're ready for the final version, it can lay out your optimized content into a clean, recruiter-friendly PDF. Three styles:

| Style | Best for |
| :--- | :--- |
| `Classic Professional` | Finance, consulting, law, government, education, accounting, audit |
| `Modern Minimal` | **Default** — Tech, data, AI, product, startups, internet |
| `Creative Clean` | Marketing, content, media, branding, design |

---

## 🔧 Installation (One Line)

You need an AI tool that supports Skills — like Claude Code, Codex CLI, OpenCode, or Hermes Agent.

> 🖥️ **If you're not comfortable with the command line, copy these steps to a friend who codes, or ask your AI assistant "how do I install Easy-Job-Tutor" — it can walk you through it.**

### One-Line Install

Copy and paste the one-liner for your OS. It automatically: **creates a virtual environment → installs dependencies (incl. PDF export) → detects and installs into your AI tool**.

**macOS / Linux**

```bash
git clone https://github.com/yicLionel/Easy-Job-Tutor.git && cd Easy-Job-Tutor && python3 install.py
```

**Windows (PowerShell)**

```powershell
git clone https://github.com/yicLionel/Easy-Job-Tutor.git; cd Easy-Job-Tutor; py install.py
```

> 💡 **Optional flags**: add `--skip-pdf` to skip PDF-export dependencies; `--skip-tools` to skip auto-installing into your AI tool; `--tool codex / claude / opencode / hermes` to force-install into a specific tool when it isn't detected automatically.
> 🔔 **Don't worry if a step fails!** The core features (JD analysis, resume optimization, interview prep) work fine without it. PDF export is a bonus feature.

Done! Your AI assistant now has the Easy-Job-Tutor skill.

---

## 🚀 Quick Start

### How to Use It — Just Tell Your AI:

> 💡 **Two ways to invoke it**: mention "use Easy-Job-Tutor" in your prompt, or type `/easy-job-tutor` as a slash command if your AI tool supports it.

Send the **job description (JD)** and your **current resume** to your AI, then say:

> **"Use Easy-Job-Tutor to analyze this job description and optimize my resume. Don't make anything up — if you're missing key info, ask me first."**

The AI will walk through the full process:
1. ✅ Analyze the job requirements
2. ✅ Compare against your experience
3. ✅ Ask you for any missing details
4. ✅ Rewrite your resume content
5. ✅ (Optional) Generate a PDF

### Or ask for just one thing:

| What you want | Say this to your AI |
| :--- | :--- |
| Only analyze a job | "Use Easy-Job-Tutor to analyze this JD and tell me what the role really wants" |
| Only rewrite resume | "Reference this JD and rewrite my work experience more professionally" |
| Write a cover letter | "Help me write a cover letter for this job" |
| Interview prep | "Help me prepare interview questions based on my optimized resume" |
| Generate PDF | "Generate my resume PDF in Modern Minimal style" |

---

## 💬 Reference Usage: Hand Your Real Experience to the AI

The examples below are fictional and only illustrate how to provide material. In practice, only fill in experiences you can explain and verify; if you don't know a figure, write "TBD" and never let the AI guess or fabricate.

### Example 1: Applying for a Data Analytics Internship Without Any Internship

Send your course project, club experience, and the JD together to the AI:

```text
Use Easy-Job-Tutor to help me prepare a Chinese resume for a data analytics internship.

Target JD:
- Proficient in SQL, Python, and Excel; able to do data cleaning and basic analysis;
- Visualization or business analysis project experience preferred;
- Able to collaborate with product and operations teams and report findings clearly.

My real experience:
- Completed a campus food-delivery survey analysis course project with 3 classmates;
- I cleaned 1,200 valid questionnaires with Python and built charts with Excel;
- Final deliverables: a 12-page analysis report and a class presentation;
- I have never run a real A/B test and don't know whether the report was adopted by any business.

Please first output: a mapping table of JD requirements vs. my experience, and the
5 most important questions I need to answer. Then write resume bullets based only on
confirmed facts. Do not present a course project as a corporate internship.
```

This gives you project descriptions that stand up to follow-up questions — not homework repackaged as work experience.

### Example 2: Moving from Operations to AI Product Manager

When switching careers, the key is separating direct experience, transferable skills, and real gaps:

```text
I'm planning to transition from operations to an AI product manager role. Please use
Easy-Job-Tutor to run a gap diagnosis first — don't write a final resume yet.

Target JD:
- Own AI product research, PRD, prototyping, and launch review;
- Understand the typical boundaries of LLMs, RAG, or Agents;
- Able to drive collaboration across engineering, design, and business teams.

Confirmed experience:
- Owned requirements gathering, scheduling, and cross-department communication for corporate training events;
- Self-taught and built an internal knowledge-base Q&A demo — never launched, no real user data;
- Wrote feature specs and test checklists, but never owned a full PRD end-to-end.

Please split the content into "Direct Evidence", "Transferable Skills",
"Learning / Portfolio Evidence", and "Real Gaps", and tell me what facts I still
need to add before I can use verbs like "own" or "drive".
```

The goal isn't to pile up AI buzzwords, but to get an honest, executable evidence-building plan.

### Example 3: Using One Experience to Apply for Multiple Roles

Don't blend product, operations, and growth keywords into one one-size-fits-all resume. Build one factual baseline first, then generate separate versions:

```text
Based on the same factual baseline, generate two separate versions of my resume:
"Product Operations" and "User Growth".

Fact baseline:
- Optimized the event signup process for a campus club;
- Interviewed 15 registrants and distilled 4 recurring issues;
- Worked with a designer teammate to revise the signup form and reminder copy;
- Signups grew from 86 last term to 124 this term;
- I can't confirm the growth was caused entirely by the form redesign.

Job A: Product Operations JD: [paste JD]
Job B: User Growth JD: [paste JD]

Please first output the evidence mapping and version-diff table for both roles,
then write resume bullets for each. Don't attribute all team outcomes to me; use
cautious wording for data where causality can't be confirmed.
```

Once the content is confirmed, add: "Generate a one-page A4 PDF in Modern Minimal style and check for content overflow, blank pages, and placeholders" to move into the layout/export stage.

---

## 📁 What's Inside the Project

```
Easy-Job-Tutor/
├── SKILL.md              ← The AI assistant's "operations manual"
├── templates/            ← Analysis templates (JD analysis, resume optimization, 5-dimension review...)
├── design/               ← PDF layout design specs
├── scripts/              ← PDF generation & verification scripts
├── examples/             ← Sample data
├── tests/                ← Tests (quality assurance)
├── assets/readme/        ← Images
└── docs/readme/          ← Other-language docs
```

---

## ⚠️ Important Notes

- ✅ **Never fabricates**: Won't invent degrees, companies, projects, metrics, or awards
- ✅ **Asks before writing**: If evidence is missing, it asks you — never writes fiction into your resume
- ✅ **Designed for recruiters**: Prioritizes making your resume scannable and matchable, not keyword-stuffed
- ✅ **Interview-proof**: Everything in your final resume is something you can actually talk about

---

## License

This project is released under the [MIT License](../../LICENSE). You may use, modify, and distribute it as long as you retain the copyright and license notices.

## 🙏 Acknowledgments & References

Easy-Job-Tutor's initial approach draws on and absorbs the following excellent open-source projects:

- [coinluu/resume-jd-optimizer-cn](https://github.com/coinluu/resume-jd-optimizer-cn): Key reference for JD-driven resume analysis, real-experience constraints, evidence mapping, and content optimization.
- [LiuMengxuan04/vibe-resume](https://github.com/LiuMengxuan04/vibe-resume): Key reference for web-based resume preview, layout, and PDF export.

This project is a further development and integration of these ideas, adding Easy-Job-Tutor's workflows, templates, verification logic, examples, and documentation, released under the MIT License. When using or redistributing, please comply with the licenses and attribution requirements of this project and its upstream references.
