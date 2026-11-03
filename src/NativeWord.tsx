import { useEffect, useRef, useState } from "react";
import { loadWordPuzzle } from "./daily-puzzle";
import { answerForDate, scoreGuess } from "./native-word";

const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
type Mark = "correct" | "present" | "absent";
const rank: Record<Mark, number> = { absent: 1, present: 2, correct: 3 };
const emoji: Record<Mark, string> = { correct: "🟩", present: "🟨", absent: "⬛" };

export function NativeWord({ date, onComplete }: { date: string; onComplete: (summary: string) => void }) {
  const [fileAnswer, setFileAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  const key = "gauntletdle:native-word:" + date;
  const [guesses, setGuesses] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.filter((g: unknown) => typeof g === "string" && /^[A-Z]{5}$/.test(g)).slice(0, 6) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadWordPuzzle(date).then(puzzle => {
      if (active) { setFileAnswer(puzzle?.puzzle.answer || null); setLoading(false); }
    });
    return () => { active = false; };
  }, [date]);

  const answer = fileAnswer || answerForDate(date);
  const won = guesses.includes(answer);
  const finished = won || guesses.length >= 6;
  const marks: Record<string, Mark> = {};
  for (const guess of guesses) {
    scoreGuess(guess, answer).forEach((mark, i) => {
      if (!marks[guess[i]] || rank[mark] > rank[marks[guess[i]]]) marks[guess[i]] = mark;
    });
  }

  const submit = () => {
    if (loading || finished) return;
    if (input.length !== 5) { setError("Not enough letters"); return; }
    const next = [...guesses, input];
    setGuesses(next);
    localStorage.setItem(key, JSON.stringify(next));
    setInput("");
    setError("");
    if (input === answer || next.length === 6) onComplete(input === answer ? next.length + "/6" : "X/6");
  };
  const press = (keyName: string) => {
    if (loading || finished) return;
    setError("");
    if (keyName === "ENTER") { submit(); return; }
    if (keyName === "BACKSPACE") { setInput(value => value.slice(0, -1)); return; }
    if (/^[A-Z]$/.test(keyName)) setInput(value => (value + keyName).slice(0, 5));
  };
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches("input, textarea, select") || target.isContentEditable)) return;
      const keyName = event.key === "Enter" ? "ENTER" : event.key === "Backspace" ? "BACKSPACE" : event.key.toUpperCase();
      if (keyName === "ENTER" || keyName === "BACKSPACE" || /^[A-Z]$/.test(keyName)) {
        event.preventDefault();
        press(keyName);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  return <div className="native-word" ref={boardRef} aria-label="Daily Word puzzle">
    <p className="word-subtitle">Five letters · Six tries · {date}</p>
    <div className="word-grid" role="grid" aria-label="Guess grid">
      {Array.from({ length: 6 }, (_, row) => <div className="word-row" role="row" key={row}>
        {Array.from({ length: 5 }, (_, col) => {
          const letter = guesses[row]?.[col] || (row === guesses.length && !finished ? input[col] : "") || "";
          const mark = guesses[row] ? scoreGuess(guesses[row], answer)[col] : "";
          return <span role="gridcell" key={col} className={"word-tile " + mark + (letter && !mark ? " filled" : "")} aria-label={letter ? letter + (mark ? " " + mark : "") : "empty"}>{letter}</span>;
        })}
      </div>)}
    </div>
    <div className="word-message" role="status" aria-live="polite">
      {loading ? "Loading puzzle…" : error || (finished ? won ? "Brilliant! Solved in " + (guesses.indexOf(answer) + 1) + "/6" : "Out of guesses · " + answer : "Type a word to begin")}
    </div>
    <div className="word-keyboard" aria-label="On-screen keyboard">
      {rows.map((row, i) => <div className="word-key-row" key={row}>
        {i === 2 && <button type="button" className="word-key wide" onClick={() => press("ENTER")} disabled={loading || finished}>Enter</button>}
        {row.split("").map(letter => <button type="button" key={letter} className={"word-key " + (marks[letter] || "")} onClick={() => press(letter)} disabled={loading || finished} aria-label={letter}>{letter}</button>)}
        {i === 2 && <button type="button" className="word-key wide" onClick={() => press("BACKSPACE")} disabled={loading || finished} aria-label="Backspace">⌫</button>}
      </div>)}
    </div>
    {finished && <p className="word-share">Your grid: {guesses.map(g => scoreGuess(g, answer).map(t => emoji[t]).join("")).join(" / ")}</p>}
  </div>;
}
