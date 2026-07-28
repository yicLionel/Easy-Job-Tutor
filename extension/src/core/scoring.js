export const RUBRIC_VERSION = "readiness-v1";
export const DIMENSION_WEIGHTS = {
  jdMatch: 0.35,
  ats: 0.15,
  hrScan: 0.15,
  interviewReadiness: 0.2,
  credibility: 0.15,
};

const REQUIREMENT_WEIGHTS = { hard_gate: 4, core: 3, standard: 2, bonus: 1 };
const EVIDENCE_VALUES = { strong: 1, partial: 0.5, none: 0, pending: 0 };

export function evidenceCoverage(requirements, links) {
  const total = requirements.reduce((sum, item) => sum + (REQUIREMENT_WEIGHTS[item.level] ?? 1), 0);
  if (!total) return 0;
  const covered = requirements.reduce((sum, item) => {
    const link = links.find((candidate) => candidate.requirementId === item.id);
    return sum + (REQUIREMENT_WEIGHTS[item.level] ?? 1) * (link && link.strength !== "pending" ? 1 : 0);
  }, 0);
  return Math.round((covered / total) * 100);
}

function weightedEvidence(requirements, links) {
  const total = requirements.reduce((sum, item) => sum + (REQUIREMENT_WEIGHTS[item.level] ?? 1), 0);
  if (!total) return null;
  const score = requirements.reduce((sum, item) => {
    const link = links.find((candidate) => candidate.requirementId === item.id);
    return sum + (REQUIREMENT_WEIGHTS[item.level] ?? 1) * (link ? EVIDENCE_VALUES[link.strength] ?? 0 : 0);
  }, 0);
  return Math.round((score / total) * 100);
}

export function calculateReadiness({ requirements = [], evidence = [], dimensions = {}, dimensionDetails = {}, risks = [] }) {
  const coverage = evidenceCoverage(requirements, evidence);
  const jdMatch = weightedEvidence(requirements, evidence);
  const scores = {
    jdMatch,
    ats: dimensions.ats ?? null,
    hrScan: dimensions.hrScan ?? null,
    interviewReadiness: dimensions.interviewReadiness ?? null,
    credibility: dimensions.credibility ?? null,
  };
  const weighted = Object.entries(DIMENSION_WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (typeof scores[key] === "number" ? scores[key] * weight : 0);
  }, 0);
  const allScorable = Object.values(scores).every((value) => typeof value === "number");
  return {
    rubricVersion: RUBRIC_VERSION,
    readinessScore: allScorable && coverage >= 60 ? Math.round(weighted) : null,
    dimensionScores: scores,
    dimensionDetails,
    risks,
    evidenceCoverage: coverage,
    scorableRequirements: requirements.filter((item) => evidence.some((link) => link.requirementId === item.id && link.strength !== "pending")).length,
    unscorableRequirements: requirements.filter((item) => evidence.some((link) => link.requirementId === item.id && link.strength === "pending")).map((item) => item.id),
  };
}
