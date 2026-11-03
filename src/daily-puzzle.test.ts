import { describe, expect, it } from "vitest";
import { validateWordPuzzle } from "./daily-puzzle";
const valid = { schemaVersion: 1, gameId: "wordle", date: "2026-11-02", puzzleId: "wordle-demo-2026-11-02", source: "original", puzzle: { answer: "CRANE", maxGuesses: 6 } };
describe("daily puzzle files", () => {
  it("accepts valid puzzles", () => expect(validateWordPuzzle(valid, valid.date)).toEqual(valid));
  it("rejects a different date", () => expect(validateWordPuzzle(valid, "2026-11-03")).toBeNull());
  it("rejects invalid answers", () => expect(validateWordPuzzle({ ...valid, puzzle: { answer: "TOOLONG", maxGuesses: 6 } }, valid.date)).toBeNull());
});
