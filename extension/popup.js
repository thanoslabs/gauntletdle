document.getElementById("open").addEventListener("click", () => chrome.runtime.sendMessage({ type: "OPEN_WORDLE" }));
chrome.storage.local.get("wordleCandidate").then(({ wordleCandidate }) => {
  if (wordleCandidate) document.getElementById("status").textContent = "Possible Wordle completion detected. Confirm your result in Gauntletdle before advancing.";
});
