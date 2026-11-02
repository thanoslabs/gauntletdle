export type CaptureMode = "manual" | "share" | "extension";
export type GameDefinition = {
  id: string;
  name: string;
  url: string;
  capture: readonly CaptureMode[];
  /** Optional game-specific parser ID. Never execute code from a remote manifest. */
  parser?: string;
  /** A game may launch without an extension adapter. */
  adapter?: string;
};
export type ParsedResult = {
  gameId: string;
  summary: string;
  raw: string;
  puzzleId?: string;
};
export type ResultParser = (game: GameDefinition, input: string) => ParsedResult | null;
export function validateGame(game: GameDefinition): boolean {
  if (!/^[a-z][a-z0-9-]*$/.test(game.id) || !game.name.trim()) return false;
  try { return new URL(game.url).protocol === "https:" && game.capture.includes("manual"); }
  catch { return false; }
}
