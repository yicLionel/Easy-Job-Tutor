# Easy-Job-Tutor

[Zur Sprachauswahl zurück](../../README.md)

## Skill Preview

![Easy-Job-Tutor workflow](../../assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](../../assets/readme/resume-pdf-preview.png)

## Funktionen

Easy-Job-Tutor ist ein Open-Source-Codex-Skill für Stellenanzeigenanalyse, Lebenslaufoptimierung, Bewerbungsunterlagen, Interviewvorbereitung und optionale ATS-freundliche PDF-Lebensläufe.

Der Skill hilft dabei, eine Zielrolle und echte Berufserfahrung in stärkere Bewerbungsunterlagen zu verwandeln.

Der Skill kann:

- Stellenanzeigen analysieren und Anforderungen extrahieren.
- Die Passung eines Lebenslaufs zu einer Zielrolle bewerten.
- Lebenslauf-Bullets nur auf Basis echter Angaben umformulieren.
- Bewerbungs-E-Mails, Anschreiben und Empfehlungsnachrichten entwerfen.
- Interviewfragen und Antwortstrukturen vorbereiten.
- Saubere, textbasierte PDF-Lebensläufe erzeugen, wenn der Nutzer dies ausdrücklich wünscht.

## Resume PDF Builder

Der Resume PDF Builder wandelt optimierte Lebenslaufinhalte in ein professionelles, gut lesbares PDF um.

Unterstützte Stile:

- `Classic Professional`: Finanzen, Beratung, Recht, öffentlicher Dienst, Bildung, klassische Unternehmen, Verwaltung, Buchhaltung und Prüfung.
- `Modern Minimal`: Standardstil; Technologie, Data, KI, Software Engineering, Produkt, Business Analysis, Startups und Internetrollen.
- `Creative Clean`: Marketing, Content, Medien, Branding, designnahe und kreative Rollen.

Foto:

- Standardmäßig kein Foto.
- Wenn der Nutzer ein Foto möchte, muss er ein klares, formelles Frontfoto hochladen.
- Der Builder nutzt nur vom Nutzer bereitgestellte Fotos und hält den Lebenslauftext auswählbar.

## Installation

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Als lokalen Codex Skill installieren:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## Beispiel-PDF erstellen

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

## Qualitätsprinzipien

- Keine Lebenslaufinhalte erfinden.
- ATS-freundliche, textbasierte PDF-Ausgabe bevorzugen.
- Übermäßige Dekoration, komplexe Tabellen, Skill-Bars und reine Bild-Lebensläufe vermeiden.
- Layoutqualität prüfen, bevor das PDF final genutzt wird.
- Keine falschen Download-Links erstellen.

## Lizenz

MIT
