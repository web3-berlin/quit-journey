import { useEffect, useState } from "react";
import { formatMoney, pad2 } from "../lib/format.js";
import { STRATEGY_LABELS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CravingLogForm } from "./CravingLogForm.js";

/** 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. */
const PHASES = [
  { name: "Breathe in", seconds: 4, scale: 1.25 },
  { name: "Hold", seconds: 7, scale: 1.25 },
  { name: "Breathe out", seconds: 8, scale: 0.85 },
] as const;
const CYCLE = PHASES.reduce((s, p) => s + p.seconds, 0);

export function SosOverlay({ state, snapshot, dispatch, onClose }: TabProps & { onClose: () => void }) {
  const [startedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(() => Date.now());
  const [logging, setLogging] = useState(false);
  const target = snapshot.insights.typicalCravingMinutes * 60;

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const elapsed = Math.floor((tick - startedAt) / 1000);
  const left = Math.max(0, target - elapsed);
  let t = elapsed % CYCLE;
  let phase: (typeof PHASES)[number] = PHASES[0];
  for (const p of PHASES) {
    if (t < p.seconds) { phase = p; break; }
    t -= p.seconds;
  }
  const best = snapshot.insights.bestStrategy;
  const why = state.motivations.length ? state.motivations[Math.floor(elapsed / 12) % state.motivations.length] : null;
  const money = snapshot.money;

  return (
    <div className="sos" role="dialog" aria-modal="true" aria-label="Craving SOS">
      <div className="sheet stack">
        <div className="spread">
          <h2>Ride it out</h2>
          <button type="button" className="linkish" onClick={onClose}>Close</button>
        </div>
        {logging ? (
          <CravingLogForm dispatch={dispatch} now={Date.now()} initialStrategy="BREATHING" initialDurationMinutes={Math.max(1, Math.round(elapsed / 60))} onDone={onClose} />
        ) : (
          <>
            <div className="breath-stage"><div className="breath" style={{ transform: `scale(${phase.scale})`, transitionDuration: `${phase.seconds}s` }} aria-live="polite">
              {phase.name}
              <br />
              <span className="muted" style={{ fontSize: ".9rem" }}>{phase.seconds - t}s</span>
            </div></div>
            <p style={{ textAlign: "center", fontFamily: "var(--display)", fontSize: "1.4rem", fontWeight: 600 }}>
              {left > 0 ? `${Math.floor(left / 60)}:${pad2(left % 60)} — it's already fading` : "You made it through. That's a win."}
            </p>
            {why && <blockquote className="panel tint-leaf" style={{ margin: 0 }}><p className="soft">Remember why:</p><p style={{ fontSize: "1.15rem" }}>{why.text}</p></blockquote>}
            {best && <p>Your best move so far: <strong>{STRATEGY_LABELS[best].toLowerCase()}</strong>.</p>}
            {money && money.moneySaved > 0 && (
              <p className="soft">You've kept {formatMoney(money.moneySaved, money.currency)} out of the ashtray so far.</p>
            )}
            {(state.supportContacts.length > 0 || state.quitlinePhone) && (
              <div className="row">
                {state.supportContacts.filter((c) => c.phone).map((c) => (
                  <a key={c.id} className="btn ghost small" href={`tel:${c.phone}`}>Call {c.name}</a>
                ))}
                {state.quitlinePhone && <a className="btn ghost small" href={`tel:${state.quitlinePhone}`}>Call the quitline</a>}
              </div>
            )}
            <button type="button" className="btn" onClick={() => setLogging(true)}>{left > 0 ? "Log this craving" : "Log my win"}</button>
          </>
        )}
      </div>
    </div>
  );
}
