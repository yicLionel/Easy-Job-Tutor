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
  reconcileFactEvidence(payload, session.resume.text, session.answers ?? []);
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

function reconcileFactEvidence(payload, resumeText, answers) {
  const answerText = answers.map((item) => item.answer).join("\n");
  const normalizedResume = normalizeEvidenceText(resumeText);
  const normalizedAnswers = normalizeEvidenceText(answerText);
  const unsupportedFactIds = new Set();

  payload.facts = payload.facts.map((fact) => {
    if (fact.status !== "confirmed") return fact;
    const normalizedEvidence = normalizeEvidenceText(fact.evidence);
    if (normalizedEvidence.length < 8 || ![normalizedResume, normalizedAnswers].some((source) => isEvidenceSupported(source, normalizedEvidence))) {
      unsupportedFactIds.add(fact.factId);
      return { ...fact, status: "pending_confirmation" };
    }
    return fact;
  });

  if (!unsupportedFactIds.size) return;

  payload.evidence = payload.evidence.map((link) => unsupportedFactIds.has(link.factId)
    ? { ...link, strength: "pending", reason: "模型返回的证据无法在已确认原文中定位，需用户核验" }
    : link);

  const existingQuestionFactIds = new Set(payload.questions.map((question) => question.factId).filter(Boolean));
  for (const fact of payload.facts) {
    if (!unsupportedFactIds.has(fact.factId) || existingQuestionFactIds.has(fact.factId) || payload.questions.length >= 4) continue;
    payload.questions.push({
      questionId: `verify-${fact.factId}`,
      factId: fact.factId,
      question: `请确认以下经历是否属实，并补充可核验的原文依据：${fact.statement}`,
    });
  }
}

function isEvidenceSupported(source, evidence) {
  if (!source || !evidence) return false;
  if (source.includes(evidence)) return true;
  if (evidence.length < 16) return false;

  const windowSize = 8;
  const windowCount = evidence.length - windowSize + 1;
  let matchedWindows = 0;
  for (let index = 0; index < windowCount; index += 1) {
    if (source.includes(evidence.slice(index, index + windowSize))) matchedWindows += 1;
  }
  return matchedWindows / windowCount >= 0.7;
}

function normalizeEvidenceText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[\p{White_Space}\p{P}\p{S}]/gu, "");
}
