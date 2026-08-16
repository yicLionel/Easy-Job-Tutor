import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseConfirmedMaterials, generateDeepReport } from "../src/core/analysis-pipeline.js";
import { diagnosisFor, jobs, reportFor, resumes } from "./fixtures/acceptance-cases.js";

const resume = resumes[0];
const job = jobs[0];
const baseSession = {
  jd: { id: job.id, title: job.title, rawText: job.requirements.join("\n"), confirmedAt: "now" },
  resume: { id: resume.id, text: resume.text, confirmedAt: "now" },
  answers: [], questions: [], facts: [], evidence: [], scoring: null,
};

test("quick diagnosis completes without waiting for deep polishing", async () => {
  let reportCalled = false;
  const llmClient = {
    diagnose: async () => diagnosisFor(resume, job),
    generateReport: async () => { reportCalled = true; return reportFor(resume, job); },
  };
  const clockValues = [100, 4300];
  const fast = await diagnoseConfirmedMaterials({ llmClient, settings: {}, session: baseSession, clock: { now: () => clockValues.shift() } });
  assert.equal(fast.durationMs, 4200);
  assert.equal(reportCalled, false);
  assert.equal(typeof fast.scoring.readinessScore, "number");

  const deepClock = [5000, 13100];
  const deep = await generateDeepReport({ llmClient, settings: {}, session: { ...baseSession, facts: fast.payload.facts, evidence: fast.payload.evidence, scoring: fast.scoring }, clock: { now: () => deepClock.shift() } });
  assert.equal(reportCalled, true);
  assert.equal(deep.durationMs, 8100);
});

test("LLM client can route fast and deep stages to different models", async () => {
  const { LlmClient } = await import("../src/core/llm-client.js");
  const models = [];
  const responses = [diagnosisFor(resume, job), reportFor(resume, job)];
  const client = new LlmClient(async (_url, options) => {
    models.push(JSON.parse(options.body).model);
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(responses.shift()) } }] }) };
  });
  const settings = { baseUrl: "https://example.test/v1", apiKey: "x", model: "default", fastModel: "fast", reportModel: "deep" };
  await client.diagnose(settings, {});
  await client.generateReport(settings, {});
  assert.deepEqual(models, ["fast", "deep"]);
});

test("confirmed evidence tolerates PDF unicode, spacing, and punctuation normalization", async () => {
  const normalizedResume = {
    ...baseSession.resume,
    text: "AI应⽤⼯程化：能够基于模型 API、Agent框架完成配置调试。",
  };
  const payload = diagnosisFor(resume, job);
  payload.facts = [{
    factId: "f1",
    statement: "具备 AI 应用工程化与 Agent 框架配置经验",
    status: "confirmed",
    source: "resume",
    evidence: "AI应用工程化:能够基于模型API,Agent框架完成配置调试",
  }];
  const llmClient = { diagnose: async () => payload };

  await assert.doesNotReject(
    diagnoseConfirmedMaterials({
      llmClient,
      settings: {},
      session: { ...baseSession, resume: normalizedResume },
    }),
  );
});

test("confirmed evidence tolerates one model wording substitution inside a long source-backed quote", async () => {
  const sourceBackedResume = {
    ...baseSession.resume,
    text: "参与测评OpenClaw、MaxClaw、Codex等10+款AI Agent产品，比较任务执行、GUI控制与自动化能力，梳理Agent工作机制。",
  };
  const payload = diagnosisFor(resume, job);
  payload.facts = [{
    factId: "f1",
    statement: "参与多款 AI Agent 产品评测",
    status: "confirmed",
    source: "resume",
    evidence: "参与测评OpenClaw、MaxClaw、Codex等10+款AI Agent产品，对比任务执行、GUI控制与自动化能力",
  }];

  await assert.doesNotReject(
    diagnoseConfirmedMaterials({
      llmClient: { diagnose: async () => payload },
      settings: {},
      session: { ...baseSession, resume: sourceBackedResume },
    }),
  );
});

test("unsupported confirmed evidence is downgraded instead of failing the whole diagnosis", async () => {
  const payload = diagnosisFor(resume, job);
  payload.facts = [{
    factId: "f1",
    statement: "主导 Java 微服务平台上线",
    status: "confirmed",
    source: "resume",
    evidence: "主导Java微服务平台上线并将系统吞吐量提升300%",
  }];

  payload.evidence[0] = {
    ...payload.evidence[0],
    factId: "f1",
    strength: "strong",
  };

  const result = await diagnoseConfirmedMaterials({
    llmClient: { diagnose: async () => payload },
    settings: {},
    session: baseSession,
  });

  assert.equal(result.payload.facts[0].status, "pending_confirmation");
  assert.equal(result.payload.evidence[0].strength, "pending");
  assert.match(result.payload.evidence[0].reason, /无法在已确认原文中定位/);
  assert.ok(result.payload.questions.some((question) => question.factId === "f1"));
  assert.ok(result.scoring.unscorableRequirements.includes(result.payload.evidence[0].requirementId));
});
