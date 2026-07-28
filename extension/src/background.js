chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "extract-current-job") return undefined;
  chrome.tabs.sendMessage(sender.tab?.id ?? message.tabId, { type: "extract-job" }).then(sendResponse).catch((error) => sendResponse({ error: error.message }));
  return true;
});
