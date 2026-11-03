import { describe, expect, it } from "vitest";
import { normalizeSelection, nextGame } from "./games";
describe("gauntlet selection", () => {
  it("filters unknown and duplicate game IDs", () => expect(normalizeSelection(["daily-word", "unknown", "daily-word", "murdle"])).toEqual(["daily-word", "murdle"]));
  it("advances in selected order", () => expect(nextGame(["murdle", "daily-word"], 0)).toBe("daily-word"));
  it("ends without wrapping", () => expect(nextGame(["daily-word"], 0)).toBeUndefined());
});
