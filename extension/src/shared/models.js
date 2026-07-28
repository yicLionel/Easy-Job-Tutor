export const WORKFLOW_STEPS = [
  "setup",
  "jd_review",
  "resume_review",
  "diagnosing",
  "questions",
  "reassessing",
  "diagnosed",
  "polishing",
  "suggestions",
  "final",
];

export const FACT_STATUSES = ["confirmed", "pending_confirmation", "model_inference"];
export const EVIDENCE_STRENGTHS = ["strong", "partial", "none", "pending"];
export const SESSION_SCHEMA_VERSION = 3;

export function createEmptySession() {
  return {
    id: crypto.randomUUID(),
    sessionSchemaVersion: SESSION_SCHEMA_VERSION,
    step: "setup",
    status: "active",
    jd: null,
    resume: null,
    facts: [],
    evidence: [],
    questions: [],
    answers: [],
    scoring: null,
    suggestions: [],
    report: null,
    timings: {},
    finalResume: null,
    finalReport: null,
    updatedAt: new Date().toISOString(),
  };
}

export function assertEnum(value, allowed, field) {
  if (!allowed.includes(value)) throw new Error(`${field} must be one of: ${allowed.join(", ")}`);
  return value;
}
