export const ANALYSIS_SCHEMA_VERSION = "analysis-v1";

const DIMENSION_KEYS = ["jdMatch", "ats", "hrScan", "interviewReadiness", "credibility"];
const CONTRIBUTION_LEVELS = ["support", "participate", "own", "drive", "lead"];
const DATA_STATUSES = ["declared", "estimate", "not_applicable"];

export function validateAnalysisPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Analysis payload must be an object");
  for (const key of ["requirements", "facts", "evidence", "questions", "risks"]) {
    if (!Array.isArray(payload[key])) throw new Error(`Analysis payload missing array: ${key}`);
  }
  for (const key of ["dimensions", "dimensionDetails"]) {
    if (!payload[key] || typeof payload[key] !== "object" || Array.isArray(payload[key])) throw new Error(`Analysis payload missing object: ${key}`);
  }
  for (const item of payload.facts) {
    if (!item.factId || !item.statement || !["confirmed", "pending_confirmation", "model_inference"].includes(item.status)) {
      throw new Error("Invalid fact record");
    }
  }
  for (const item of payload.evidence) {
    if (!item.requirementId || !["strong", "partial", "none", "pending"].includes(item.strength)) {
      throw new Error("Invalid evidence link");
    }
  }
  assertUnique(payload.requirements.map((item) => item.id), "requirement id");
  assertUnique(payload.facts.map((item) => item.factId), "fact id");
  const requirementIds = new Set(payload.requirements.map((item) => item.id));
  const factIds = new Set(payload.facts.map((item) => item.factId));
  for (const item of payload.evidence) {
    if (!requirementIds.has(item.requirementId) || (item.factId && !factIds.has(item.factId))) throw new Error("Evidence link references an unknown id");
  }
  for (const key of ["ats", "hrScan", "interviewReadiness", "credibility"]) {
    if (payload.dimensions[key] !== null && (!Number.isFinite(payload.dimensions[key]) || payload.dimensions[key] < 0 || payload.dimensions[key] > 100)) {
      throw new Error(`Invalid ${key} score`);
    }
  }
  for (const key of DIMENSION_KEYS) {
    const detail = payload.dimensionDetails[key];
    if (!detail || !Array.isArray(detail.evidence) || !Array.isArray(detail.deductions) || !Array.isArray(detail.actions) || typeof detail.verificationQuestion !== "string") {
      throw new Error(`Invalid ${key} score detail`);
    }
  }
  for (const risk of payload.risks) {
    if (!risk?.content || !["high", "medium", "low"].includes(risk.level) || !risk.reason || !risk.correction || typeof risk.blocksFinal !== "boolean") {
      throw new Error("Invalid risk record");
    }
  }
  return payload;
}

export function validateReportPayload(payload, facts = []) {
  if (!payload || typeof payload !== "object") throw new Error("Report payload must be an object");
  for (const key of ["suggestions", "interviewQuestions", "keywordCoverage", "nextSteps"]) {
    if (!Array.isArray(payload[key])) throw new Error(`Report payload missing array: ${key}`);
  }
  for (const key of ["hrSummary", "bossIntro", "headhunterIntro"]) validateFactBackedText(payload[key], facts, key);
  for (const candidate of payload.suggestions) {
    validateRewriteCandidate(candidate);
    validateConfirmedFactIds(candidate.factIds, facts, `suggestion ${candidate.candidateId}`);
  }
  for (const item of payload.interviewQuestions) {
    if (!item?.question || !item.reason || !Array.isArray(item.factIds)) throw new Error("Invalid interview question");
    validateConfirmedFactIds(item.factIds, facts, "interview question");
  }
  for (const item of payload.keywordCoverage) {
    if (!item?.keyword || !["covered", "partial", "missing"].includes(item.status) || !Array.isArray(item.factIds)) throw new Error("Invalid keyword coverage");
    validateConfirmedFactIds(item.factIds, facts, `keyword ${item.keyword}`, item.status === "missing");
  }
  if (payload.nextSteps.some((item) => typeof item !== "string" || !item.trim())) throw new Error("Invalid next step");
  return payload;
}

function validateFactBackedText(block, facts, field) {
  if (!block?.text || !Array.isArray(block.factIds)) throw new Error(`Invalid ${field}`);
  validateConfirmedFactIds(block.factIds, facts, field);
}

function validateConfirmedFactIds(factIds, facts, field, allowEmpty = false) {
  if (!allowEmpty && factIds.length === 0) throw new Error(`${field} must cite confirmed facts`);
  const factMap = new Map(facts.map((fact) => [fact.factId, fact]));
  if (factIds.some((factId) => factMap.get(factId)?.status !== "confirmed")) throw new Error(`${field} references unconfirmed facts`);
}

function assertUnique(values, field) {
  if (values.some((value) => !value) || new Set(values).size !== values.length) throw new Error(`Duplicate or missing ${field}`);
}

export function validateRewriteCandidate(candidate) {
  if (!candidate?.candidateId || !candidate?.suggestedText || !Array.isArray(candidate.factIds) || !CONTRIBUTION_LEVELS.includes(candidate.contributionLevel) || !candidate.contributionBasis || !DATA_STATUSES.includes(candidate.dataStatus) || !Array.isArray(candidate.keywordEvidence)) {
    throw new Error("Invalid rewrite candidate");
  }
  return candidate;
}
