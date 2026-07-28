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
