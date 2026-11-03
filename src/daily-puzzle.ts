export type WordPuzzle = { schemaVersion: 1; gameId: "wordle"; date: string; puzzleId: string; source: "original" | "licensed" | "external"; puzzle: { answer: string; maxGuesses: 6 } };
export function validateWordPuzzle(data: unknown, date: string): WordPuzzle | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Partial<WordPuzzle>;
  if (value.schemaVersion !== 1 || value.gameId !== "wordle" || value.date !== date || typeof value.puzzleId !== "string" || !/^[a-z0-9-]+$/.test(value.puzzleId) || !["original", "licensed", "external"].includes(value.source || "")) return null;
  if (!value.puzzle || !/^[A-Z]{5}$/.test(value.puzzle.answer || "") || value.puzzle.maxGuesses !== 6) return null;
  return value as WordPuzzle;
}
export async function loadWordPuzzle(date: string): Promise<WordPuzzle | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    const response = await fetch(import.meta.env.BASE_URL + "games/wordle/daily/" + date + ".json");
    if (!response.ok) return null;
    return validateWordPuzzle(await response.json(), date);
  } catch { return null; }
}
