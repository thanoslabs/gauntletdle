import { describe, expect, it } from "vitest";
import { normalizeSelection, nextGame } from "./games";
describe("gauntlet selection", () => {
  it("filters unknown and duplicate game IDs", () => expect(normalizeSelection(["wordle", "unknown", "wordle", "murdle"])).toEqual(["wordle", "murdle"]));
  it("advances in selected order", () => expect(nextGame(["murdle", "wordle"], 0)).toBe("wordle"));
  it("ends without wrapping", () => expect(nextGame(["wordle"], 0)).toBeUndefined());
});
