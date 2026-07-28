import { validateAnalysisPayload, validateReportPayload } from "./schemas.js";
import { calculateReadiness } from "./scoring.js";

export async function diagnoseConfirmedMaterials({ llmClient, settings, session, clock = performance }) {
  assertConfirmedMaterials(session);
  const startedAt = clock.now();
  const payload = await llmClient.diagnose(settings, {
    schemaVersion: "diagnosis-v1",
    task: session.answers?.length ? "reassess" : "diagnose",
    jd: session.jd,
    resume: session.resume,
    facts: session.answers?.length ? session.facts : undefined,
    questions: session.answers?.length ? session.questions : undefined,
    answers: session.answers?.length ? session.answers : undefined,
  });
  validateAnalysisPayload(payload);
  validateFactEvidence(payload.facts, session.resume.text, session.answers ?? []);
  const scoring = calculateReadiness({
    requirements: payload.requirements,
    evidence: payload.evidence,
    dimensions: payload.dimensions,
    dimensionDetails: payload.dimensionDetails,
    risks: payload.risks,
  });
  return { payload, scoring, durationMs: Math.round(clock.now() - startedAt) };
}

export async function generateDeepReport({ llmClient, settings, session, clock = performance }) {
  assertConfirmedMaterials(session);
  if (!session.scoring || session.questions?.length) throw new Error("请先完成快速诊断和必要追问");
  const startedAt = clock.now();
  const payload = await llmClient.generateReport(settings, {
    schemaVersion: "deep-report-v1",
    jd: session.jd,
    resume: session.resume,
    facts: session.facts.filter((fact) => fact.status === "confirmed"),
    evidence: session.evidence,
    scoring: session.scoring,
    answers: session.answers,
  });
  validateReportPayload(payload, session.facts);
  return { payload, durationMs: Math.round(clock.now() - startedAt) };
}

export function assertConfirmedMaterials(session) {
  if (!session?.jd?.confirmedAt || !session?.resume?.confirmedAt || !session.resume.text?.trim()) throw new Error("JD 与简历必须先确认");
}

function validateFactEvidence(facts, resumeText, answers) {
  const answerText = answers.map((item) => item.answer).join("\n");
  const normalizedResume = normalizeEvidenceText(resumeText);
  const normalizedAnswers = normalizeEvidenceText(answerText);
  for (const fact of facts) {
    if (fact.status !== "confirmed") continue;
    const normalizedEvidence = normalizeEvidenceText(fact.evidence);
    if (normalizedEvidence.length < 8 || (!normalizedResume.includes(normalizedEvidence) && !normalizedAnswers.includes(normalizedEvidence))) {
      throw new Error(`Confirmed fact ${fact.factId} is not supported by source text`);
    }
  }
}

function normalizeEvidenceText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[\p{White_Space}\p{P}\p{S}]/gu, "");
}
