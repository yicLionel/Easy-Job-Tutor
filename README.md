# Easy-Job-Tutor

Easy-Job-Tutor is an open-source Codex Skill for job description analysis, resume optimization, application materials, interview preparation, and ATS-friendly PDF resume generation.

## Languages

- [English](#english)
- [中文](#中文)
- [Français](#français)
- [日本語](#日本語)
- [Español](#español)
- [Deutsch](#deutsch)

## Skill Preview

![Easy-Job-Tutor workflow](assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](assets/readme/resume-pdf-preview.png)

## English

### What It Does

Easy-Job-Tutor helps users turn a target role and their real background into stronger job-search materials.

It can:

- Analyze job descriptions and extract role requirements.
- Score resume fit against a target JD.
- Rewrite resume bullets using real evidence only.
- Draft application emails, cover letters, and referral messages.
- Prepare interview questions and answer frameworks.
- Generate clean, text-based PDF resumes when explicitly requested.

### Resume PDF Builder

The optional Resume PDF Builder turns optimized resume content into a polished, recruiter-friendly PDF.

Supported styles:

- `Classic Professional`: finance, consulting, law, government, education, traditional corporate, administration, accounting, and audit.
- `Modern Minimal`: default; technology, data, AI, software engineering, product, business analyst, startup, and internet roles.
- `Creative Clean`: marketing, content, media, branding, design-adjacent, and creator roles.

Photo behavior:

- No photo by default.
- If the user wants a photo, they must upload a clear, formal, front-facing image.
- The builder uses only user-provided photos and keeps resume text selectable.

### Installation

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

To install as a local Codex Skill:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### Build a Sample PDF

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

### Quality Principles

- Do not fabricate resume content.
- Prefer ATS-friendly, text-based PDF output.
- Avoid excessive decoration, complex tables, skill bars, and image-only resumes.
- Verify layout quality before treating the PDF as final.
- Do not create fake download links in examples or responses.

## 中文

### 功能简介

Easy-Job-Tutor 是一个开源 Codex Skill，用于求职场景下的 JD 分析、简历优化、申请材料撰写、面试准备，以及可选的 ATS 友好 PDF 简历生成。

它可以帮助你：

- 分析岗位 JD，提取职责、技能要求和关键词。
- 评估简历与目标岗位的匹配度。
- 基于真实经历重写简历 bullet points。
- 撰写申请邮件、Cover Letter 和内推 / LinkedIn 私信。
- 准备面试问题和回答框架。
- 在用户明确要求时生成干净、文本可提取的 PDF 简历。

### Resume PDF Builder

可选的 Resume PDF Builder 可以把优化后的简历内容生成一份专业、清晰、适合招聘方阅读的 PDF。

支持三种风格：

- `Classic Professional`：适合金融、咨询、法律、政府、教育、传统企业、行政、会计、审计。
- `Modern Minimal`：默认风格，适合科技、数据、AI、软件工程、产品、商业分析、创业公司和互联网岗位。
- `Creative Clean`：适合市场、内容、媒体、品牌、设计相关和创作者岗位。

证件照规则：

- 默认不添加证件照。
- 如果用户需要证件照，必须上传清晰、正式、正面的照片。
- 只使用用户上传的照片，并保持简历正文文本可选择、可复制、可被 ATS 解析。

### 安装

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

安装为本地 Codex Skill：

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### 生成示例 PDF

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

### 质量原则

- 不编造简历内容。
- 优先生成 ATS 友好的文本型 PDF。
- 避免过度装饰、复杂表格、技能条和纯图片简历。
- 在最终使用前检查 PDF 版式质量。
- 不在示例或回复中创建假的下载链接。

## Français

### Fonctionnalités

Easy-Job-Tutor est un Skill Codex open source pour l'analyse d'offres d'emploi, l'optimisation de CV, les documents de candidature, la préparation aux entretiens et la génération facultative de CV PDF compatibles ATS.

Il peut :

- Analyser une offre d'emploi et extraire les exigences du poste.
- Évaluer l'adéquation d'un CV avec une offre cible.
- Réécrire les points du CV à partir d'expériences réelles uniquement.
- Rédiger des e-mails de candidature, lettres de motivation et messages de recommandation.
- Préparer des questions d'entretien et des cadres de réponse.
- Générer un CV PDF propre et textuel lorsque l'utilisateur le demande explicitement.

### Resume PDF Builder

Le Resume PDF Builder transforme un contenu de CV optimisé en PDF professionnel et facile à lire pour les recruteurs.

Styles pris en charge :

- `Classic Professional` : finance, conseil, droit, gouvernement, éducation, grandes entreprises, administration, comptabilité et audit.
- `Modern Minimal` : style par défaut, pour technologie, data, IA, software engineering, produit, business analysis, startups et internet.
- `Creative Clean` : marketing, contenu, médias, marque, design adjacent et rôles créatifs.

Photo :

- Aucune photo par défaut.
- Si l'utilisateur souhaite une photo, il doit fournir une image claire, formelle et de face.
- Seules les photos fournies par l'utilisateur sont utilisées, et le texte du CV reste sélectionnable.

### Installation

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Installer comme Skill Codex local :

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### Générer un PDF d'exemple

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

Vérifier le PDF généré :

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

### Principes de qualité

- Ne pas inventer de contenu de CV.
- Préférer les PDF textuels compatibles ATS.
- Éviter les décorations excessives, tableaux complexes, barres de compétences et CV entièrement en image.
- Vérifier la mise en page avant d'utiliser le PDF final.
- Ne pas créer de faux liens de téléchargement.

## 日本語

### 概要

Easy-Job-Tutor は、求人票分析、履歴書・職務経歴書の改善、応募書類作成、面接準備、ATS 対応 PDF レジュメ生成を支援するオープンソースの Codex Skill です。

できること：

- 求人票を分析し、職務内容、必要スキル、キーワードを抽出する。
- 目標ポジションに対するレジュメの適合度を評価する。
- 実際の経験に基づいて bullet points を改善する。
- 応募メール、Cover Letter、紹介依頼メッセージを作成する。
- 面接質問と回答フレームを準備する。
- ユーザーが明示的に依頼した場合のみ、テキストベースの PDF レジュメを生成する。

### Resume PDF Builder

Resume PDF Builder は、最適化されたレジュメ内容を、採用担当者が読みやすい PDF に変換します。

対応スタイル：

- `Classic Professional`：金融、コンサル、法律、政府、教育、伝統的企業、管理、会計、監査。
- `Modern Minimal`：デフォルト。テクノロジー、データ、AI、ソフトウェアエンジニアリング、プロダクト、ビジネス分析、スタートアップ、インターネット関連職種。
- `Creative Clean`：マーケティング、コンテンツ、メディア、ブランド、デザイン関連、クリエイター職。

写真の扱い：

- デフォルトでは写真を入れません。
- 写真を入れる場合、ユーザーが鮮明で正式な正面写真をアップロードする必要があります。
- ユーザー提供の写真のみ使用し、本文テキストは選択可能な状態を保ちます。

### インストール

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

ローカル Codex Skill としてインストール：

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### サンプル PDF の生成

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

生成した PDF を検証：

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

### 品質方針

- レジュメ内容を捏造しない。
- ATS に適したテキストベースの PDF を優先する。
- 過度な装飾、複雑な表、スキルバー、画像のみのレジュメを避ける。
- 最終利用前に PDF のレイアウトを確認する。
- 偽のダウンロードリンクを作らない。

## Español

### Funcionalidades

Easy-Job-Tutor es un Skill de Codex de código abierto para analizar ofertas de empleo, optimizar currículums, preparar materiales de candidatura, practicar entrevistas y generar currículums PDF compatibles con ATS.

Puede:

- Analizar descripciones de empleo y extraer requisitos del puesto.
- Evaluar la compatibilidad del currículum con una oferta objetivo.
- Reescribir bullets del currículum usando solo experiencia real.
- Redactar correos de candidatura, cartas de presentación y mensajes de referencia.
- Preparar preguntas de entrevista y marcos de respuesta.
- Generar currículums PDF limpios y basados en texto cuando el usuario lo solicite explícitamente.

### Resume PDF Builder

Resume PDF Builder convierte contenido optimizado en un PDF profesional y fácil de leer para reclutadores.

Estilos compatibles:

- `Classic Professional`: finanzas, consultoría, derecho, gobierno, educación, empresas tradicionales, administración, contabilidad y auditoría.
- `Modern Minimal`: estilo predeterminado; tecnología, datos, IA, ingeniería de software, producto, análisis de negocio, startups e internet.
- `Creative Clean`: marketing, contenido, medios, marca, roles relacionados con diseño y creadores.

Foto:

- Sin foto por defecto.
- Si el usuario quiere una foto, debe subir una imagen clara, formal y frontal.
- El builder usa solo fotos proporcionadas por el usuario y mantiene el texto seleccionable.

### Instalación

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Instalar como Skill local de Codex:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### Generar un PDF de ejemplo

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

Verificar el PDF generado:

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

### Principios de calidad

- No inventar contenido del currículum.
- Preferir PDF basados en texto y compatibles con ATS.
- Evitar decoración excesiva, tablas complejas, barras de habilidades y currículums solo en imagen.
- Verificar la calidad del diseño antes de usar el PDF final.
- No crear enlaces falsos de descarga.

## Deutsch

### Funktionen

Easy-Job-Tutor ist ein Open-Source-Codex-Skill für Stellenanzeigenanalyse, Lebenslaufoptimierung, Bewerbungsunterlagen, Interviewvorbereitung und optionale ATS-freundliche PDF-Lebensläufe.

Der Skill kann:

- Stellenanzeigen analysieren und Anforderungen extrahieren.
- Die Passung eines Lebenslaufs zu einer Zielrolle bewerten.
- Lebenslauf-Bullets nur auf Basis echter Angaben umformulieren.
- Bewerbungs-E-Mails, Anschreiben und Empfehlungsnachrichten entwerfen.
- Interviewfragen und Antwortstrukturen vorbereiten.
- Saubere, textbasierte PDF-Lebensläufe erzeugen, wenn der Nutzer dies ausdrücklich wünscht.

### Resume PDF Builder

Der Resume PDF Builder wandelt optimierte Lebenslaufinhalte in ein professionelles, gut lesbares PDF um.

Unterstützte Stile:

- `Classic Professional`: Finanzen, Beratung, Recht, öffentlicher Dienst, Bildung, klassische Unternehmen, Verwaltung, Buchhaltung und Prüfung.
- `Modern Minimal`: Standardstil; Technologie, Data, KI, Software Engineering, Produkt, Business Analysis, Startups und Internetrollen.
- `Creative Clean`: Marketing, Content, Medien, Branding, designnahe und kreative Rollen.

Foto:

- Standardmäßig kein Foto.
- Wenn der Nutzer ein Foto möchte, muss er ein klares, formelles Frontfoto hochladen.
- Der Builder nutzt nur vom Nutzer bereitgestellte Fotos und hält den Lebenslauftext auswählbar.

### Installation

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Als lokalen Codex Skill installieren:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

### Beispiel-PDF erstellen

```bash
.venv/bin/python scripts/build_resume_pdf.py \
  --input examples/sample-resume.json \
  --output outputs/resume.pdf \
  --html outputs/resume.html \
  --style modern-minimal \
  --page-size A4
```

Das erzeugte PDF prüfen:

```bash
.venv/bin/python scripts/verify_resume_pdf.py \
  --pdf outputs/resume.pdf \
  --html outputs/resume.html
```

### Qualitätsprinzipien

- Keine Lebenslaufinhalte erfinden.
- ATS-freundliche, textbasierte PDF-Ausgabe bevorzugen.
- Übermäßige Dekoration, komplexe Tabellen, Skill-Bars und reine Bild-Lebensläufe vermeiden.
- Layoutqualität prüfen, bevor das PDF final genutzt wird.
- Keine falschen Download-Links erstellen.

## License

MIT
