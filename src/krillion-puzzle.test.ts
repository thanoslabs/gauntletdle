import { describe, expect, it } from "vitest";
import { normalizeAnswer, scoreKrillionAnswer, validateKrillionPuzzle } from "./krillion-puzzle";
const round = { prompt: "Name a fruit", answers: [{ text: "Dragon fruit", points: 85, aliases: ["pitaya"] }, { text: "Apple", points: 10 }] };
const puzzle = { schemaVersion: 1, gameId: "krillion", date: "2026-11-03", source: "original", rounds: Array.from({ length: 7 }, () => round) };
describe("Krillion playable schema", () => {
  it("accepts seven complete rounds", () => expect(validateKrillionPuzzle(puzzle, puzzle.date)).not.toBeNull());
  it("rejects incomplete round data", () => expect(validateKrillionPuzzle({ ...puzzle, rounds: [round] }, puzzle.date)).toBeNull());
  it("rejects duplicate aliases", () => expect(validateKrillionPuzzle({ ...puzzle, rounds: [{ ...round, answers: [{ text: "Apple", points: 10, aliases: ["apple"] }] }, ...puzzle.rounds.slice(1)] }, puzzle.date)).toBeNull());
  it("normalizes punctuation and scores aliases", () => { expect(normalizeAnswer("  DRAGON--fruit! ")).toBe("dragon fruit"); expect(scoreKrillionAnswer(round, "PITAYA")).toBe(85); expect(scoreKrillionAnswer(round, "unknown")).toBe(0); });
});
