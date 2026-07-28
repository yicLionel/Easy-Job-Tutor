import { createEmptySession } from "../shared/models.js";
import { LlmClient } from "../core/llm-client.js";
import { assembleDeliveryPackage, assembleFinalResume, decideRewrite, hasBlockingRisks } from "../core/rewrite.js";
import { diagnoseConfirmedMaterials, generateDeepReport } from "../core/analysis-pipeline.js";
import { requestExtractedJob } from "../core/job-response.js";
import { addHistory, loadDefaultResume, loadSession, loadSettings, saveDefaultResume, saveSession, saveSettings, clearAllData } from "../storage/store.js";
import { analysisProgressSnapshot } from "./analysis-progress.js";
import { readinessTone } from "./readiness-ring.js";
import "./styles.css";

const app = document.querySelector("#app");
let state = { session: await loadSession(), settings: await loadSettings(), resume: await loadDefaultResume() };
const llmClient = new LlmClient();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[char]));
}

function render() {
  const session = state.session ?? createEmptySession();
  state.session = session;
  const progressLabels = ["JD", "简历", "诊断", "追问", "改写"];
  const progressIndex = session.step === "setup" ? 0 : session.step === "jd_review" ? 1 : session.step === "resume_review" ? 2 : session.step === "questions" || session.step === "reassessing" ? 3 : ["diagnosed", "polishing", "suggestions", "final"].includes(session.step) ? 4 : 2;
  const job = session.jd;
  const resume = session.resume ?? state.resume;
  const score = session.scoring;
  app.innerHTML = `
    <header class="topbar"><div><strong>Easy-Job-Tutor</strong><span class="muted">Chrome · v0.3 两阶段诊断</span></div><button id="settings-button" class="icon-button" title="设置">⚙</button></header>
    <main class="shell">
      <div class="progress">${progressLabels.map((label, index) => `<span class="progress-item ${index <= progressIndex ? "active" : ""}">${index + 1}. ${label}</span>`).join("")}</div>
      ${session.migrationNotice ? `<section class="migration-notice"><strong>版本升级提示</strong><p>${escapeHtml(session.migrationNotice)}</p></section>` : ""}
      <section class="hero"><span class="eyebrow">岗位材料准备度</span><h1>${score?.readinessScore ?? "先确认材料"}</h1><p>${score ? `证据覆盖率 ${score.evidenceCoverage}% · 评分规则 ${score.rubricVersion}` : "插件会读取当前职位，并在本地解析你的 PDF 或 DOCX 简历。"}</p></section>
      <section class="card-grid">
        <article class="panel-card"><span class="step-number">1</span><div><h2>读取当前 JD</h2><p id="job-status" class="muted">${job ? `${escapeHtml(job.title || "未识别职位")} · ${escapeHtml(job.company || "公司待确认")} · 完整度 ${job.completeness}%` : "尚未读取当前页面"}</p><button id="read-job" class="primary">${job ? "重新读取" : "读取职位"}</button>${job ? `<button id="confirm-job" class="secondary">${job.confirmedAt ? "已确认 JD" : "确认 JD"}</button>` : ""}</div></article>
        <article class="panel-card"><span class="step-number">2</span><div><h2>上传简历</h2><p id="resume-status" class="muted">${resume ? `已保存：${escapeHtml(resume.fileName)}${resume.confirmedAt ? " · 已确认" : " · 待确认"}` : "支持文本型 PDF 和 DOCX"}</p><input id="resume-file" type="file" accept=".pdf,.docx" hidden /><button id="upload-resume" class="secondary">选择文件</button>${resume ? `<button id="confirm-resume" class="secondary">${resume.confirmedAt ? "已确认简历" : "确认简历"}</button>` : ""}</div></article>
      </section>
      ${job ? `<section class="review-card"><h2>确认 JD 文本</h2><textarea id="job-text" class="review-text">${escapeHtml(job.rawText || job.responsibilities || "")}</textarea><p class="muted">可先修正职位页面误识别的内容，再确认。</p></section>` : ""}
      ${resume ? `<section class="review-card"><h2>确认简历文本</h2><textarea id="resume-text" class="review-text">${escapeHtml(resume.text || "")}</textarea><p class="muted">解析结果只保存在本机；确认后才会发送给你配置的模型接口。</p></section>` : ""}
      ${job?.confirmedAt && resume?.confirmedAt ? `<section class="analysis-card"><h2>材料已确认</h2><p class="muted">可以调用模型提取证据并计算固定规则评分。原始文件不会发送。</p><button id="run-analysis" class="primary">${score ? "重新诊断" : "开始快速诊断"}</button></section>` : ""}
      ${score ? `${renderTiming(session.timings)}${renderScore(score)}` : ""}
      ${session.step === "questions" ? renderQuestions(session) : ""}
      ${score && !session.questions?.length && !session.report ? `<section class="analysis-card"><h2>深度润色与完整报告</h2><p class="muted">快速评分已完成。下一阶段生成可核验的改写候选、HR 摘要、沟通话术和面试问题。</p><button id="run-polish" class="primary">生成深度润色</button></section>` : ""}
      ${session.step === "suggestions" ? renderSuggestions(session) : ""}
      ${session.step === "final" ? renderFinal(session) : ""}
      <section class="notice"><strong>真实性闸门</strong><p>解析文本和 JD 都需要你确认。扫描版 PDF、缺失字段和未确认事实不会直接进入最终简历。</p></section>
    </main>
  `;
  bindEvents();
  animateReadinessRing();
}

