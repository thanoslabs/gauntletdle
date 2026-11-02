// The copy event exposes text only when the page provides it via clipboardData.
// navigator.clipboard.writeText does not necessarily fire this event.
document.addEventListener("copy", event => {
  const text = event.clipboardData?.getData("text/plain");
  const parsed = globalThis.GauntletdleWordle.parse(text);
  if (!parsed) return;
  chrome.runtime.sendMessage({ type: "CAPTURE_SHARE_RESULT", gameId: "wordle", text: parsed.raw }).catch(() => {});
}, true);

window.addEventListener("message", event => {
  if (event.source !== window || event.origin !== location.origin) return;
  if (event.data?.channel !== "gauntletdle:wordle-share") return;
  const parsed = globalThis.GauntletdleWordle.parse(event.data.text);
  if (!parsed) return;
  chrome.runtime.sendMessage({ type: "CAPTURE_SHARE_RESULT", gameId: "wordle", text: parsed.raw }).catch(() => {});
});
