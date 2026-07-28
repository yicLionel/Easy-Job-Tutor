export const resumes = [
  {
    id: "backend-newgrad",
    text: "教育经历\n计算机科学本科\n项目经历\n本人负责8个REST API的开发与联调，使用Java、Spring Boot和MySQL。\n参与性能优化，团队测试结果显示接口响应时间降低18%。\n实习经历\n后端开发实习4个月。",
    fact: "本人负责8个REST API的开发与联调，使用Java、Spring Boot和MySQL。",
    role: "backend",
    forbidden: ["3年以上", "Kafka经验", "主导性能优化"],
  },
  {
    id: "ai-product-switcher",
    text: "教育经历\n金融学本科\n项目经历\n独立完成求职辅助扩展的PRD和交互原型，并邀请6名同学测试。\n参与测评10款AI Agent产品，整理任务执行与GUI控制差异。\n实习经历\n银行产品运营实习。",
    fact: "独立完成求职辅助扩展的PRD和交互原型，并邀请6名同学测试。",
    role: "product",
    forbidden: ["商业RAG落地", "主导增长", "负责大模型上线"],
  },
  {
    id: "finance-data-analyst",
    text: "教育经历\n统计学本科\n工作经历\n使用SQL和Python清洗经营数据，并用Power BI制作月度看板。\n每月处理约30份数据文件，该规模为个人估算。\n参与团队流程优化，团队统计整体效率提升25%。",
    fact: "使用SQL和Python清洗经营数据，并用Power BI制作月度看板。",
    role: "data",
    forbidden: ["独立提升25%", "A/B实验经验", "主导数据战略"],
  },
];

export const jobs = [
  { id: "java-backend", role: "backend", title: "Java后端开发", requirements: ["3年以上Java开发经验", "熟悉Spring Boot与MySQL", "具备Kafka项目经验"] },
  { id: "ai-product-manager", role: "product", title: "AI产品经理", requirements: ["具备商业AI产品经验", "能够完成用户研究与PRD", "具备LLM或RAG项目落地经验"] },
  { id: "data-analyst", role: "data", title: "数据分析师", requirements: ["2年以上数据分析经验", "熟练使用SQL、Python和BI工具", "具备A/B实验经验"] },
];

const dimensions = ["jdMatch", "ats", "hrScan", "interviewReadiness", "credibility"];

export function diagnosisFor(resume, job) {
  const sameRole = resume.role === job.role;
  const requirements = job.requirements.map((text, index) => ({ id: `r${index + 1}`, text, level: index === 0 ? "hard_gate" : "core" }));
  const facts = [{ factId: "f1", statement: resume.fact, status: "confirmed", source: "resume", evidence: resume.fact }];
  const strengths = sameRole ? ["none", "strong", "none"] : ["none", "partial", "none"];
  const evidence = requirements.map((item, index) => ({ requirementId: item.id, factId: strengths[index] === "none" ? "" : "f1", strength: strengths[index], reason: strengths[index] === "strong" ? "简历原文提供直接项目证据" : strengths[index] === "partial" ? "仅有可迁移能力" : "当前材料无证据" }));
  const baseScore = sameRole ? 78 : 52;
  const dimensionDetails = Object.fromEntries(dimensions.map((key) => [key, { evidence: [resume.fact], deductions: sameRole ? ["硬性年限或专项经验仍缺失"] : ["缺少目标岗位直接经验"], actions: ["补充可核验项目细节"], verificationQuestion: key === "interviewReadiness" ? "请说明个人动作、方法和结果口径。" : "" }]));
  return {
    requirements, facts, evidence, questions: [],
    dimensions: { ats: baseScore, hrScan: baseScore, interviewReadiness: baseScore - 5, credibility: 85 },
    dimensionDetails,
    risks: [{ content: requirements[0].text, level: "high", reason: "高权重硬性条件无直接证据", correction: "如实说明缺口，不得硬凑", blocksFinal: false }],
  };
}

export function reportFor(resume, job) {
  const sameRole = resume.role === job.role;
  const suggestion = sameRole ? [{
    candidateId: "c1", section: "项目经历", originalText: resume.fact, suggestedText: resume.fact,
    factIds: ["f1"], eligibility: "eligible", contributionLevel: "own", contributionBasis: resume.fact,
    dataStatus: resume.id === "finance-data-analyst" ? "estimate" : "declared", keywordEvidence: [job.requirements[1]],
  }] : [];
  return {
    suggestions: suggestion,
    hrSummary: { text: `候选人的可核验经历：${resume.fact}`, factIds: ["f1"] },
    bossIntro: { text: `您好，我希望应聘${job.title}，相关事实是：${resume.fact}`, factIds: ["f1"] },
    headhunterIntro: { text: `候选人应聘${job.title}，可核验事实：${resume.fact}`, factIds: ["f1"] },
    interviewQuestions: [{ question: "请说明该经历中的个人动作和结果口径。", reason: "核验贡献边界", factIds: ["f1"] }],
    keywordCoverage: job.requirements.map((keyword, index) => ({ keyword, status: index === 1 ? (sameRole ? "covered" : "partial") : "missing", factIds: index === 1 ? ["f1"] : [] })),
    nextSteps: ["针对缺失的硬性要求准备如实说明"],
  };
}
