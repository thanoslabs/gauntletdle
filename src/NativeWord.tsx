import { useState } from "react";
import { answerForDate, scoreGuess } from "./native-word";
const emoji = { correct: "🟩", present: "🟨", absent: "⬛" };
export function NativeWord({ date, onComplete }: { date: string; onComplete: (summary: string) => void }) {
  const answer = answerForDate(date);
  const key = "gauntletdle:native-word:" + date;
  const [guesses, setGuesses] = useState<string[]>(() => {
    try { const data = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(data) ? data.filter((g: unknown) => typeof g === "string" && /^[A-Z]{5}$/.test(g)).slice(0, 6) : []; }
    catch { return []; }
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const won = guesses.includes(answer);
  const finished = won || guesses.length >= 6;
  const submit = () => {
    const guess = input.toUpperCase().trim();
    if (!/^[A-Z]{5}$/.test(guess)) { setError("Enter a five-letter word."); return; }
    if (finished) return;
    const next = [...guesses, guess];
    setGuesses(next); localStorage.setItem(key, JSON.stringify(next)); setInput(""); setError("");
    if (guess === answer || next.length === 6) onComplete(guess === answer ? String(next.length) + "/6" : "X/6");
  };
  return <div className="native-word">
    <p>Original daily five-letter puzzle · {date}</p>
    <div className="word-grid" aria-label="Word puzzle guesses">
      {Array.from({ length: 6 }, (_, row) => <div className="word-row" key={row}>
        {Array.from({ length: 5 }, (_, col) => {
          const letter = guesses[row]?.[col] || "";
          const tile = guesses[row] ? scoreGuess(guesses[row], answer)[col] : undefined;
          return <span key={col} className={"word-tile " + (tile || "")} aria-label={letter ? letter + " " + tile : "empty"}>{letter}</span>;
        })}
      </div>)}
    </div>
    {finished ? <p role="status">{won ? "Solved!" : "No guesses left."} Result: {won ? guesses.indexOf(answer) + 1 : "X"}/6</p> : <form onSubmit={event => { event.preventDefault(); submit(); }}>
      <label htmlFor="native-guess">Your guess</label>
      <input id="native-guess" autoComplete="off" autoCapitalize="characters" maxLength={5} value={input} onChange={event => setInput(event.target.value.replace(/[^a-z]/gi, "").slice(0, 5))} />
      <button type="submit">Guess</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    <p aria-label="Legend">🟩 Correct position · 🟨 Wrong position · ⬛ Not in word</p>
    {finished && <p>Share grid: {guesses.map(g => scoreGuess(g, answer).map(t => emoji[t]).join("")).join(" / ")}</p>}
  </div>;
}
