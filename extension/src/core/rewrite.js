export function canAcceptRewrite(candidate, facts) {
  if (!candidate || candidate.eligibility === "blocked" || !candidate.contributionLevel || !candidate.contributionBasis || !candidate.dataStatus || !Array.isArray(candidate.keywordEvidence)) return false;
  const factMap = new Map(facts.map((fact) => [fact.factId, fact]));
  return candidate.factIds.every((factId) => factMap.get(factId)?.status === "confirmed");
}

export function decideRewrite(suggestions, candidateId, decision, facts) {
  return suggestions.map((candidate) => {
    if (candidate.candidateId !== candidateId) return candidate;
    if (decision === "accepted" && !canAcceptRewrite(candidate, facts)) {
      throw new Error("Cannot accept a suggestion that references unconfirmed facts");
    }
    return { ...candidate, userDecision: decision };
  });
}

export function assembleFinalResume(baseText, suggestions) {
  let output = baseText.trim();
  const accepted = suggestions.filter((candidate) => candidate.userDecision === "accepted");
  for (const candidate of accepted) {
    if (candidate.originalText && output.includes(candidate.originalText)) {
      output = output.replace(candidate.originalText, candidate.userEditedText || candidate.suggestedText);
    } else {
      output += `\n\n## 岗位定制补充\n${candidate.userEditedText || candidate.suggestedText}`;
    }
  }
  return output.trim();
}

export function hasBlockingRisks(...riskGroups) {
  return riskGroups.flat().some((risk) => risk?.blocksFinal === true);
}

export function toAtsText(resumeText) {
  return String(resumeText ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function assembleDeliveryPackage({ finalResume, report, scoring, risks = [] }) {
  if (!finalResume?.trim()) throw new Error("Final resume is empty");
  if (!report) throw new Error("Deep report is missing");
  if (hasBlockingRisks(risks)) throw new Error("存在未解决的高风险，无法生成最终报告");
  const score = typeof scoring?.readinessScore === "number" ? `${scoring.readinessScore}/100` : "暂无法评分";
  const questions = report.interviewQuestions.map((item, index) => `${index + 1}. ${item.question}\n   核验原因：${item.reason}`).join("\n");
  const riskText = risks.length ? risks.map((item) => `- [${item.level}] ${item.content}：${item.reason}；修正：${item.correction}`).join("\n") : "- 暂无阻断风险";
  const keywordText = report.keywordCoverage.map((item) => `- ${item.keyword}：${item.status}`).join("\n");
  return `# 简历诊断与投递报告\n\n## 综合评分\n\n${score}\n\n## 优化后的简历\n\n${finalResume.trim()}\n\n## ATS 纯文本版本\n\n${toAtsText(finalResume)}\n\n## HR 快速阅读摘要\n\n${report.hrSummary.text}\n\n## Boss 直聘开场白\n\n${report.bossIntro.text}\n\n## 猎头介绍话术\n\n${report.headhunterIntro.text}\n\n## 面试官可能追问\n\n${questions}\n\n## 关键词覆盖\n\n${keywordText}\n\n## 风险提示\n\n${riskText}\n\n## 下一步建议\n\n${report.nextSteps.map((item) => `- ${item}`).join("\n")}\n\n> 评分基于当前材料，不代表面试或录用概率。`;
}
