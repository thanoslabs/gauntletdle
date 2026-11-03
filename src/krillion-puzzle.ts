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
type RevealAnswer = { answer?: unknown; score?: unknown };
type RevealPrompt = { text?: unknown; answers?: unknown };
type RevealArchive = { schemaVersion?: unknown; gameId?: unknown; date?: unknown; source?: unknown; reveal?: { date?: unknown; prompts?: unknown } };

export function convertKrillionReveal(input: unknown, date: string): KrillionPuzzle | null {
  if (!input || typeof input !== "object") return null;
  const archive = input as RevealArchive;
  if (archive.schemaVersion !== 1 || archive.gameId !== "krillion" || archive.date !== date ||
      archive.reveal?.date !== date || !Array.isArray(archive.reveal.prompts) ||
      archive.reveal.prompts.length !== 7) return null;
  const rounds: KrillionRound[] = [];
  for (const raw of archive.reveal.prompts as RevealPrompt[]) {
    if (typeof raw.text !== "string" || !raw.text.trim() || !Array.isArray(raw.answers)) return null;
    const answers: KrillionAnswer[] = [];
    const seen = new Set<string>();
    for (const entry of raw.answers as RevealAnswer[]) {
      if (!entry || typeof entry.answer !== "string" || typeof entry.score !== "number" ||
          ![10, 15, 30, 60, 85, 100].includes(entry.score)) return null;
      const normalized = normalizeAnswer(entry.answer);
      if (!normalized) continue;
      // The upstream reveal may contain equivalent spelling/punctuation variants.
      // Keep the first occurrence instead of rejecting an otherwise valid archive.
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      answers.push({ text: entry.answer, points: entry.score });
    }
    if (!answers.length) return null;
    rounds.push({ prompt: raw.text, answers });
  }
  return validateKrillionPuzzle({ schemaVersion: 1, gameId: "krillion", date, source: "external", rounds }, date);
}
export async function loadKrillionPuzzle(date: string): Promise<KrillionPuzzle | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const base = import.meta.env.BASE_URL + "games/krillion/";
  for (const path of ["playable/", "daily/"]) {
    try {
      const response = await fetch(base + path + date + ".json");
      if (!response.ok) continue;
      const data: unknown = await response.json();
      const puzzle = validateKrillionPuzzle(data, date) || convertKrillionReveal(data, date);
      if (puzzle) return puzzle;
    } catch { /* Try the next supported format. */ }
  }
  return null;
}