function bindEvents() {
  document.querySelector("#settings-button").addEventListener("click", showSettings);
  document.querySelector("#read-job").addEventListener("click", readCurrentJob);
  document.querySelector("#upload-resume").addEventListener("click", () => document.querySelector("#resume-file").click());
  document.querySelector("#resume-file").addEventListener("change", handleResumeFile);
  document.querySelector("#confirm-job")?.addEventListener("click", confirmJob);
  document.querySelector("#confirm-resume")?.addEventListener("click", confirmResume);
  document.querySelector("#run-analysis")?.addEventListener("click", runAnalysis);
  document.querySelector("#submit-answers")?.addEventListener("click", submitAnswers);
  document.querySelector("#run-polish")?.addEventListener("click", runDeepPolish);
  document.querySelectorAll("[data-rewrite-decision]").forEach((button) => button.addEventListener("click", () => decideSuggestion(button.dataset.id, button.dataset.rewriteDecision)));
  document.querySelector("#copy-final")?.addEventListener("click", async () => {
    try { await copyFinal(); } catch (error) { window.alert(error.message); }
  });
}

function renderTiming(timings = {}) {
  if (!timings.diagnosisMs) return "";
  return `<p class="timing-badge">快速诊断 ${(timings.diagnosisMs / 1000).toFixed(1)} 秒${timings.reassessmentMs ? ` · 重新评分 ${(timings.reassessmentMs / 1000).toFixed(1)} 秒` : ""}${timings.deepPolishMs ? ` · 深度润色 ${(timings.deepPolishMs / 1000).toFixed(1)} 秒` : ""}</p>`;
}

function renderScore(score) {
  const names = { jdMatch: "JD 匹配", ats: "ATS", hrScan: "HR 扫描", interviewReadiness: "面试准备", credibility: "可信度" };
  const overall = score.readinessScore;
  const tone = readinessTone(overall);
  const displayScore = typeof overall === "number" ? overall : 0;
  const detailFor = (key) => score.dimensionDetails?.[key] ?? { evidence: [], deductions: [], actions: [], verificationQuestion: "" };
  const detailText = (detail) => `${detail.evidence.length ? `依据：${detail.evidence.join("；")}` : "依据：证据不足"}${detail.deductions.length ? ` · 扣分：${detail.deductions.join("；")}` : ""}${detail.actions.length ? ` · 建议：${detail.actions.join("；")}` : ""}${detail.verificationQuestion ? ` · 核验：${detail.verificationQuestion}` : ""}`;
  return `<section class="score-card"><div class="readiness-overview ${tone.className}"><div class="readiness-ring" role="img" aria-label="综合准备度 ${typeof overall === "number" ? `${overall} 分` : "暂无法评分"}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="readiness-ring-track" cx="60" cy="60" r="52" pathLength="100"></circle><circle class="readiness-ring-value" data-readiness-ring data-score="${displayScore}" cx="60" cy="60" r="52" pathLength="100"></circle></svg><div class="readiness-ring-number"><strong>${typeof overall === "number" ? overall : "—"}</strong><span>综合准备度</span></div></div><div class="readiness-summary"><span class="eyebrow">综合评分</span><h2>${escapeHtml(tone.label)}</h2><p>${typeof overall === "number" ? `已基于 ${score.evidenceCoverage}% 的证据覆盖率与 5 个维度计算。` : `当前证据覆盖率为 ${score.evidenceCoverage}%，补充确认事实后即可计算综合分。`}</p></div></div><div class="score-heading"><strong>五维评分</strong><span class="muted">证据优先级：已确认事实</span></div>${Object.entries(score.dimensionScores).map(([key, value]) => `<div class="score-row"><span>${names[key] ?? key}</span><div class="score-track"><i style="width:${typeof value === "number" ? value : 0}%"></i></div><b>${typeof value === "number" ? value : "暂无法评分"}</b></div><p class="score-detail">${escapeHtml(detailText(detailFor(key)))}</p>`).join("")}${score.risks?.length ? `<section class="risk-list"><strong>风险提示</strong>${score.risks.map((risk) => `<p class="risk-${escapeHtml(risk.level)}">${escapeHtml(risk.content)}：${escapeHtml(risk.reason)}。建议：${escapeHtml(risk.correction)}${risk.blocksFinal ? "（阻断最终版）" : ""}</p>`).join("")}</section>` : ""}<p class="score-disclaimer">评分用于材料诊断，不代表面试或录用概率。</p></section>`;
}

