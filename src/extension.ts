export type ExtensionResponse = { ok: boolean; candidate?: { detectedAt: number; source: string } | null; error?: string };
const allowed = new Set(["PING", "OPEN_WORDLE", "GET_WORDLE_CANDIDATE"]);
export function requestExtension(type: "PING" | "OPEN_WORDLE" | "GET_WORDLE_CANDIDATE", timeoutMs = 1500): Promise<ExtensionResponse> {
  if (!allowed.has(type)) return Promise.resolve({ ok: false, error: "invalid_command" });
  const requestId = crypto.randomUUID();
  return new Promise(resolve => {
    let finished = false;
    const finish = (response: ExtensionResponse) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(response);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== location.origin) return;
      const data = event.data;
      if (data?.channel !== "gauntletdle:extension" || data.requestId !== requestId || data.type !== type) return;
      finish(data.response?.ok === true ? data.response : { ok: false, error: "extension_error" });
    };
    const timer = window.setTimeout(() => finish({ ok: false, error: "extension_unavailable" }), timeoutMs);
    window.addEventListener("message", onMessage);
    window.postMessage({ channel: "gauntletdle:web", requestId, type }, location.origin);
  });
}
