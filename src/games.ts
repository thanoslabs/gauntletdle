export type Game = { id: string; name: string; url: string; extensionSupported: boolean };
export const games: Game[] = [
  { id: "wordle", name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", extensionSupported: true },
  { id: "murdle", name: "Murdle", url: "https://murdle.com/", extensionSupported: false },
  { id: "krillion", name: "Krillion", url: "https://krillion.io/", extensionSupported: false },
];
export function normalizeSelection(ids: string[]): string[] {
  const known = new Set(games.map(game => game.id));
  return [...new Set(ids)].filter(id => known.has(id));
}
export function nextGame(ids: string[], index: number): string | undefined {
  return ids[index + 1];
}
