const SECTION_LABELS = ["职位描述", "岗位要求", "任职要求", "职位要求", "岗位职责", "工作职责", "工作内容", "公司信息"];
const DETAIL_MARKERS = ["职位描述", "岗位要求", "任职要求", "职位要求", "岗位职责", "工作职责", "工作内容"];
const CITY_PATTERN = /(北京|上海|广州|深圳|杭州|南京|苏州|成都|重庆|武汉|西安|天津|长沙|厦门|青岛|大连|郑州|济南|合肥|福州|东莞|佛山|珠海|宁波|无锡|全国|海外)/;
const SALARY_PATTERN = /(?:\d+(?:\.\d+)?\s*(?:-|~|至)\s*\d+(?:\.\d+)?\s*(?:[kK]|千|万)(?:\s*[·.]?\s*\d+薪)?|面议)/;

function normalizedLines(text) {
  return String(text ?? "").split("\n").map((line) => line.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
}

function sectionLine(line, labels) {
  for (const label of labels) {
    const match = line.match(new RegExp(`^${label}(?:[：:]\\s*(.*))?$`));
    if (match) return { content: match[1]?.trim() ?? "" };
  }
  return null;
}

function section(lines, labels) {
  const start = lines.findIndex((line) => sectionLine(line, labels));
  if (start < 0) return "";
  const end = lines.findIndex((line, index) => index > start && sectionLine(line, SECTION_LABELS));
  const inlineContent = sectionLine(lines[start], labels)?.content;
  return [inlineContent, ...lines.slice(start + 1, end < 0 ? undefined : end)].filter(Boolean).join("\n").trim();
}

function boundedNumberedSection(text) {
  const lines = normalizedLines(text);
  if (!lines.some((line) => /^\d+[、.．]\s*/.test(line))) return text;
  const items = [];
  for (const line of lines) {
    if (/^\d+[、.．]\s*/.test(line)) {
      items.push(line);
    } else if (items.length && !/[。；;]$/.test(items.at(-1))) {
      items[items.length - 1] = `${items.at(-1)} ${line}`;
    } else if (items.length) {
      break;
    }
  }
  return items.join("\n");
}

function detailScore(candidate) {
  const text = String(candidate?.text ?? "");
  const selector = String(candidate?.selector ?? "").toLowerCase();
  const markerCount = DETAIL_MARKERS.filter((marker) => text.includes(marker)).length;
  const isDetail = /(detail|description|position|job-content|job-info|job-sec)/.test(selector);
  const isList = /(list|card|recommend|search-result|filter)/.test(selector);
  return markerCount * 1000 + (isDetail ? 250 : 0) - (isList ? 500 : 0) + Math.min(text.length, 800) / 100;
}

export function chooseDetailCandidate(candidates) {
  return candidates.filter((candidate) => String(candidate?.text ?? "").trim()).sort((left, right) => detailScore(right) - detailScore(left))[0] ?? null;
}

export function mergeDetailSamples(samples) {
  const lines = [];
  const seen = new Set();
  for (const sample of samples) {
    for (const line of normalizedLines(sample)) {
      if (!seen.has(line)) {
        seen.add(line);
        lines.push(line);
      }
    }
  }
  return lines.join("\n");
}

export function formatJobText({ sourceUrl = "", sourceSite = "generic", detailText, title = "", company = "", location = "", salary = "" }) {
  const lines = normalizedLines(detailText);
  const detailStart = lines.findIndex((line) => DETAIL_MARKERS.includes(line.replace(/[：:]$/, "")));
  const headerLines = lines.slice(0, detailStart < 0 ? Math.min(lines.length, 8) : detailStart);
  const parsedSalary = salary || (headerLines.join(" ").match(SALARY_PATTERN)?.[0] ?? "");
  const parsedLocation = location || (headerLines.join(" ").match(CITY_PATTERN)?.[0] ?? "");
  const parsedTitle = title || (headerLines[0] ?? "").replace(parsedSalary, "").trim();
  const parsedCompany = company || (headerLines.find((line, index) => index > 0 && /(公司|集团|科技|通信|股份|有限|企业|工作室)/.test(line) && !line.includes("职位")) ?? "");
  const tags = normalizedLines(section(lines, ["职位描述"]));
  const requirementsText = boundedNumberedSection(section(lines, ["岗位要求", "任职要求", "职位要求"]));
  const responsibilities = boundedNumberedSection(section(lines, ["岗位职责", "工作职责", "工作内容"]));
  const details = lines.join("\n");
  const rawText = [
    parsedTitle && `岗位名称：${parsedTitle}`,
    parsedSalary && `薪资：${parsedSalary}`,
    parsedLocation && `工作地点：${parsedLocation}`,
    parsedCompany && `公司：${parsedCompany}`,
    tags.length && `标签：${tags.join("、")}`,
    requirementsText && `岗位要求：\n${requirementsText}`,
    responsibilities && `岗位职责：\n${responsibilities}`,
  ].filter(Boolean).join("\n\n");
  const fieldsFound = [parsedTitle, parsedSalary, parsedLocation, parsedCompany, tags.length, requirementsText, responsibilities].filter(Boolean).length;
  const warnings = [];
  if (!parsedTitle) warnings.push("missing-title");
  if (!details) warnings.push("empty-detail-pane");
  if (!requirementsText) warnings.push("missing-requirements");
  if (!responsibilities) warnings.push("missing-responsibilities");
  return { id: crypto.randomUUID(), sourceSite, sourceUrl, title: parsedTitle, company: parsedCompany, location: parsedLocation, salary: parsedSalary, tags, responsibilities, requirements: requirementsText ? [requirementsText] : [], rawText, completeness: Math.min(100, fieldsFound * 13 + (details.length >= 240 ? 9 : 0)), warnings, confirmedAt: null };
}
