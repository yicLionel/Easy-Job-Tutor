import test from "node:test";
import assert from "node:assert/strict";
import { calculateReadiness } from "../src/core/scoring.js";
import { createEmptySession, SESSION_SCHEMA_VERSION } from "../src/shared/models.js";
import { canEnterStep, markDownstreamStale } from "../src/core/workflow.js";
import { validateAnalysisPayload, validateRewriteCandidate } from "../src/core/schemas.js";
import { assembleFinalResume, canAcceptRewrite } from "../src/core/rewrite.js";
import { LlmClient } from "../src/core/llm-client.js";
import { addHistory, clearAllData, loadHistory, migrateSession } from "../src/storage/store.js";

test("readiness score stays unavailable below evidence coverage threshold", () => {
  const result = calculateReadiness({
    requirements: [{ id: "r1", level: "core" }, { id: "r2", level: "core" }],
    evidence: [{ requirementId: "r1", strength: "strong" }, { requirementId: "r2", strength: "pending" }],
    dimensions: { ats: 80, hrScan: 80, interviewReadiness: 80, credibility: 90 },
  });
  assert.equal(result.evidenceCoverage, 50);
  assert.equal(result.readinessScore, null);
});

test("workflow requires confirmed JD and resume before diagnosis", () => {
  const session = createEmptySession();
  assert.equal(canEnterStep(session, "diagnosing"), false);
  const ready = { ...session, jd: { confirmedAt: "now" }, resume: { confirmedAt: "now" } };
  assert.equal(canEnterStep(ready, "diagnosing"), true);
  assert.equal(markDownstreamStale({ ...ready, scoring: { readinessScore: 70 } }, "resume_review").scoring, null);
});

test("analysis schema rejects facts without explicit status", () => {
  assert.throws(() => validateAnalysisPayload({ requirements: [], facts: [{ factId: "f1", statement: "x" }], evidence: [], questions: [], dimensions: {}, dimensionDetails: {}, risks: [], suggestions: [] }), /Invalid fact record/);
});

test("rewrite candidates cannot use unconfirmed facts", () => {
  const candidate = { candidateId: "c1", factIds: ["f1"], suggestedText: "safe", contributionLevel: "participate", contributionBasis: "简历明确描述个人完成的模块", dataStatus: "not_applicable", keywordEvidence: ["Java 项目开发"] };
  assert.equal(canAcceptRewrite(candidate, [{ factId: "f1", status: "pending_confirmation" }]), false);
  assert.equal(canAcceptRewrite(candidate, [{ factId: "f1", status: "confirmed" }]), true);
  assert.equal(assembleFinalResume("Original bullet", [{ ...candidate, originalText: "Original bullet", userDecision: "accepted" }]), "safe");
});

test("analysis schema requires an auditable detail for every score dimension", () => {
  const payload = {
    requirements: [], facts: [], evidence: [], questions: [], dimensions: { ats: 80, hrScan: 70, interviewReadiness: 60, credibility: 90 }, risks: [], suggestions: [],
    dimensionDetails: Object.fromEntries(["jdMatch", "ats", "hrScan", "interviewReadiness", "credibility"].map((key) => [key, { evidence: [], deductions: [], actions: [], verificationQuestion: "无" }])),
  };
  assert.doesNotThrow(() => validateAnalysisPayload(payload));
  delete payload.dimensionDetails.ats;
  assert.throws(() => validateAnalysisPayload(payload), /Invalid ats score detail/);
});

test("rewrite candidates require contribution, data, and keyword audit fields", () => {
  assert.throws(
    () => validateRewriteCandidate({ candidateId: "c1", suggestedText: "改写", factIds: ["f1"] }),
    /Invalid rewrite candidate/,
  );
});

test("LLM client posts to the OpenAI-compatible chat endpoint", async () => {
  let request;
  const client = new LlmClient(async function (url, options) {
    assert.equal(this, globalThis);
    request = { url, options };
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }) };
  });
  const result = await client.analyze({ baseUrl: "https://example.test/v1/", apiKey: "secret", model: "demo" }, { task: "test" });
  assert.deepEqual(result, { ok: true });
  assert.equal(request.url, "https://example.test/v1/chat/completions");
  assert.equal(request.options.headers.Authorization, "Bearer secret");
  assert.equal(JSON.parse(request.options.body).model, "demo");
  assert.equal(JSON.parse(request.options.body).max_tokens, undefined);
});

