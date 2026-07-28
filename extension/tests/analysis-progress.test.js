import test from "node:test";
import assert from "node:assert/strict";

let analysisProgressSnapshot;
try {
  ({ analysisProgressSnapshot } = await import("../src/sidepanel/analysis-progress.js"));
} catch {
  analysisProgressSnapshot = undefined;
}

test("analysis progress gives staged estimated feedback without claiming the request is complete", () => {
  assert.equal(typeof analysisProgressSnapshot, "function");

  assert.deepEqual(analysisProgressSnapshot(0), {
    percent: 12,
    label: "正在准备已确认材料…",
  });
  assert.deepEqual(analysisProgressSnapshot(1800), {
    percent: 42,
    label: "正在建立证据映射…",
  });

  const waiting = analysisProgressSnapshot(30000);
  assert.equal(waiting.percent, 92);
  assert.match(waiting.label, /模型仍在生成/);
  assert.ok(waiting.percent < 100);
});
