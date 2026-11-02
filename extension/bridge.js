// Injected only into the Gauntletdle origin by the extension manifest.
// The page never receives arbitrary chrome.runtime capabilities.
const allowed = new Set(["PING", "OPEN_WORDLE", "GET_WORDLE_CANDIDATE"]);
window.addEventListener("message", async event => {
  if (event.source !== window || event.origin !== location.origin) return;
  const data = event.data;
  if (data?.channel !== "gauntletdle:web" || !allowed.has(data.type) || typeof data.requestId !== "string" || data.requestId.length > 128) return;
  let response;
  try {
    if (data.type === "PING") response = { ok: true };
    else if (data.type === "OPEN_WORDLE") response = await chrome.runtime.sendMessage({ type: "OPEN_WORDLE" });
    else response = await chrome.runtime.sendMessage({ type: "GET_WORDLE_CANDIDATE" });
  } catch { response = { ok: false, error: "extension_unavailable" }; }
  window.postMessage({ channel: "gauntletdle:extension", requestId: data.requestId, type: data.type, response }, location.origin);
});
