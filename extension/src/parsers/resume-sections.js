const SECTION_ALIASES = [
  { name: "个人信息", pattern: /^(个人信息|基本信息|联系方式|personal information)$/i },
  { name: "教育经历", pattern: /^(教育经历|教育背景|学历背景|education)$/i },
  { name: "项目经历", pattern: /^(项目经历|项目经验|projects?)$/i },
  { name: "实习\/工作经历", pattern: /^(实习\/工作经历|实习经历|实习经验|工作经历|工作经验|职业经历|employment|work experience)$/i },
  { name: "社团经历", pattern: /^(社团经历|校园经历|学生工作|社会实践|志愿经历|campus experience)$/i },
  { name: "技能", pattern: /^(专业技能|个人技能|技能特长|技能|技术栈|skills?)$/i },
  { name: "证书\/奖项", pattern: /^(证书\/奖项|证书|资格证书|荣誉奖项|获奖经历|奖项|certificates?|awards?)$/i },
  { name: "爱好", pattern: /^(兴趣爱好|兴趣|爱好|hobbies|interests)$/i },
  { name: "个人特点", pattern: /^(个人特点|自我评价|个人评价|个人总结|个人优势|自我介绍|summary|profile)$/i },
];

const SECTION_ORDER = ["个人信息", "教育经历", "项目经历", "实习/工作经历", "社团经历", "技能", "证书/奖项", "爱好", "个人特点", "其他信息"];

function normalizeLine(line) {
  return String(line ?? "").replace(/[ \t]+/g, " ").trim();
}

function headingText(line) {
  return normalizeLine(line).replace(/^#{1,6}\s*/, "").replace(/[：:]$/, "").trim();
}

function knownSection(line) {
  const heading = headingText(line);
  return SECTION_ALIASES.find((section) => section.pattern.test(heading))?.name ?? "";
}

function looksLikeUnknownHeading(line) {
  const heading = headingText(line);
  return heading.length > 0
    && heading.length <= 12
    && !/[，,。；;、·@]/.test(heading)
    && /(信息|背景|经历|经验|项目|技能|能力|奖项|证书|评价|特点|优势|爱好|兴趣|活动|实践|说明)$/.test(heading);
}

export function pdfItemsToText(items) {
  const lines = [""];
  let previous = null;
  let previousY = null;
  const breakLine = () => {
    if (lines.at(-1)) lines.push("");
    previous = null;
    previousY = null;
  };

  for (const item of items ?? []) {
    const raw = String(item?.str ?? "");
    const currentY = Number.isFinite(item?.transform?.[5]) ? item.transform[5] : null;
    const parts = raw.split(/\r?\n/);
    for (const [partIndex, part] of parts.entries()) {
      if (partIndex > 0) breakLine();
      const value = normalizeLine(part);
      if (!value) continue;
      if (previousY !== null && currentY !== null && Math.abs(currentY - previousY) > 4) breakLine();

      const currentX = Number.isFinite(item?.transform?.[4]) ? item.transform[4] : null;
      const width = Number.isFinite(item?.width) ? item.width : 0;
      const gap = previous && previous.x !== null && currentX !== null ? currentX - (previous.x + previous.width) : null;
      const startsWithPunctuation = /^[，。；：、,.!?！？)）】》]/.test(value);
      const currentIsLatin = /[A-Za-z0-9]/.test(value[0]);
      const previousIsLatin = /[A-Za-z0-9]/.test(previous?.lastChar ?? "");
      const explicitSpace = /^\s/.test(part) || Boolean(previous?.trailingSpace);
      const addSpace = Boolean(previous)
        && !startsWithPunctuation
        && (explicitSpace
          || (gap !== null && gap > 3)
          || (gap === null && currentIsLatin && previousIsLatin));

      if (addSpace && !lines.at(-1).endsWith(" ")) lines[lines.length - 1] += " ";
      lines[lines.length - 1] += value;
      previous = {
        lastChar: value.at(-1),
        trailingSpace: /\s$/.test(part),
        x: currentX,
        width,
      };
      if (currentY !== null) previousY = currentY;
    }
    if (item?.hasEOL) breakLine();
  }

  const normalizedLines = lines.map((line) => line.trim()).filter(Boolean);
  const mergedLines = [];
  for (const line of normalizedLines) {
    const previousLine = mergedLines.at(-1);
    const startsNewItem = /^(?:[-–—•●▪*]|\d+[、.)）]|[一二三四五六七八九十]+[、.)）])/.test(line);
    const isHeading = knownSection(previousLine) || looksLikeUnknownHeading(previousLine);
    const continuation = previousLine
      && !startsNewItem
      && !isHeading
      && !/[。！？!?]$/.test(previousLine)
      && (/[，、；,;]$/.test(previousLine)
        || /^[，、；,;]/.test(line)
        || (previousLine.length >= 18 && line.length >= 6));
    if (continuation) {
      const needsSpace = /[A-Za-z0-9]$/.test(previousLine) && /^[A-Za-z0-9]/.test(line);
      mergedLines[mergedLines.length - 1] += `${needsSpace ? " " : ""}${line}`;
    } else {
      mergedLines.push(line);
    }
  }
  return mergedLines.join("\n");
}

export function structureResumeText(text) {
  const lines = String(text ?? "").split(/\r?\n/).map(normalizeLine).filter(Boolean);
  if (!lines.length) return "";

  const sections = new Map(SECTION_ORDER.map((name) => [name, []]));
  let currentSection = "个人信息";
  let recognizedHeadings = 0;

  for (const line of lines) {
    const section = knownSection(line);
    if (section) {
      currentSection = section;
      recognizedHeadings += 1;
      continue;
    }
    if (looksLikeUnknownHeading(line)) {
      currentSection = "其他信息";
      sections.get(currentSection).push(line);
      continue;
    }
    sections.get(currentSection).push(line);
  }

  if (!recognizedHeadings) {
    sections.set("其他信息", [...sections.get("个人信息"), ...sections.get("其他信息")]);
    sections.set("个人信息", []);
  }

  return SECTION_ORDER
    .filter((name) => sections.get(name).length)
    .map((name) => `## ${name}\n${sections.get(name).join("\n")}`)
    .join("\n\n");
}
