// MAIN-world hook: observe only text Wordle itself asks the browser to copy.
// Preserve the native Clipboard API's return value and failure behavior.
(() => {
  const clipboard = navigator.clipboard;
  if (!clipboard || typeof clipboard.writeText !== "function") return;
  const original = clipboard.writeText.bind(clipboard);
  try {
    clipboard.writeText = async text => {
      const result = await original(text);
      if (typeof text === "string" && text.length <= 10000 && /(?:^|\n)Wordle\s+[\d,.]+\s+[1-6X]\/6(?:\s|$)/i.test(text)) {
        window.postMessage({ channel: "gauntletdle:wordle-share", text }, location.origin);
      }
      return result;
    };
  } catch {
    // Some browsers expose a non-writable Clipboard method; manual paste remains available.
  }
})();
