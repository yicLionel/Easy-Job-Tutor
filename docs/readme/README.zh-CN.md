# Easy-Job-Tutor

[返回语言选择](../../README.md)

## Skill Preview

![Easy-Job-Tutor workflow](../../assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](../../assets/readme/resume-pdf-preview.png)

## 功能简介

Easy-Job-Tutor 是一个开源 Codex Skill，用于求职场景下的 JD 分析、简历优化、申请材料撰写、面试准备，以及可选的 ATS 友好 PDF 简历生成。

它可以帮助用户把目标岗位和真实经历转化成更有竞争力的求职材料。

它可以帮助你：

- 分析岗位 JD，提取职责、技能要求和关键词。
- 评估简历与目标岗位的匹配度。
- 基于真实经历重写简历 bullet points。
- 撰写申请邮件、Cover Letter 和内推 / LinkedIn 私信。
- 准备面试问题和回答框架。
- 在用户明确要求时生成干净、文本可提取的 PDF 简历。

## Resume PDF Builder

可选的 Resume PDF Builder 可以把优化后的简历内容生成一份专业、清晰、适合招聘方阅读的 PDF。

支持三种风格：

- `Classic Professional`：适合金融、咨询、法律、政府、教育、传统企业、行政、会计、审计。
- `Modern Minimal`：默认风格，适合科技、数据、AI、软件工程、产品、商业分析、创业公司和互联网岗位。
- `Creative Clean`：适合市场、内容、媒体、品牌、设计相关和创作者岗位。

证件照规则：

- 默认不添加证件照。
- 如果用户需要证件照，必须上传清晰、正式、正面的照片。
- 只使用用户上传的照片，并保持简历正文文本可选择、可复制、可被 ATS 解析。

## 安装

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

安装为本地 Codex Skill：

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## 生成示例 PDF

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

校验生成的 PDF：

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

## 质量原则

- 不编造简历内容。
- 优先生成 ATS 友好的文本型 PDF。
- 避免过度装饰、复杂表格、技能条和纯图片简历。
- 在最终使用前检查 PDF 版式质量。
- 不在示例或回复中创建假的下载链接。

## 开源协议

MIT
