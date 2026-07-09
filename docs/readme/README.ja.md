# Easy-Job-Tutor

[言語選択に戻る](../../README.md)

## Skill Preview

![Easy-Job-Tutor workflow](../../assets/readme/skill-workflow.svg)

![ATS-friendly resume PDF preview](../../assets/readme/resume-pdf-preview.png)

## 概要

Easy-Job-Tutor は、求人票分析、履歴書・職務経歴書の改善、応募書類作成、面接準備、ATS 対応 PDF レジュメ生成を支援するオープンソースの Codex Skill です。

目標ポジションと実際の経験を、より説得力のある応募資料に変換することを支援します。

できること：

- 求人票を分析し、職務内容、必要スキル、キーワードを抽出する。
- 目標ポジションに対するレジュメの適合度を評価する。
- 実際の経験に基づいて bullet points を改善する。
- 応募メール、Cover Letter、紹介依頼メッセージを作成する。
- 面接質問と回答フレームを準備する。
- ユーザーが明示的に依頼した場合のみ、テキストベースの PDF レジュメを生成する。

## Resume PDF Builder

Resume PDF Builder は、最適化されたレジュメ内容を、採用担当者が読みやすい PDF に変換します。

対応スタイル：

- `Classic Professional`：金融、コンサル、法律、政府、教育、伝統的企業、管理、会計、監査。
- `Modern Minimal`：デフォルト。テクノロジー、データ、AI、ソフトウェアエンジニアリング、プロダクト、ビジネス分析、スタートアップ、インターネット関連職種。
- `Creative Clean`：マーケティング、コンテンツ、メディア、ブランド、デザイン関連、クリエイター職。

写真の扱い：

- デフォルトでは写真を入れません。
- 写真を入れる場合、ユーザーが鮮明で正式な正面写真をアップロードする必要があります。
- ユーザー提供の写真のみ使用し、本文テキストは選択可能な状態を保ちます。

## インストール

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

ローカル Codex Skill としてインストール：

```bash
cp -R Easy-Job-Tutor ~/.codex/skills/easy-job-tutor
```

## サンプル PDF の生成

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

## 品質方針

- レジュメ内容を捏造しない。
- ATS に適したテキストベースの PDF を優先する。
- 過度な装飾、複雑な表、スキルバー、画像のみのレジュメを避ける。
- 最終利用前に PDF のレイアウトを確認する。
- 偽のダウンロードリンクを作らない。

## ライセンス

MIT
