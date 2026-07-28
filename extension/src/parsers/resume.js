import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser.js";
import { pdfItemsToText, structureResumeText } from "./resume-sections.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function fileExtension(fileName) {
  return fileName.toLowerCase().split(".").pop();
}

function normalizeText(value) {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function parsePdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(pdfItemsToText(content.items));
  }
  const rawText = normalizeText(pages.join("\n\n"));
  const text = structureResumeText(rawText);
  const warnings = [];
  if (!rawText) warnings.push("scanned-or-empty-pdf");
  if (pdf.numPages > 10) warnings.push("too-many-pages");
  return { text, rawText, fileType: "pdf", pages: pdf.numPages, warnings, blocked: warnings.includes("scanned-or-empty-pdf") || warnings.includes("too-many-pages") };
}

export async function parseDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = normalizeText(result.value);
  const text = structureResumeText(rawText);
  const warnings = result.messages.map((message) => message.message);
  if (!rawText) warnings.push("empty-docx");
  if (rawText.length > 50000) warnings.push("too-many-characters");
  return { text, rawText, fileType: "docx", warnings, blocked: !rawText || rawText.length > 50000 };
}

export async function parseResumeFile(file) {
  if (!file) throw new Error("No resume file selected");
  if (file.size > 10 * 1024 * 1024) throw new Error("Resume file exceeds 10 MB");
  const extension = fileExtension(file.name);
  if (extension === "pdf") return parsePdf(file);
  if (extension === "docx") return parseDocx(file);
  throw new Error("Only PDF and DOCX files are supported");
}
