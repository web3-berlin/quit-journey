import { generateId } from "document-model";
import { actions, type CravingTrigger } from "document-models/quit-journey";
import { useEffect, useState } from "react";
import { entries, TRIGGER_LABELS } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { Scale, Select } from "./ui.js";

/** Guided urge surfing (mindfulness-based relapse prevention): notice, breathe, watch the wave pass. */
const STEPS = [
  { seconds: 30, text: "Notice where you feel the urge in your body — chest, throat, hands, stomach. Just notice." },
  { seconds: 45, text: "Breathe slowly into that place. You don't have to act on it or fight it." },
  { seconds: 60, text: "Picture the urge as a wave. Watch it rise. Every wave peaks and falls." },
  { seconds: 60, text: "Stay on the board. Describe it to yourself: tight, warm, buzzing, heavy?" },
  { seconds: 45, text: "Notice how it's changed since you started. Waves pass — this one is passing." },
];

export function UrgeSurfing({ dispatch, onDone }: { dispatch: Dispatch; onDone: () => void }) {
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<CravingTrigger | "">("");
  const [step, setStep] = useState(-1);
  const [stepStart, setStepStart] = useState(0);
  const [now, setNow] = useState(0);
  const running = step >= 0 && step < STEPS.length;
  const left = running ? Math.max(0, Math.ceil((stepStart + STEPS[step].seconds * 1000 - now) / 1000)) : 0;

  function goTo(next: number) {
    const t = Date.now();
    setStep(next);
    setStepStart(t);
    setNow(t);
  }

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && left === 0) goTo(step + 1);
  }, [running, left, step]);

  function save() {
    if (before === null || after === null || !trigger) return;
    dispatch(actions.logCraving({
      id: generateId(), timestamp: new Date().toISOString(), intensity: before, intensityAfter: after, trigger,
      strategy: "URGE_SURFING", outcome: "RESISTED", durationMinutes: Math.round(STEPS.reduce((s, x) => s + x.seconds, 0) / 60), note: null,
    }));
    onDone();
  }

  if (step < 0) {
    return (
      <div className="stack">
        <Scale label="How strong is the urge right now?" value={before} onChange={setBefore} low="mild" high="overwhelming" />
        <button type="button" className="btn" disabled={before === null} onClick={() => goTo(0)}>Start surfing (4 min)</button>
      </div>
    );
  }
  if (step < STEPS.length) {
    return (
      <div className="stack" aria-live="polite">
        <p className="muted">Step {step + 1} of {STEPS.length}, {left}s left</p>
        <p style={{ fontSize: "1.25rem", fontFamily: "var(--display)" }}>{STEPS[step].text}</p>
        <button type="button" className="btn ghost small" onClick={() => goTo(step + 1)}>Next</button>
      </div>
    );
  }
  return (
    <div className="stack">
      <Scale label="And now?" value={after} onChange={setAfter} low="mild" high="overwhelming" />
      {before !== null && after !== null && after < before && <p className="soft">It dropped from {before} to {after}. You rode the wave.</p>}
      <label className="field"><span>What set it off?</span><Select value={trigger} options={entries(TRIGGER_LABELS)} onChange={setTrigger} allowEmpty="Choose a trigger" /></label>
      <button type="button" className="btn" disabled={after === null || !trigger} onClick={save}>Log it</button>
    </div>
  );
}
