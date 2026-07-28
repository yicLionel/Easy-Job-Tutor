export function requireExtractedJob(response) {
  const job = response?.job;
  const text = typeof job?.rawText === "string"
    ? job.rawText
    : typeof job?.responsibilities === "string"
      ? job.responsibilities
      : "";

  if (!job || !text.trim()) throw new Error("未返回可确认的 JD 文本");
  return job;
}

export async function requestExtractedJob({ sendMessage, injectContentScript }) {
  try {
    const response = await sendMessage();
    if (response?.error) throw new Error(response.error);
    return requireExtractedJob(response);
  } catch {
    await injectContentScript();
    const response = await sendMessage();
    if (response?.error) throw new Error(response.error);
    return requireExtractedJob(response);
  }
}