function animateReadinessRing() {
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-readiness-ring]").forEach((ring) => {
      ring.style.strokeDashoffset = String(100 - Number(ring.dataset.score));
    });
  });
}

function renderQuestions(session) {
  return `<section class="analysis-card"><h2>补充事实</h2><p class="muted">只回答能够改变诊断或改写结果的问题。未确认的信息不会进入最终简历。</p>${session.questions.map((question, index) => `<label class="question"><span>${index + 1}. ${escapeHtml(question.question || question.text || question)}</span><textarea data-question-index="${index}" placeholder="请填写真实经历；不确定时可以写“待确认”"></textarea></label>`).join("")}<button id="submit-answers" class="primary">确认回答并重新评分</button></section>`;
}

function renderSuggestions(session) {
  if (!session.suggestions?.length) return `<section class="analysis-card"><h2>当前没有可接受的改写候选</h2><p class="muted">请补充更多已确认事实，或保留原文。</p></section>`;
  return `<section class="analysis-card"><h2>岗位定制修改建议</h2><p class="muted">每条建议都引用事实。只有已确认事实才能进入最终简历。</p>${session.suggestions.map((candidate) => `<article class="suggestion ${candidate.userDecision === "accepted" ? "accepted" : ""}"><div class="suggestion-head"><strong>${escapeHtml(candidate.section || "经历")} · ${escapeHtml(candidate.candidateId)}</strong><span>${escapeHtml(candidate.userDecision || "待处理")}</span></div><p class="muted">原文：${escapeHtml(candidate.originalText)}</p><p>${escapeHtml(candidate.userEditedText || candidate.suggestedText)}</p><p class="muted">依据：${escapeHtml(candidate.factIds?.join(", ") || "无")} · 贡献强度：${escapeHtml(candidate.contributionLevel || "未核验")} · 数据：${escapeHtml(candidate.dataStatus || "未核验")} · 关键词证据：${escapeHtml(candidate.keywordEvidence?.join("、") || "无")}</p><p class="muted">贡献依据：${escapeHtml(candidate.contributionBasis || "未核验")}</p><div class="suggestion-actions"><button data-rewrite-decision="accepted" data-id="${escapeHtml(candidate.candidateId)}" class="primary">接受</button><button data-rewrite-decision="rejected" data-id="${escapeHtml(candidate.candidateId)}" class="secondary">拒绝</button></div></article>`).join("")}<button id="copy-final" class="primary">生成并复制定制简历</button></section>`;
}

function renderFinal(session) {
  return `<section class="analysis-card"><h2>完整投递报告</h2><textarea id="final-resume" class="final-text" readonly>${escapeHtml(session.finalReport || "")}</textarea><button id="copy-final" class="primary">复制完整报告</button></section>`;
}

function startAnalysisProgress(anchor, initialLabel = "正在准备已确认材料…") {
  const progress = document.createElement("section");
  progress.className = "analysis-progress";
  progress.setAttribute("role", "status");
  progress.setAttribute("aria-live", "polite");
  progress.innerHTML = `<div class="analysis-progress-head"><strong>正在分析</strong><span data-analysis-percent>12%</span></div><div class="analysis-progress-track"><i data-analysis-fill style="width:12%"></i></div><p data-analysis-label>${escapeHtml(initialLabel)}</p><small>进度按处理阶段估算；完成后将自动显示结果。</small>`;
  anchor.insertAdjacentElement("afterend", progress);
  const startedAt = performance.now();
  const update = () => {
    const snapshot = analysisProgressSnapshot(performance.now() - startedAt);
    progress.querySelector("[data-analysis-percent]").textContent = `${snapshot.percent}%`;
    progress.querySelector("[data-analysis-fill]").style.width = `${snapshot.percent}%`;
    progress.querySelector("[data-analysis-label]").textContent = snapshot.label;
  };
  update();
  const intervalId = window.setInterval(update, 300);
  return () => {
    window.clearInterval(intervalId);
    progress.remove();
  };
}

