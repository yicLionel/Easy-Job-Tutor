# Easy-Job-Tutor

[Volver a la selección de idioma](../../README.md)

## Skill Preview

![Easy-Job-Tutor workflow](../../assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](../../assets/readme/resume-pdf-preview.png)

## Funcionalidades

Easy-Job-Tutor es un Skill de Codex de código abierto para analizar ofertas de empleo, optimizar currículums, preparar materiales de candidatura, practicar entrevistas y generar currículums PDF compatibles con ATS.

Ayuda a convertir un puesto objetivo y la experiencia real del usuario en materiales de candidatura más sólidos.

Puede:

- Analizar descripciones de empleo y extraer requisitos del puesto.
- Evaluar la compatibilidad del currículum con una oferta objetivo.
- Reescribir bullets del currículum usando solo experiencia real.
- Redactar correos de candidatura, cartas de presentación y mensajes de referencia.
- Preparar preguntas de entrevista y marcos de respuesta.
- Generar currículums PDF limpios y basados en texto cuando el usuario lo solicite explícitamente.

## Resume PDF Builder

Resume PDF Builder convierte contenido optimizado en un PDF profesional y fácil de leer para reclutadores.

Estilos compatibles:

- `Classic Professional`: finanzas, consultoría, derecho, gobierno, educación, empresas tradicionales, administración, contabilidad y auditoría.
- `Modern Minimal`: estilo predeterminado; tecnología, datos, IA, ingeniería de software, producto, análisis de negocio, startups e internet.
- `Creative Clean`: marketing, contenido, medios, marca, roles relacionados con diseño y creadores.

Foto:

- Sin foto por defecto.
- Si el usuario quiere una foto, debe subir una imagen clara, formal y frontal.
- El builder usa solo fotos proporcionadas por el usuario y mantiene el texto seleccionable.

## Instalación

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

Instalar como Skill local de Codex:

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## Generar un PDF de ejemplo

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

## Principios de calidad

- No inventar contenido del currículum.
- Preferir PDF basados en texto y compatibles con ATS.
- Evitar decoración excesiva, tablas complejas, barras de habilidades y currículums solo en imagen.
- Verificar la calidad del diseño antes de usar el PDF final.
- No crear enlaces falsos de descarga.

## Licencia

MIT
