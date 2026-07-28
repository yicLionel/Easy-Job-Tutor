import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseConfirmedMaterials, generateDeepReport } from "../src/core/analysis-pipeline.js";
import { assembleDeliveryPackage, assembleFinalResume, decideRewrite } from "../src/core/rewrite.js";
import { diagnosisFor, jobs, reportFor, resumes } from "./fixtures/acceptance-cases.js";

const settings = { baseUrl: "https://example.test/v1", apiKey: "test", model: "test" };

for (const resume of resumes) {
  for (const job of jobs) {
    test(`${resume.id} × ${job.id} preserves evidence and truthfulness gates`, async () => {
      const diagnosis = diagnosisFor(resume, job);
      const report = reportFor(resume, job);
      const llmClient = { diagnose: async () => diagnosis, generateReport: async () => report };
      const session = {
        jd: { id: job.id, title: job.title, rawText: job.requirements.join("\n"), confirmedAt: "now" },
        resume: { id: resume.id, text: resume.text, confirmedAt: "now" }, answers: [], questions: [], facts: [], evidence: [],
      };
      const fast = await diagnoseConfirmedMaterials({ llmClient, settings, session, clock: { now: () => 1 } });
      assert.equal(fast.payload.requirements.length, fast.payload.evidence.length);
      assert.ok(fast.payload.dimensionDetails.interviewReadiness.verificationQuestion);
      assert.ok(fast.payload.risks.some((risk) => risk.level === "high"));
      assert.equal(typeof fast.scoring.readinessScore, "number");

      const diagnosed = { ...session, facts: fast.payload.facts, evidence: fast.payload.evidence, questions: [], scoring: fast.scoring };
      const deep = await generateDeepReport({ llmClient, settings, session: diagnosed, clock: { now: () => 2 } });
      for (const block of [deep.payload.hrSummary, deep.payload.bossIntro, deep.payload.headhunterIntro]) assert.deepEqual(block.factIds, ["f1"]);

      if (resume.role === job.role) {
        const accepted = decideRewrite(deep.payload.suggestions, "c1", "accepted", fast.payload.facts);
        const finalResume = assembleFinalResume(resume.text, accepted);
        const delivery = assembleDeliveryPackage({ finalResume, report: deep.payload, scoring: fast.scoring, risks: fast.payload.risks });
        assert.match(delivery, /ATS 纯文本版本/);
        for (const forbidden of resume.forbidden) assert.doesNotMatch(finalResume, new RegExp(forbidden));
        if (resume.id === "finance-data-analyst") assert.match(delivery, /约30份/);
      } else {
        assert.equal(deep.payload.suggestions.length, 0);
        assert.ok(fast.payload.evidence.every((link) => link.strength !== "strong"));
      }
    });
  }
}

test("each resume scores highest for its matching JD category", async () => {
  for (const resume of resumes) {
    const scores = jobs.map((job) => {
      const payload = diagnosisFor(resume, job);
      const strong = payload.evidence.filter((item) => item.strength === "strong").length;
      return { role: job.role, strong };
    });
    const best = scores.toSorted((a, b) => b.strong - a.strong)[0];
    assert.equal(best.role, resume.role);
  }
});
