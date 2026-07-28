import test from "node:test";
import assert from "node:assert/strict";

test("structures resume text into factual editable sections without dropping content", async () => {
  let module;
  try {
    module = await import("../src/parsers/resume-sections.js");
  } catch {
    module = {};
  }

  assert.equal(typeof module.structureResumeText, "function");
  const structured = module.structureResumeText(`张三
13800000000 · zhangsan@example.com
教育背景
墨尔本大学 计算机科学硕士 2025-2027
项目经历
智能求职助手
负责 Chrome 扩展开发
实习经历
示例科技有限公司 软件工程实习生
校园经历
计算机协会 技术部成员
专业技能
Java、JavaScript、SQL
兴趣爱好
跑步、摄影
自我评价
学习主动，注重事实准确
补充说明
可于六月到岗`);

  assert.equal(structured, `## 个人信息
张三
13800000000 · zhangsan@example.com

## 教育经历
墨尔本大学 计算机科学硕士 2025-2027

## 项目经历
智能求职助手
负责 Chrome 扩展开发

## 实习/工作经历
示例科技有限公司 软件工程实习生

## 社团经历
计算机协会 技术部成员

## 技能
Java、JavaScript、SQL

## 爱好
跑步、摄影

## 个人特点
学习主动，注重事实准确

## 其他信息
补充说明
可于六月到岗`);
});

test("preserves PDF line endings before resume section classification", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "教育经历", hasEOL: true },
      { str: "墨尔本大学", hasEOL: false },
      { str: "计算机科学", hasEOL: true },
      { str: "项目经历", hasEOL: true },
    ]),
    "教育经历\n墨尔本大学计算机科学\n项目经历",
  );
});

test("detects PDF line changes from text coordinates when hasEOL is absent", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "教育经历", hasEOL: false, transform: [1, 0, 0, 1, 40, 700] },
      { str: "墨尔本大学", hasEOL: false, transform: [1, 0, 0, 1, 40, 680] },
      { str: "计算机科学", hasEOL: false, transform: [1, 0, 0, 1, 140, 680] },
    ]),
    "教育经历\n墨尔本大学 计算机科学",
  );
});

test("keeps canonical resume section headings stable when text is structured again", async () => {
  const { structureResumeText } = await import("../src/parsers/resume-sections.js");
  const structured = `## 实习/工作经历
示例科技有限公司 软件工程实习生

## 证书/奖项
大学英语六级`;

  assert.equal(structureResumeText(structured), structured);
});

test("does not inject spaces between adjacent Chinese PDF text items", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "墨尔本大学", transform: [1, 0, 0, 1, 40, 680], width: 50 },
      { str: "计算机科学", transform: [1, 0, 0, 1, 90, 680], width: 50 },
    ]),
    "墨尔本大学计算机科学",
  );
});

test("normalizes embedded PDF whitespace and explicit line endings once", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "教育经历\n", transform: [1, 0, 0, 1, 40, 700], width: 50 },
      { str: "  墨尔本大学  ", transform: [1, 0, 0, 1, 40, 680], width: 50 },
      { str: " 计算机科学 ", hasEOL: true, transform: [1, 0, 0, 1, 90, 680], width: 50 },
    ]),
    "教育经历\n墨尔本大学 计算机科学",
  );
});

test("does not break a visual line for small PDF baseline drift", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "负责系统设计", transform: [1, 0, 0, 1, 40, 700], width: 70 },
      { str: "、核心开发与交付", transform: [1, 0, 0, 1, 110, 697], width: 90 },
    ]),
    "负责系统设计、核心开发与交付",
  );
});

test("keeps a real PDF line break when the baseline gap is large", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "岗位职责：负责系统设计", transform: [1, 0, 0, 1, 40, 700], width: 120 },
      { str: "参与核心开发与交付", transform: [1, 0, 0, 1, 40, 680], width: 100 },
    ]),
    "岗位职责：负责系统设计\n参与核心开发与交付",
  );
});

test("joins a wrapped sentence when the previous PDF line ends with continuation punctuation", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "负责SaaS产品的系统设计，", transform: [1, 0, 0, 1, 40, 700], width: 140 },
      { str: "核心开发与交付。", transform: [1, 0, 0, 1, 40, 680], width: 100 },
    ]),
    "负责SaaS产品的系统设计，核心开发与交付。",
  );
});

test("joins long visual wraps that split a sentence without punctuation", async () => {
  const { pdfItemsToText } = await import("../src/parsers/resume-sections.js");

  assert.equal(
    pdfItemsToText([
      { str: "参与测评OpenClaw、MaxClaw、Codex等10款AI Agent产品，对比任务执行、GUI", transform: [1, 0, 0, 1, 40, 700], width: 400 },
      { str: "控制和自动化能力，梳理产品机制、能力边界及适用场景。", transform: [1, 0, 0, 1, 40, 680], width: 360 },
    ]),
    "参与测评OpenClaw、MaxClaw、Codex等10款AI Agent产品，对比任务执行、GUI控制和自动化能力，梳理产品机制、能力边界及适用场景。",
  );
});
