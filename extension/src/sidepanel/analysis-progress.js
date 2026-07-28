export function analysisProgressSnapshot(elapsedMs) {
  if (elapsedMs < 1200) {
    return { percent: 12, label: "正在准备已确认材料…" };
  }
  if (elapsedMs < 4200) {
    return { percent: 42, label: "正在建立证据映射…" };
  }
  if (elapsedMs < 10000) {
    return { percent: 68, label: "正在比对岗位要求与简历证据…" };
  }
  if (elapsedMs < 30000) {
    return { percent: 84, label: "正在整理诊断结果与评分…" };
  }
  return { percent: 92, label: "模型仍在生成，请保持此页面打开…" };
}
