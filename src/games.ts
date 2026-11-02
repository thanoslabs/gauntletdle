import type { GameDefinition } from "./game-contract";
export const games: GameDefinition[] = [
  { id: "wordle", name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", capture: ["manual", "share", "extension"], parser: "wordle", adapter: "wordle" },
  { id: "murdle", name: "Murdle", url: "https://murdle.com/", capture: ["manual"] },
  { id: "krillion", name: "Krillion", url: "https://krillion.io/", capture: ["manual"] },
];
export function normalizeSelection(ids: string[]): string[] {
  const known = new Set(games.map(game => game.id));
  return [...new Set(ids)].filter(id => known.has(id));
}
export function nextGame(ids: string[], index: number): string | undefined {
  return ids[index + 1];
}
