import { describe, expect, it } from "vitest";
import { answerForDate, scoreGuess } from "./native-word";
describe("native daily word puzzle", () => {
  it("is deterministic", () => expect(answerForDate("2026-11-02")).toBe(answerForDate("2026-11-02")));
  it("handles duplicate letters without overcounting", () => expect(scoreGuess("ALLEY", "PLANT")).toEqual(["present", "correct", "absent", "absent", "absent"]));
  it("marks exact matches", () => expect(scoreGuess("CRANE", "CRANE")).toEqual(Array(5).fill("correct")));
  it("rejects malformed guesses", () => expect(() => scoreGuess("A", "CRANE")).toThrow());
});
