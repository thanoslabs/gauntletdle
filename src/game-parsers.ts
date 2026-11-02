import type { GameDefinition, ParsedResult, ResultParser } from "./game-contract";
const wordle: ResultParser = (game, input) => {
  const match = input.match(/Wordle\s+([\d,.]+)\s+([1-6X])\/6/i);
  if (!match) return null;
  return { gameId: game.id, puzzleId: match[1], summary: match[2] + "/6", raw: input.trim() };
};
const parsers: Record<string, ResultParser> = { wordle };
export function parseResult(game: GameDefinition, input: string): ParsedResult | null {
  const value = input.trim();
  if (!value || value.length > 10000) return null;
  return game.parser ? parsers[game.parser]?.(game, value) ?? null : null;
}
