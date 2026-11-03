import { describe, expect, it } from "vitest";
import { isGauntletFinished, nextGauntletIndex } from "./gauntlet-state";
describe("gauntlet completion", () => {
  it("does not mark an empty selection finished", () => expect(isGauntletFinished(0, [])).toBe(false));
  it("advances to the terminal index", () => {
    const ids = ["wordle", "murdle"];
    expect(nextGauntletIndex(0, ids)).toBe(1);
    expect(nextGauntletIndex(1, ids)).toBe(2);
    expect(isGauntletFinished(2, ids)).toBe(true);
  });
  it("does not advance beyond the end", () => expect(nextGauntletIndex(9, ["wordle"])).toBe(1));
});