async function readCurrentJob() {
  const status = document.querySelector("#job-status");
  status.textContent = "正在读取当前职位…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("未找到当前页面");
    const job = await requestExtractedJob({
      sendMessage: () => chrome.tabs.sendMessage(tab.id, { type: "extract-job" }),
      injectContentScript: () => {
        const contentFile = chrome.runtime.getManifest().content_scripts?.[0]?.js?.[0];
        if (!contentFile) throw new Error("扩展清单未声明职位读取脚本");
        return chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [contentFile] });
      },
    });
    state.session = { ...state.session, jd: job, step: "jd_review", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    status.textContent = `读取失败：${error.message}`;
  }
}

async function confirmJob() {
  const text = document.querySelector("#job-text")?.value.trim() || state.session.jd.rawText;
  state.session = { ...state.session, jd: { ...state.session.jd, rawText: text, responsibilities: text, confirmedAt: new Date().toISOString() }, step: "resume_review", updatedAt: new Date().toISOString() };
  await saveSession(state.session);
  render();
}

async function handleResumeFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const status = document.querySelector("#resume-status");
  status.textContent = "正在本地解析…";
  try {
    const { parseResumeFile } = await import("../parsers/resume.js");
    const parsed = await parseResumeFile(file);
    if (parsed.blocked) throw new Error(`文件无法进入分析：${parsed.warnings.join(", ")}`);
    const resume = { id: crypto.randomUUID(), fileName: file.name, fileType: parsed.fileType, text: parsed.text, warnings: parsed.warnings, confirmedAt: null };
    state.resume = resume;
    await saveDefaultResume(resume);
    state.session = { ...state.session, resume, step: "resume_review", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    status.textContent = `解析失败：${error.message}`;
  }
}

async function confirmResume() {
  const text = document.querySelector("#resume-text")?.value.trim() || state.session.resume.text;
  if (!text) throw new Error("简历文本不能为空");
  const resume = { ...state.session.resume, text, confirmedAt: new Date().toISOString() };
  state.resume = resume;
  state.session = { ...state.session, resume, step: "diagnosing", updatedAt: new Date().toISOString() };
  await saveDefaultResume(resume);
  await saveSession(state.session);
  render();
}

async function runAnalysis() {
  const button = document.querySelector("#run-analysis");
  button.disabled = true;
  button.textContent = "正在建立证据映射…";
  const stopProgress = startAnalysisProgress(button);
  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const { payload, scoring, durationMs } = await diagnoseConfirmedMaterials({ llmClient, settings: state.settings, session: { ...state.session, answers: [] } });
    state.session = { ...state.session, migrationNotice: null, facts: payload.facts, evidence: payload.evidence, questions: payload.questions.slice(0, 6), suggestions: [], report: null, scoring, timings: { diagnosisMs: durationMs }, step: payload.questions.length ? "questions" : "diagnosed", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    button.disabled = false;
    button.textContent = `诊断失败：${error.message}`;
  } finally {
    stopProgress();
  }
}

async function submitAnswers() {
  const button = document.querySelector("#submit-answers");
  const answers = [...document.querySelectorAll("[data-question-index]")].map((field) => ({ questionIndex: Number(field.dataset.questionIndex), answer: field.value.trim() })).filter((item) => item.answer);
  if (!answers.length) {
    button.textContent = "至少回答一个问题";
    return;
  }
  button.disabled = true;
  button.textContent = "正在重新评分…";
  const stopProgress = startAnalysisProgress(button, "正在准备补充的已确认事实…");
  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const { payload, scoring, durationMs } = await diagnoseConfirmedMaterials({ llmClient, settings: state.settings, session: { ...state.session, answers } });
    state.session = { ...state.session, migrationNotice: null, answers, facts: payload.facts, evidence: payload.evidence, questions: payload.questions.slice(0, 6), suggestions: [], report: null, scoring, timings: { ...state.session.timings, reassessmentMs: durationMs }, step: payload.questions.length ? "questions" : "diagnosed", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    button.disabled = false;
    button.textContent = `重新评分失败：${error.message}`;
  } finally {
    stopProgress();
  }
}

