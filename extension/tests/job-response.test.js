import test from "node:test";
import assert from "node:assert/strict";
import { requestExtractedJob, requireExtractedJob } from "../src/core/job-response.js";

test("requires a non-empty JD before the review state can be saved", () => {
  assert.throws(() => requireExtractedJob(undefined), /未返回可确认的 JD/);
  assert.throws(() => requireExtractedJob({ job: { rawText: "   ", responsibilities: "" } }), /未返回可确认的 JD/);

  const job = { rawText: "负责产品需求分析", responsibilities: "负责产品需求分析" };
  assert.equal(requireExtractedJob({ job }), job);
});

test("injects the current content script and retries instead of reading the whole page", async () => {
  const calls = [];
  const job = { rawText: "岗位职责：负责服务开发", responsibilities: "负责服务开发" };
  const sendMessage = async () => {
    calls.push("send");
    if (calls.length === 1) throw new Error("Receiving end does not exist");
    return { job };
  };
  const injectContentScript = async () => calls.push("inject");
  const result = await requestExtractedJob({ sendMessage, injectContentScript });
  assert.equal(result, job);
  assert.deepEqual(calls, ["send", "inject", "send"]);
});
