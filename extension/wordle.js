// Prototype only: observe a possible completion screen, never claim a verified score.
// Wordle changes its DOM over time; a stable, tested adapter is required before automatic results.
let seen = false;
const observer = new MutationObserver(() => {
  if (seen) return;
  const dialogs = [...document.querySelectorAll('[role="dialog"]')];
  const completion = dialogs.some(dialog => /statistics|share/i.test(dialog.textContent || ""));
  if (completion) {
    seen = true;
    chrome.runtime.sendMessage({ type: "WORDLE_COMPLETION_CANDIDATE" });
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