async function runDeepPolish() {
  const button = document.querySelector("#run-polish");
  button.disabled = true;
  button.textContent = "正在生成深度润色…";
  const stopProgress = startAnalysisProgress(button, "正在准备已确认事实底稿…");
  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const { payload, durationMs } = await generateDeepReport({ llmClient, settings: state.settings, session: state.session });
    state.session = { ...state.session, report: payload, suggestions: payload.suggestions, timings: { ...state.session.timings, deepPolishMs: durationMs }, step: "suggestions", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    button.disabled = false;
    button.textContent = `深度润色失败：${error.message}`;
  } finally {
    stopProgress();
  }
}

async function decideSuggestion(buttonId, decision) {
  try {
    state.session = { ...state.session, suggestions: decideRewrite(state.session.suggestions, buttonId, decision, state.session.facts), updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

async function copyFinal() {
  if (state.session.step !== "final") {
    if (!state.session.suggestions.some((candidate) => candidate.userDecision === "accepted")) throw new Error("请至少接受一条经核验的修改建议");
    if (hasBlockingRisks(state.session.scoring?.risks ?? [])) throw new Error("存在阻断性风险，请先修正后重新诊断");
    const finalResume = assembleFinalResume(state.session.resume.text, state.session.suggestions);
    const finalReport = assembleDeliveryPackage({ finalResume, report: state.session.report, scoring: state.session.scoring, risks: state.session.scoring?.risks ?? [] });
    state.session = { ...state.session, finalResume, finalReport, step: "final", updatedAt: new Date().toISOString() };
    await saveSession(state.session);
    await addHistory({ id: state.session.id, createdAt: state.session.updatedAt, jobTitle: state.session.jd?.title ?? "", company: state.session.jd?.company ?? "", score: state.session.scoring?.readinessScore ?? null, finalResume, finalReport });
    render();
  }
  await navigator.clipboard.writeText(state.session.finalReport || "");
}

function showSettings() {
  app.innerHTML = `<header class="topbar"><strong>模型设置</strong><button id="back-button" class="icon-button">←</button></header><main class="shell"><section class="settings"><label>Base URL<input id="base-url" value="${escapeHtml(state.settings.baseUrl)}" /></label><label>API Key<input id="api-key" type="password" value="${escapeHtml(state.settings.apiKey)}" /></label><label>默认模型<input id="model" value="${escapeHtml(state.settings.model)}" placeholder="例如 gpt-4o-mini" /></label><label>快速诊断模型（可选）<input id="fast-model" value="${escapeHtml(state.settings.fastModel || "")}" placeholder="留空则使用默认模型" /></label><label>深度润色模型（可选）<input id="report-model" value="${escapeHtml(state.settings.reportModel || "")}" placeholder="留空则使用默认模型" /></label><p class="muted">Key 仅保存于 Chrome 本地存储。快速模型优先返回评分，深度模型负责润色与完整报告。</p><button id="test-settings" class="secondary">测试连接</button><button id="save-settings" class="primary">保存设置</button><button id="clear-data" class="danger">清除全部本地数据</button></section></main>`;
  document.querySelector("#back-button").addEventListener("click", render);
  document.querySelector("#save-settings").addEventListener("click", async () => {
    state.settings = { ...state.settings, baseUrl: document.querySelector("#base-url").value.trim(), apiKey: document.querySelector("#api-key").value, model: document.querySelector("#model").value.trim(), fastModel: document.querySelector("#fast-model").value.trim(), reportModel: document.querySelector("#report-model").value.trim() };
    if (globalThis.chrome?.permissions?.request) {
      try {
        const origin = new URL(state.settings.baseUrl).origin;
        const pattern = `${origin}/*`;
        const hasPermission = await chrome.permissions.contains({ origins: [pattern] });
        if (!hasPermission) {
          const granted = await chrome.permissions.request({ origins: [pattern] });
          if (!granted) throw new Error("未获得模型接口的主机权限");
        }
      } catch (error) {
        window.alert(`接口权限未保存：${error.message}`);
        return;
      }
    }
    await saveSettings(state.settings);
    render();
  });
  document.querySelector("#test-settings").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "测试中…";
    try {
      const settings = { baseUrl: document.querySelector("#base-url").value.trim(), apiKey: document.querySelector("#api-key").value, model: document.querySelector("#model").value.trim(), fastModel: document.querySelector("#fast-model").value.trim(), reportModel: document.querySelector("#report-model").value.trim() };
      await llmClient.testConnection(settings);
      button.textContent = "连接成功";
    } catch (error) {
      button.disabled = false;
      button.textContent = `连接失败：${error.message}`;
    }
  });
  document.querySelector("#clear-data").addEventListener("click", async () => { await clearAllData(); state = { session: null, settings: await loadSettings(), resume: null }; render(); });
}

render();
