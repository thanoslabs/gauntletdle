// Shared between extension content scripts and service worker.
// Only recognizable Wordle share text is eligible for capture.
globalThis.GauntletdleWordle = {
  parse(text) {
    if (typeof text !== "string" || text.length > 10000) return null;
    const match = text.match(/(?:^|\n)Wordle\s+([\d,.]+)\s+([1-6X])\/6(?:\s|$)/i);
    if (!match) return null;
    return { gameId: "wordle", puzzleId: match[1], summary: match[2] + "/6", raw: text.trim() };
  }
};
