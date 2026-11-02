const GAME_URL = "https://www.nytimes.com/games/wordle/index.html";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_WORDLE") {
    chrome.tabs.create({ url: GAME_URL }).then(tab => sendResponse({ ok: true, tabId: tab.id })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === "GET_WORDLE_CANDIDATE") {
    chrome.storage.local.get("wordleCandidate").then(({ wordleCandidate }) => sendResponse({ ok: true, candidate: wordleCandidate || null }));
    return true;
  }
  if (message?.type === "WORDLE_COMPLETION_CANDIDATE") {
    if (!sender.tab?.url?.startsWith("https://www.nytimes.com/games/wordle/")) return;
    chrome.storage.local.set({ wordleCandidate: { detectedAt: Date.now(), tabId: sender.tab.id, source: "dom" } });
  }
});
