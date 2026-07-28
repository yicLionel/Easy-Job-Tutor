export function readinessTone(score) {
  if (typeof score !== "number") return { className: "unavailable", label: "待补充证据" };
  if (score >= 70) return { className: "good", label: "准备较充分" };
  if (score <= 40) return { className: "low", label: "优先补强" };
  return { className: "mid", label: "仍有提升空间" };
}
