import test from "node:test";
import assert from "node:assert/strict";
import { validateReportPayload } from "../src/core/schemas.js";
import { assembleDeliveryPackage, hasBlockingRisks, toAtsText } from "../src/core/rewrite.js";

const facts = [{ factId: "f1", statement: "负责接口开发", status: "confirmed", evidence: "负责接口开发" }];
const report = {
  suggestions: [],
  hrSummary: { text: "具备接口开发经验", factIds: ["f1"] },
  bossIntro: { text: "您好，我有接口开发经验。", factIds: ["f1"] },
  headhunterIntro: { text: "候选人具备接口开发经验。", factIds: ["f1"] },
  interviewQuestions: [{ question: "接口如何设计？", reason: "核验个人贡献", factIds: ["f1"] }],
  keywordCoverage: [{ keyword: "接口开发", status: "covered", factIds: ["f1"] }],
  nextSteps: ["准备接口设计案例"],
};

test("deep report rejects user-facing text backed by unconfirmed facts", () => {
  assert.doesNotThrow(() => validateReportPayload(report, facts));
  assert.throws(() => validateReportPayload({ ...report, hrSummary: { text: "未经确认", factIds: ["f2"] } }, facts), /unconfirmed facts/);
});

test("ATS text is deterministically derived from the accepted resume", () => {
  assert.equal(toAtsText("## 项目经历\n\n**负责接口开发**\n\n\n[作品](https://example.test)"), "项目经历\n\n负责接口开发\n\n作品");
});

test("blocking risks prevent a final delivery package", () => {
  const blocking = [{ content: "贡献不实", level: "high", reason: "参与写成主导", correction: "降级动词", blocksFinal: true }];
  assert.equal(hasBlockingRisks(blocking), true);
  assert.throws(() => assembleDeliveryPackage({ finalResume: "负责接口开发", report, scoring: { readinessScore: 70 }, risks: blocking }), /无法生成最终报告/);
});

test("complete report contains every Skill delivery section", () => {
  const text = assembleDeliveryPackage({ finalResume: "## 项目经历\n负责接口开发", report, scoring: { readinessScore: 70 }, risks: [] });
  for (const heading of ["优化后的简历", "ATS 纯文本版本", "HR 快速阅读摘要", "Boss 直聘开场白", "猎头介绍话术", "面试官可能追问", "风险提示", "下一步建议"]) assert.match(text, new RegExp(heading));
});
