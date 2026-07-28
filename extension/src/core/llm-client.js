const ANALYSIS_SYSTEM_PROMPT = `你是求职材料证据分析器。请比较用户提供的已确认 JD 与简历，只依据输入中的事实进行分析，不得虚构经历、技能、指标或结论。

只返回一个 JSON 对象，不要返回 Markdown、代码围栏或解释文字。顶层必须始终包含以下全部字段；没有内容时也必须返回空数组或空对象：
{
  "requirements": [{"id":"r1","text":"JD 要求原文","level":"hard_gate|core|standard|bonus"}],
  "facts": [{"factId":"f1","statement":"可概括的事实陈述","status":"confirmed|pending_confirmation|model_inference","source":"resume|user_answer","evidence":"从输入逐字复制的至少 8 个连续原文字符"}],
  "evidence": [{"requirementId":"r1","factId":"f1 或空字符串","strength":"strong|partial|none|pending","reason":"判断依据"}],
  "questions": [{"question":"只询问会改变诊断或改写结果的事实问题","reason":"提问原因"}],
  "dimensions": {"ats":0,"hrScan":0,"interviewReadiness":0,"credibility":0},
  "dimensionDetails": {"jdMatch|ats|hrScan|interviewReadiness|credibility":{"evidence":["事实或 JD 原文"],"deductions":["具体扣分原因"],"actions":["补分或修正动作"],"verificationQuestion":"可用于面试核验的问题"}},
  "risks": [{"content":"风险内容","level":"high|medium|low","reason":"风险原因","correction":"修正建议","blocksFinal":false}]
}

requirements、facts、evidence、questions、risks 必须是数组。dimensions、dimensionDetails 必须是对象，其中各分数为 0 到 100 的数字；证据不足时使用 null。每条 JD 要求都应有唯一 id；每条 evidence.requirementId 必须引用 requirements 中的 id。简历原文可直接视为用户已确认的事实，但模型推断和缺失信息不得标记为 confirmed。fact.statement 可以概括，fact.evidence 必须从对应 resume 或 user_answer 输入逐字复制至少 8 个连续原文字符，不得同义改写、纠错或补全。

评分必须严格使用以下 rubric：JD 匹配检查硬性条件、核心技能是否绑定项目证据、项目相关度、成果量化、职级、表达与 ATS；ATS 检查标准标题、关键词上下文、结构、图片/复杂表格风险、技能区、时间线与岗位名称；HR 检查 10 秒方向、前部亮点、相关性、结果、稳定性和简洁性；面试准备检查背景、个人贡献、方法决策、数据口径、复盘和 JD 关联；可信度检查数据来源、贡献边界、动词强度、不过度包装、逻辑自洽和风险披露。每个维度都要在 dimensionDetails 中给出证据、扣分和补分动作；面试准备必须有可验证问题。高风险未处理、造假、团队成果冒充个人或参与写成主导时，写入 risks。不得因关键词或技能清单单独出现而判定强覆盖。此阶段只做快速诊断，不生成润色建议或完整报告。

为保证快速返回：requirements 最多 12 条、facts 最多 16 条、evidence 最多 12 条、questions 最多 4 条、risks 最多 5 条；每一项只保留对评分有影响的简短表述。`;

const REPORT_SYSTEM_PROMPT = `你是中文求职材料深度润色与投递报告生成器。输入已包含确认后的 JD、简历、事实底稿、证据映射和评分。只使用 status=confirmed 的事实；不得新增或推断经历、技能、职责、数字、工具和成果。

只返回 JSON，不要返回 Markdown 或解释。必须包含：
{
  "suggestions": [{"candidateId":"c1","section":"简历栏目","originalText":"简历原文","suggestedText":"仅基于确认事实的改写","factIds":["f1"],"eligibility":"eligible|blocked","contributionLevel":"support|participate|own|drive|lead","contributionBasis":"支撑动词强度的确认事实","dataStatus":"declared|estimate|not_applicable","keywordEvidence":["绑定实际场景的 JD 关键词"]}],
  "hrSummary": {"text":"HR 10 秒摘要","factIds":["f1"]},
  "bossIntro": {"text":"Boss 直聘开场白","factIds":["f1"]},
  "headhunterIntro": {"text":"猎头介绍话术","factIds":["f1"]},
  "interviewQuestions": [{"question":"面试追问","reason":"为何需要核验","factIds":["f1"]}],
  "keywordCoverage": [{"keyword":"JD 关键词","status":"covered|partial|missing","factIds":["f1"]}],
  "nextSteps": ["下一步投递或补强动作"]
}

重写遵守：业务背景 + 个人动作 + 方法/工具 + 可验证结果；贡献强度按 support<participate<own<drive<lead，不得把参与写成主导；估算数字必须保留约/近/超过/区间；关键词必须绑定真实行动，禁止堆词；避免空话、AI 模板腔、统一句式和职责升级。高风险未解决时 suggestion 必须 blocked。所有材料块和面试问题必须引用 confirmed factIds。suggestions 最多 5 条，interviewQuestions 最多 8 条，nextSteps 最多 5 条。`;

export class LlmClient {
  constructor(fetchImpl = fetch) {
    // `window.fetch` requires Window as its receiver. Calling a stored fetch
    // function as `this.fetch(...)` makes LlmClient the receiver in Chrome.
    this.fetch = (...args) => fetchImpl.call(globalThis, ...args);
  }

  async testConnection(config) {
    const response = await this.#request(config, {
      messages: [{ role: "user", content: "Return JSON: {\"ok\":true}" }],
      temperature: 0,
    });
    return response;
  }

  async analyze(config, input) {
    return this.diagnose(config, input);
  }

  async diagnose(config, input) {
    return this.#request(config, {
      model: config.fastModel || config.model,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(input) },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
      // Reasoning models may spend a large part of a capped completion on
      // hidden reasoning and return no final message content. Keep a caller's
      // explicit limit, but do not impose one by default.
      ...(Number.isFinite(config.analysisMaxTokens) ? { max_tokens: config.analysisMaxTokens } : {}),
    });
  }

  async generateReport(config, input) {
    return this.#request(config, {
      model: config.reportModel || config.model,
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(input) },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
      ...(Number.isFinite(config.reportMaxTokens) ? { max_tokens: config.reportMaxTokens } : {}),
    });
  }

  async #request(config, body) {
    if (!config?.baseUrl || !config?.apiKey || !config?.model) throw new Error("Model configuration is incomplete");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 90000);
    try {
      const response = await this.fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model, ...body }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Model request failed (${response.status})`);
      const data = await response.json();
      const choice = data?.choices?.[0];
      const content = extractMessageContent(choice?.message?.content) ?? extractMessageContent(choice?.text) ?? extractMessageContent(data?.output_text);
      if (!content) {
        const finishReason = choice?.finish_reason;
        if (finishReason === "length") throw new Error("模型输出在生成 JSON 前达到长度上限；请取消接口侧输出限制或改用非推理模型");
        throw new Error("模型响应未包含可解析的文本内容；请确认所选模型支持 Chat Completions 与 JSON 输出");
      }
      return typeof content === "string" ? JSON.parse(content) : content;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function extractMessageContent(value) {
  if (typeof value === "string" && value.trim()) return value;
  if (!Array.isArray(value)) return null;
  const text = value.map((part) => {
    if (typeof part === "string") return part;
    if (typeof part?.text === "string") return part.text;
    if (typeof part?.content === "string") return part.content;
    return "";
  }).join("").trim();
  return text || null;
}
