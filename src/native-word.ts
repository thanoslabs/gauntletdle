// Original daily word puzzles; no NYT puzzle content is redistributed.
export const ANSWERS = ["CRANE", "PLANT", "SHORE", "BRICK", "CLOUD", "FLAME", "TRAIL", "STONE", "GRAPE", "LIGHT", "BLOOM", "RIVER", "SHEEP", "MANGO", "DREAM", "FROST", "OCEAN", "SPARK", "WHEAT", "NIGHT"];
export type Tile = "correct" | "present" | "absent";
export function answerForDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + "T00:00:00Z"))) throw new Error("Invalid date");
  const day = Math.floor(Date.parse(date + "T00:00:00Z") / 86400000);
  return ANSWERS[((day % ANSWERS.length) + ANSWERS.length) % ANSWERS.length];
}
export function scoreGuess(guess: string, answer: string): Tile[] {
  if (!/^[A-Z]{5}$/.test(guess) || !/^[A-Z]{5}$/.test(answer)) throw new Error("Expected five letters");
  const result: Tile[] = Array(5).fill("absent");
  const remaining = new Map<string, number>();
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = "correct";
    else remaining.set(answer[i], (remaining.get(answer[i]) || 0) + 1);
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const count = remaining.get(guess[i]) || 0;
    if (count > 0) { result[i] = "present"; remaining.set(guess[i], count - 1); }
  }
  return result;
}
