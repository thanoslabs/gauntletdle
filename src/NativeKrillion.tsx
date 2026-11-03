import { useEffect, useState } from "react";
import { loadKrillionPuzzle, scoreKrillionAnswer, type KrillionPuzzle } from "./krillion-puzzle";

type Saved = { round: number; scores: number[]; deadline: number | null };
const roundSeconds = 25;
export function NativeKrillion({ date, onComplete }: { date: string; onComplete: (summary: string) => void }) {
  const key = "gauntletdle:krillion:" + date;
  const [puzzle, setPuzzle] = useState<KrillionPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Saved>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "null") as Saved | null;
      if (data && Number.isInteger(data.round) && data.round >= 0 && data.round <= 7 &&
          Array.isArray(data.scores) && data.scores.length === data.round &&
          data.scores.every(n => typeof n === "number" && n >= 0 && n <= 100) &&
          (data.deadline === null || typeof data.deadline === "number")) return data;
    } catch { /* start fresh */ }
    return { round: 0, scores: [], deadline: null };
  });
  const [guess, setGuess] = useState("");
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    loadKrillionPuzzle(date).then(value => {
      if (active) { setPuzzle(value); setLoading(false); }
    });
    return () => { active = false; };
  }, [date]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  const finishRound = (points: number) => {
    if (saved.round >= 7) return;
    const next: Saved = { round: saved.round + 1, scores: [...saved.scores, points], deadline: null };
    setSaved(next);
    localStorage.setItem(key, JSON.stringify(next));
    setGuess("");
    setMessage(points ? "+" + points + " points" : "No points this round");
    if (next.round === 7) onComplete(next.scores.reduce((sum, n) => sum + n, 0) * 10 + "m / 7000m");
  };
  useEffect(() => {
    if (puzzle && saved.deadline !== null && saved.round < 7 && now >= saved.deadline) finishRound(0);
  });
  const begin = () => {
    const next = { ...saved, deadline: Date.now() + roundSeconds * 1000 };
    setSaved(next); localStorage.setItem(key, JSON.stringify(next)); setMessage("");
  };
  const submit = () => {
    if (!puzzle || saved.deadline === null || Date.now() >= saved.deadline) return;
    finishRound(scoreKrillionAnswer(puzzle.rounds[saved.round], guess));
  };
  const total = saved.scores.reduce((sum, n) => sum + n, 0) * 10;
  if (loading) return <p role="status">Loading today's Krillion puzzle…</p>;
  if (!puzzle) return <div className="krillion" role="status"><h3>Today's Krillion puzzle is unavailable</h3><p>We need a verified playable question and answer set for this date. You can still open the original game or record your result manually.</p><a href="https://krillion.io/" target="_blank" rel="noreferrer">Play Krillion ↗</a></div>;
  return <div className="krillion">
    <div className="krillion-stats"><span>Round {Math.min(saved.round + 1, 7)} / 7</span><strong>{total.toLocaleString()}m</strong></div>
    <div className="krillion-ocean" aria-label={total + " metres deep"}><div className="krillion-depth" style={{ width: (total / 7000 * 100) + "%" }} /></div>
    {saved.round === 7 ? <div role="status"><h3>Dive complete!</h3><p>You reached {total.toLocaleString()}m out of 7,000m.</p></div> : <>
      <h3>{puzzle.rounds[saved.round].prompt}</h3>
      {saved.deadline === null ? <button type="button" onClick={begin}>Start round · {roundSeconds}s</button> : <>
        <p className="krillion-clock" role="timer">{Math.max(0, Math.ceil((saved.deadline - now) / 1000))}s remaining</p>
        <form onSubmit={event => { event.preventDefault(); submit(); }}>
          <label htmlFor="krillion-answer">Your answer</label>
          <input id="krillion-answer" autoComplete="off" value={guess} onChange={e => setGuess(e.target.value)} maxLength={120} />
          <button type="submit" disabled={!guess.trim()}>Submit answer</button>
        </form>
      </>}
    </>}
    <p role="status">{message}</p>
    <div className="krillion-round-scores">{saved.scores.map((points, i) => <span key={i}>#{i + 1}: {points} pts</span>)}</div>
  </div>;
}
