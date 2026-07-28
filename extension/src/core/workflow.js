import { WORKFLOW_STEPS } from "../shared/models.js";

const GATES = {
  jd_review: (session) => Boolean(session.jd?.confirmedAt),
  resume_review: (session) => Boolean(session.jd?.confirmedAt),
  diagnosing: (session) => Boolean(session.jd?.confirmedAt && session.resume?.confirmedAt),
  questions: (session) => Boolean(session.scoring),
  reassessing: (session) => Boolean(session.scoring && session.answers?.length),
  diagnosed: (session) => Boolean(session.scoring),
  polishing: (session) => Boolean(session.scoring && !session.questions?.length),
  suggestions: (session) => Boolean(session.scoring && session.facts?.some((fact) => fact.status === "confirmed")),
  final: (session) => Boolean(session.suggestions?.some((item) => item.userDecision === "accepted")),
};

export function canEnterStep(session, step) {
  if (!WORKFLOW_STEPS.includes(step)) return false;
  if (step === "setup") return true;
  return GATES[step] ? GATES[step](session) : false;
}

export function moveToStep(session, step) {
  if (!canEnterStep(session, step)) {
    throw new Error(`Workflow gate prevents entering ${step}`);
  }
  return { ...session, step, updatedAt: new Date().toISOString() };
}

export function markDownstreamStale(session, changedStep) {
  const index = WORKFLOW_STEPS.indexOf(changedStep);
  if (index < 0) return session;
  const next = { ...session };
  if (index <= WORKFLOW_STEPS.indexOf("jd_review")) {
    next.scoring = null;
    next.evidence = [];
    next.questions = [];
    next.suggestions = [];
    next.report = null;
    next.finalResume = null;
    next.finalReport = null;
    next.timings = {};
  }
  if (index <= WORKFLOW_STEPS.indexOf("resume_review")) {
    next.scoring = null;
    next.evidence = [];
    next.questions = [];
    next.suggestions = [];
    next.report = null;
    next.finalResume = null;
    next.finalReport = null;
    next.timings = {};
  }
  return { ...next, updatedAt: new Date().toISOString() };
}
