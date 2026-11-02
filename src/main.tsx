import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Game = { id: string; name: string; url: string };
type Status = "pending" | "skipped" | "complete";
const games: Game[] = [
  { id: "wordle", name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html" },
];
const today = () => new Date().toLocaleDateString("en-CA");
const key = () => "gauntletdle:progress:" + today();
function App() {
  const [progress, setProgress] = useState<Record<string, Status>>(() => {
    try { return JSON.parse(localStorage.getItem(key()) || "{}"); } catch { return {}; }
  });
  const [results, setResults] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(key() + ":results") || "{}"); } catch { return {}; }
  });
  const [draft, setDraft] = useState("");
  const update = (id: string, status: Status, result?: string) => {
    const next = { ...progress, [id]: status }; setProgress(next); localStorage.setItem(key(), JSON.stringify(next));
    if (result !== undefined) { const updated = { ...results, [id]: result }; setResults(updated); localStorage.setItem(key() + ":results", JSON.stringify(updated)); }
  };
  const share = () => "⚔️ Gauntletdle " + today() + "\n" + games.map(g => g.name + ": " + (progress[g.id] === "complete" ? results[g.id] || "Completed (no score)" : "N/A")).join("\n");
  return <main><header><h1>⚔️ Gauntletdle</h1><p>Your daily puzzle gauntlet · {today()}</p></header>
    {games.map(game => <section key={game.id}><h2>{game.name}</h2><p>Status: {progress[game.id] || "pending"}</p>
      <a href={game.url} target="_blank" rel="noopener noreferrer">Open original game ↗</a>
      <p><label htmlFor={game.id}>Paste the game's share result</label></p>
      <textarea id={game.id} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Paste share text here" />
      <div className="actions"><button onClick={() => { update(game.id, "complete", draft.trim()); setDraft(""); }}>Save result · Next game</button>
      <button onClick={() => update(game.id, "skipped")}>Skip</button></div>
    </section>)}
    <section><h2>Combined results</h2><pre>{share()}</pre><button onClick={() => navigator.clipboard.writeText(share())}>Copy results</button></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
