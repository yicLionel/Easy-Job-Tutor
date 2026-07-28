import { extractFullJobDescription } from "./adapters/sites.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "extract-job") return undefined;
  extractFullJobDescription(document, location.href)
    .then((job) => sendResponse({ job }))
    .catch((error) => sendResponse({ error: error.message }));
  return true;
});
