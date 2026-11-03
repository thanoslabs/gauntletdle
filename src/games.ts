import type { GameDefinition } from "./game-contract";
export const games: GameDefinition[] = [
  { id: "daily-word", name: "Daily Word (original)", url: "https://thanoslabs.github.io/gauntletdle/", capture: ["manual"] },
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
