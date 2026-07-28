import { chooseDetailCandidate, formatJobText, mergeDetailSamples } from "./job-detail.js";

const SITE_RULES = [
  { id: "liepin", hosts: ["liepin.com"], title: ["h1", ".job-title", "[class*='title']"], company: [".company-name", "[class*='company']"], detail: [".job-intro-container", ".job-description", "[class*='job-detail']"] },
  { id: "zhipin", hosts: ["zhipin.com"], title: [".job-detail-box h1", ".job-detail-box [class*='job-name']", ".job-detail-box [class*='title']", "h1"], company: [".job-detail-box [class*='company']", ".job-detail-box [class*='brand']"], detail: [".job-detail-box", ".job-detail", "[class*='job-detail']", "[class*='detail-content']", ".job-sec-text"] },
];

function firstText(selectors, root = document) {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    const text = element?.innerText?.trim();
    if (text) return text;
  }
  return "";
}

function normalizeText(value) {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function candidateElements(root, selectors) { return selectors.flatMap((selector) => [...root.querySelectorAll(selector)].map((element) => ({ element, selector, text: normalizeText(element.innerText ?? "") }))); }
function markerCandidates(root) { return [...root.querySelectorAll("section, article, div")].filter((element) => /职位描述|岗位要求|任职要求|职位要求|岗位职责|工作职责|工作内容/.test(element.innerText ?? "")).map((element) => ({ element, selector: `${element.tagName.toLowerCase()}.${element.className || ""}`, text: normalizeText(element.innerText ?? "") })); }
function findDetail(root, rule) { const candidate = chooseDetailCandidate([...candidateElements(root, rule?.detail ?? []), ...markerCandidates(root)]); return candidate?.element ?? root.body ?? root; }
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
function scrollTargets(detail, root) { return [detail, detail.parentElement, detail.parentElement?.parentElement, root.scrollingElement].filter((element, index, list) => element && list.indexOf(element) === index).filter((element) => element.scrollHeight > element.clientHeight + 80); }
async function collectFullDetailText(detail, root) {
  const samples = [detail.innerText ?? ""];
  for (const control of [...detail.querySelectorAll("button, a, [role='button']")]) { const label = (control.innerText ?? "").trim(); if (/^(展开|展开全部|查看全部|更多)$/.test(label) && control.offsetParent !== null) control.click(); }
  await delay(100);
  for (const target of scrollTargets(detail, root)) {
    const originalTop = target.scrollTop;
    const maxTop = target.scrollHeight - target.clientHeight;
    const steps = Math.min(12, Math.max(1, Math.ceil(maxTop / 700)));
    for (let index = 1; index <= steps; index += 1) { target.scrollTop = Math.round(maxTop * index / steps); target.dispatchEvent(new Event("scroll", { bubbles: true })); await delay(80); samples.push(detail.innerText ?? ""); }
    target.scrollTop = originalTop;
  }
  return mergeDetailSamples(samples);
}

export function detectSite(url = location.href) {
  const host = new URL(url).hostname;
  return SITE_RULES.find((rule) => rule.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`)))?.id ?? "generic";
}

export function extractJobDescription(root = document, url = location.href) {
  const siteId = detectSite(url);
  const rule = SITE_RULES.find((item) => item.id === siteId);
  const detail = findDetail(root, rule);
  return formatJobText({ sourceSite: siteId, sourceUrl: url, title: rule ? firstText(rule.title, detail) : firstText(["h1", "main h1", "title"], detail), company: rule ? firstText(rule.company, detail) : firstText(["[class*='company']"], detail), detailText: normalizeText(detail.innerText ?? "") });
}

export async function extractFullJobDescription(root = document, url = location.href) {
  const siteId = detectSite(url);
  const rule = SITE_RULES.find((item) => item.id === siteId);
  const detail = findDetail(root, rule);
  const detailText = await collectFullDetailText(detail, root);
  return formatJobText({ sourceSite: siteId, sourceUrl: url, title: rule ? firstText(rule.title, detail) : firstText(["h1", "main h1", "title"], detail), company: rule ? firstText(rule.company, detail) : firstText(["[class*='company']"], detail), detailText });
}
