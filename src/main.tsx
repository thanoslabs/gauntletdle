import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { requestExtension } from "./extension";
import { games, normalizeSelection } from "./games";
import { parseResult } from "./game-parsers";
import { NativeWord } from "./NativeWord";
import { isGauntletFinished, nextGauntletIndex } from "./gauntlet-state";
import "./style.css";

type Status = "pending" | "skipped" | "complete";
type Progress = Record<string, Status>;
const today = () => new Date().toLocaleDateString("en-CA");
const dailyKey = () => "gauntletdle:progress:" + today();
function load<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; }
  catch { return fallback; }
}
function App() {
  const [selected, setSelected] = useState<string[]>(() => normalizeSelection(load("gauntletdle:games", ["daily-word"])));
  const [progress, setProgress] = useState<Progress>(() => load(dailyKey(), {}));
  const [results, setResults] = useState<Record<string, string>>(() => load(dailyKey() + ":results", {}));
  const [index, setIndex] = useState(() => load("gauntletdle:index:" + today(), 0));
  const [screen, setScreen] = useState<"welcome" | "configure" | "play">("welcome");
  const [draft, setDraft] = useState("");
  const [resultError, setResultError] = useState("");
  const [confirmNext, setConfirmNext] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState("Not checked");
  const [captured, setCaptured] = useState<{ gameId: string; raw: string; summary: string; capturedAt: number } | null>(null);
  const activeIndex = Math.min(Math.max(0, index), Math.max(0, selected.length - 1));
  const finished = isGauntletFinished(index, selected);
  const game = finished ? undefined : games.find(g => g.id === selected[activeIndex]);
  const toggle = (id: string) => {
    const updated = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    setSelected(updated); localStorage.setItem("gauntletdle:games", JSON.stringify(updated));
    setIndex(0); localStorage.setItem("gauntletdle:index:" + today(), "0");
    setConfirmNext(false); setCaptured(null);
  };
  const move = (id: string, delta: number) => {
    const position = selected.indexOf(id), destination = position + delta;
    if (destination < 0 || destination >= selected.length) return;
    const updated = [...selected]; [updated[position], updated[destination]] = [updated[destination], updated[position]];
    setSelected(updated); localStorage.setItem("gauntletdle:games", JSON.stringify(updated));
    setIndex(0); localStorage.setItem("gauntletdle:index:" + today(), "0");
    setConfirmNext(false); setCaptured(null);
  };
  const update = (id: string, status: Status, result?: string) => {
    const updated = { ...progress, [id]: status }; setProgress(updated); localStorage.setItem(dailyKey(), JSON.stringify(updated));
    if (result !== undefined) {
      const nextResults = { ...results, [id]: result }; setResults(nextResults);
      localStorage.setItem(dailyKey() + ":results", JSON.stringify(nextResults));
    }
    setConfirmNext(true);
  };
  const saveResult = () => {
    if (!game) return;
    const parsed = parseResult(game, draft);
    if (game.parser && !parsed) {
      setResultError("This does not look like a valid " + game.name + " share result. Paste the copied share text, or use manual completion.");
      return;
    }
    if (!game.parser && !draft.trim()) {
      setResultError("Paste a result or choose manual completion.");
      return;
    }
    setResultError("");
    update(game.id, "complete", parsed?.summary || draft.trim());
  };
  const refreshCapture = async () => {
    const response = await requestExtension("GET_CAPTURED_RESULT");
    const result = response.result;
    if (response.ok && result && result.gameId === game?.id && progress[result.gameId] !== "complete" && progress[result.gameId] !== "skipped" && new Date(result.capturedAt).toLocaleDateString("en-CA") === today()) {
      setCaptured(result);
    } else setCaptured(null);
  };
  const advance = () => {
    setConfirmNext(false); setDraft(""); setCaptured(null); setResultError("");
    const next = nextGauntletIndex(activeIndex, selected);
    setIndex(next); localStorage.setItem("gauntletdle:index:" + today(), String(next));
  };
  const checkExtension = async () => {
    const ping = await requestExtension("PING");
    setExtensionStatus(ping.ok ? "Connected" : "Not installed or unavailable");
  };
  const launch = () => {
    if (game) window.open(game.url, "_blank", "noopener,noreferrer");
  };
  const share = () => "⚔️ Gauntletdle " + today() + "\n" + selected.map(id => {
    const item = games.find(g => g.id === id)!;
    return item.name + ": " + (progress[id] === "complete" ? results[id] || "Completed (no score)" : "N/A");
  }).join("\n");
  return <main>
    <header className="app-header"><button className="brand-button" onClick={() => setScreen("welcome")}>⚔️ Gauntletdle</button><span>{today()}</span></header>
    {screen === "welcome" && <section className="welcome-screen">
      <div className="welcome-symbol" aria-hidden="true">⚔️</div>
      <h1>Your daily puzzle gauntlet.</h1>
      <p>One challenge at a time. Your favorite daily games, together.</p>
      <div className="welcome-actions">
        <button className="primary-cta" onClick={() => setScreen("play")}>Start playing →</button>
        <button className="secondary-cta" onClick={() => setScreen("configure")}>Configure games</button>
      </div>
      <p className="welcome-count">{selected.length} {selected.length === 1 ? "game" : "games"} in your gauntlet</p>
    </section>}
    {screen === "configure" && <>
      <div className="screen-heading"><h1>Choose your games</h1><button onClick={() => setScreen("welcome")}>← Back</button></div>
    <section><h2>Your gauntlet</h2><p>Select games and arrange their order.</p>
      {games.map(item => <div key={item.id} className="actions">
        <label><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /> {item.name}</label>
        {selected.includes(item.id) && <><button aria-label={"Move " + item.name + " up"} onClick={() => move(item.id, -1)}>↑</button><button aria-label={"Move " + item.name + " down"} onClick={() => move(item.id, 1)}>↓</button></>}
      </div>)}
    </section>
      <div className="actions"><button onClick={() => setScreen("play")} disabled={!selected.length}>Start playing →</button><button onClick={() => setScreen("welcome")}>Done</button></div>
    </>}
    {screen === "play" && <>
      <div className="screen-heading"><h1>Daily gauntlet</h1><button onClick={() => setScreen("welcome")}>← Home</button></div>
    <section><h2>Chrome companion</h2><p>{extensionStatus}</p><button onClick={checkExtension}>Check extension</button></section>
    {finished && <section role="status"><h2>Gauntlet complete!</h2><p>All selected games have been recorded or skipped. Your results are below.</p></section>}
    {game ? <section><h2>{activeIndex + 1} / {selected.length} · {game.name}</h2>
      <p>Status: {progress[game.id] || "pending"}</p>
      {game.id === "daily-word" ? <NativeWord date={today()} onComplete={summary => update(game.id, "complete", summary)} /> : <button onClick={launch}>Open original game ↗</button>}
      {game.capture.includes("extension") && <button onClick={refreshCapture}>Refresh captured result</button>}
      {captured && captured.gameId === game.id && !confirmNext && <div role="status"><p>Captured {game.name}: {captured.summary}. Review before saving.</p><button onClick={() => { update(game.id, "complete", captured.summary); setCaptured(null); }}>Accept captured result</button><button onClick={() => setCaptured(null)}>Ignore</button></div>}
      {game.id !== "daily-word" && <><p><label htmlFor="result">Paste the game's share result</label></p>
      <textarea id="result" value={draft} onChange={e => { setDraft(e.target.value); setResultError(""); }} placeholder="Paste share text here" />
      {resultError && <p role="alert">{resultError}</p>}
      {game.parser && draft.trim() && parseResult(game, draft) && <p>Detected result: {parseResult(game, draft)?.summary}</p>}
      <div className="actions"><button disabled={confirmNext} onClick={saveResult}>Save result</button><button disabled={confirmNext} onClick={() => { setResultError(""); update(game.id, "complete", "Completed (no score)"); }}>Manual completion</button></div></>}
      <button disabled={confirmNext} onClick={() => { setResultError(""); update(game.id, "skipped"); }}>Skip</button>
    </section> : !finished && <section><h2>No games selected</h2><p>Choose a game to start your gauntlet.</p></section>}
    {confirmNext && <section role="dialog" aria-label="Next Game confirmation"><h2>{activeIndex + 1 < selected.length ? "Ready for the next game?" : "Gauntlet complete"}</h2>
      <button onClick={advance}>{activeIndex + 1 < selected.length ? "Confirm · Next game" : "Finish"}</button>
    </section>}
    <section><h2>Combined results</h2><pre>{share()}</pre><button onClick={() => navigator.clipboard.writeText(share())}>Copy results</button></section>
    </>}
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
