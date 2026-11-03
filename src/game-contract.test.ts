import { describe, expect, it } from "vitest";
import { validateGame } from "./game-contract";
import { parseResult } from "./game-parsers";
import { games } from "./games";
describe("game plugin contract", () => {
  it("validates catalog definitions", () => expect(games.every(validateGame)).toBe(true));
  it("parses a Wordle win", () => expect(parseResult({ ...games[0], parser: "wordle" }, "Wordle 1,234 4/6\n\n🟩🟩🟩🟩🟩")?.summary).toBe("4/6"));
  it("parses a Wordle loss", () => expect(parseResult(games[0], "Wordle 123 X/6")?.summary).toBe("X/6"));
  it("rejects unrelated text", () => expect(parseResult(games[0], "not a result")).toBeNull());
});
