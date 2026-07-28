import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const manifestPath = path.join(root, "manifest.json");
if (!fs.existsSync(manifestPath)) throw new Error("dist/manifest.json is missing; run npm run build first");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const required = [manifest.side_panel?.default_path, manifest.background?.service_worker, manifest.options_page].filter(Boolean);
for (const script of manifest.content_scripts ?? []) required.push(...(script.js ?? []));
for (const relativePath of required) {
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Manifest references missing file: ${relativePath}`);
}
const html = fs.readFileSync(path.join(root, manifest.side_panel.default_path), "utf8");
for (const reference of [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]).filter((value) => !value.startsWith("http"))) {
  const relativePath = reference.replace(/^\//, "");
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`Side panel references missing asset: ${relativePath}`);
}
const assetFiles = fs.readdirSync(path.join(root, "assets"));
if (!assetFiles.some((fileName) => /^pdf\.worker.*\.mjs$/.test(fileName))) {
  throw new Error("PDF.js worker asset is missing from the extension build");
}
if (manifest.manifest_version !== 3) throw new Error("Chrome MVP must use Manifest V3");
if (Number(manifest.minimum_chrome_version) < 116) throw new Error("Chrome side panel minimum version must be 116+");
console.log(`dist verified: ${required.length} manifest files and side panel assets are present`);