test("analysis request tells the model the complete required response contract", async () => {
  let requestBody;
  const client = new LlmClient(async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              requirements: [],
              facts: [],
              evidence: [],
              questions: [],
              dimensions: {},
              suggestions: [],
            }),
          },
        }],
      }),
    };
  });

  await client.analyze(
    { baseUrl: "https://example.test/v1", apiKey: "secret", model: "demo" },
    { schemaVersion: "analysis-v1", jd: { rawText: "岗位要求：Java" }, resume: { text: "技能：Java" } },
  );

  assert.equal(requestBody.messages[0].role, "system");
  assert.match(requestBody.messages[0].content, /requirements.*facts.*evidence.*questions.*dimensions.*risks/s);
  assert.doesNotMatch(requestBody.messages[0].content, /"suggestions":/);
  assert.match(requestBody.messages[0].content, /hard_gate.*core.*standard.*bonus/s);
  assert.match(requestBody.messages[0].content, /confirmed.*pending_confirmation.*model_inference/s);
  assert.match(requestBody.messages[0].content, /只返回一个 JSON 对象/);
  assert.equal(requestBody.messages[1].role, "user");
});

test("LLM client accepts OpenAI-compatible content part arrays", async () => {
  const client = new LlmClient(async () => ({
    ok: true,
    json: async () => ({ choices: [{ message: { content: [{ type: "output_text", text: '{"ok":true}' }] } }] }),
  }));

  const result = await client.analyze(
    { baseUrl: "https://example.test/v1", apiKey: "secret", model: "demo" },
    { task: "test" },
  );

  assert.deepEqual(result, { ok: true });
});

test("LLM client explains a response exhausted before final content", async () => {
  const client = new LlmClient(async () => ({
    ok: true,
    json: async () => ({ choices: [{ finish_reason: "length", message: { content: null } }] }),
  }));

  await assert.rejects(
    client.analyze({ baseUrl: "https://example.test/v1", apiKey: "secret", model: "demo" }, { task: "test" }),
    /达到长度上限/,
  );
});

test("history keeps only the 20 most recent records", async () => {
  await clearAllData();
  for (let index = 0; index < 21; index += 1) await addHistory({ id: String(index), createdAt: index });
  const history = await loadHistory();
  assert.equal(history.length, 20);
  assert.equal(history[0].id, "20");
  assert.equal(history.at(-1).id, "1");
  await clearAllData();
});

test("legacy analysis and JD confirmation are invalidated while source materials are preserved", async () => {
  const { session: migrated, migrated: didMigrate } = migrateSession({
    id: "legacy-session",
    sessionSchemaVersion: 2,
    step: "suggestions",
    jd: { title: "Java 开发", confirmedAt: "2026-07-28T00:00:00.000Z" },
    resume: { text: "Java 项目经历", confirmedAt: "2026-07-28T00:00:00.000Z" },
    facts: [{ factId: "old-fact", status: "confirmed" }],
    evidence: [{ requirementId: "old-requirement", strength: "strong" }],
    questions: [],
    suggestions: [{ candidateId: "old-candidate" }],
    scoring: { readinessScore: 57, rubricVersion: "readiness-v1" },
  });

  assert.equal(didMigrate, true);
  assert.equal(migrated.sessionSchemaVersion, SESSION_SCHEMA_VERSION);
  assert.equal(migrated.step, "jd_review");
  assert.equal(migrated.jd.title, "Java 开发");
  assert.equal(migrated.jd.confirmedAt, null);
  assert.equal(migrated.jd.requiresRefresh, true);
  assert.equal(migrated.resume.text, "Java 项目经历");
  assert.equal(migrated.resume.confirmedAt, "2026-07-28T00:00:00.000Z");
  assert.equal(migrated.scoring, null);
  assert.deepEqual(migrated.facts, []);
  assert.deepEqual(migrated.suggestions, []);
  assert.match(migrated.migrationNotice, /重新读取并确认 JD/);
});
