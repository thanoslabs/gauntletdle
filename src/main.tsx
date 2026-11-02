import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { requestExtension } from "./extension";

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
  const [extensionStatus, setExtensionStatus] = useState("Not checked");
  const [candidate, setCandidate] = useState(false);
  const [confirmNext, setConfirmNext] = useState(false);
  const checkExtension = async () => {
    const ping = await requestExtension("PING");
    setExtensionStatus(ping.ok ? "Connected" : "Not installed or unavailable");
    if (ping.ok) {
      const status = await requestExtension("GET_WORDLE_CANDIDATE");
      setCandidate(Boolean(status.ok && status.candidate));
    }
  };
  const launchWordle = async () => {
    const result = await requestExtension("OPEN_WORDLE");
    if (!result.ok) window.open(games[0].url, "_blank", "noopener,noreferrer");
  };
  const update = (id: string, status: Status, result?: string) => {
    const next = { ...progress, [id]: status }; setProgress(next); localStorage.setItem(key(), JSON.stringify(next));
    if (result !== undefined) { const updated = { ...results, [id]: result }; setResults(updated); localStorage.setItem(key() + ":results", JSON.stringify(updated)); }
  };
  const share = () => "⚔️ Gauntletdle " + today() + "\n" + games.map(g => g.name + ": " + (progress[g.id] === "complete" ? results[g.id] || "Completed (no score)" : "N/A")).join("\n");
  return <main><header><h1>⚔️ Gauntletdle</h1><p>Your daily puzzle gauntlet · {today()}</p></header>
    <section><h2>Chrome companion</h2><p>{extensionStatus}</p><button onClick={checkExtension}>Check extension / refresh completion</button>{candidate && <p>Possible Wordle completion detected. Paste your share result below to verify it.</p>}</section>
    {games.map(game => <section key={game.id}><h2>{game.name}</h2><p>Status: {progress[game.id] || "pending"}</p>
      <button onClick={launchWordle}>Open original game ↗</button>
      <p><label htmlFor={game.id}>Paste the game's share result</label></p>
      <textarea id={game.id} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Paste share text here" />
      <div className="actions"><button onClick={() => { update(game.id, "complete", draft.trim()); setDraft(""); setConfirmNext(true); }}>Save result · Next game</button>
      <button onClick={() => update(game.id, "skipped")}>Skip</button></div>
    </section>)}
    {confirmNext && <section role="dialog" aria-label="Next Game confirmation"><h2>Result saved</h2><p>Ready for the next game? You decide when to advance.</p><button onClick={() => setConfirmNext(false)}>Confirm · Next game</button></section>}
    <section><h2>Combined results</h2><pre>{share()}</pre><button onClick={() => navigator.clipboard.writeText(share())}>Copy results</button></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
