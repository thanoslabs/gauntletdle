importScripts("shared/wordle-result.js");
const GAME_URL = "https://www.nytimes.com/games/wordle/index.html";
const WORDLE_PREFIX = "https://www.nytimes.com/games/wordle/";
const CAPTURE_KEY = "gauntletdleCapturedResult";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_WORDLE" && sender.url?.startsWith("https://thanoslabs.github.io/gauntletdle/")) {
    chrome.tabs.create({ url: GAME_URL }).then(tab => sendResponse({ ok: true, tabId: tab.id })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === "GET_WORDLE_CANDIDATE" && sender.url?.startsWith("https://thanoslabs.github.io/gauntletdle/")) {
    chrome.storage.local.get("wordleCandidate").then(({ wordleCandidate }) => sendResponse({ ok: true, candidate: wordleCandidate || null }));
    return true;
  }
  if (message?.type === "GET_CAPTURED_RESULT" && sender.url?.startsWith("https://thanoslabs.github.io/gauntletdle/")) {
    chrome.storage.local.get(CAPTURE_KEY).then(data => {
      const result = data[CAPTURE_KEY];
      sendResponse({ ok: true, result: result && Date.now() - result.capturedAt < 86400000 ? result : null });
    }).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === "CAPTURE_SHARE_RESULT") {
    if (!sender.tab?.url?.startsWith(WORDLE_PREFIX) || message.gameId !== "wordle") return;
    const parsed = globalThis.GauntletdleWordle.parse(message.text);
    if (!parsed) return;
    chrome.storage.local.set({ [CAPTURE_KEY]: { ...parsed, capturedAt: Date.now() } });
    return;
  }
  if (message?.type === "WORDLE_COMPLETION_CANDIDATE") {
    if (!sender.tab?.url?.startsWith(WORDLE_PREFIX)) return;
    chrome.storage.local.set({ wordleCandidate: { detectedAt: Date.now(), tabId: sender.tab.id, source: "dom" } });
  }
});
