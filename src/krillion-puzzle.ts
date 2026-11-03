export type KrillionAnswer = { text: string; points: number; aliases?: string[] };
export type KrillionRound = { prompt: string; answers: KrillionAnswer[] };
export type KrillionPuzzle = {
  schemaVersion: 1;
  gameId: "krillion";
  date: string;
  source: "original" | "licensed" | "external";
  rounds: KrillionRound[];
};
export function normalizeAnswer(text: string): string {
  return text.normalize("NFKC").toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
export function validateKrillionPuzzle(input: unknown, date: string): KrillionPuzzle | null {
  if (!input || typeof input !== "object") return null;
  const p = input as Partial<KrillionPuzzle>;
  if (p.schemaVersion !== 1 || p.gameId !== "krillion" || p.date !== date ||
      !["original", "licensed", "external"].includes(p.source || "") ||
      !Array.isArray(p.rounds) || p.rounds.length !== 7) return null;
  for (const round of p.rounds) {
    if (!round || typeof round.prompt !== "string" || !round.prompt.trim() ||
        !Array.isArray(round.answers) || !round.answers.length) return null;
    const seen = new Set<string>();
    for (const answer of round.answers) {
      if (!answer || typeof answer.text !== "string" || !normalizeAnswer(answer.text) ||
          ![10, 15, 30, 60, 85, 100].includes(answer.points) ||
          (answer.aliases !== undefined && (!Array.isArray(answer.aliases) || !answer.aliases.every(a => typeof a === "string")))) return null;
      for (const value of [answer.text, ...(answer.aliases || [])]) {
        const normalized = normalizeAnswer(value);
        if (!normalized || seen.has(normalized)) return null;
        seen.add(normalized);
      }
    }
  }
  return p as KrillionPuzzle;
}
export function scoreKrillionAnswer(round: KrillionRound, guess: string): number {
  const normalized = normalizeAnswer(guess);
  if (!normalized) return 0;
  return round.answers.find(a => [a.text, ...(a.aliases || [])].some(v => normalizeAnswer(v) === normalized))?.points || 0;
}
export async function loadKrillionPuzzle(date: string): Promise<KrillionPuzzle | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    const response = await fetch(import.meta.env.BASE_URL + "games/krillion/playable/" + date + ".json");
    return response.ok ? validateKrillionPuzzle(await response.json(), date) : null;
  } catch { return null; }
}
