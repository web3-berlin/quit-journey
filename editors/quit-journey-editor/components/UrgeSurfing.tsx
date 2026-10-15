import { generateId } from "document-model";
import { actions, type CravingTrigger } from "document-models/quit-journey";
import { useEffect, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useLabels } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { Scale, Select } from "./ui.js";

/** Guided urge surfing (mindfulness-based relapse prevention): notice, breathe, watch the wave pass. */
const STEP_TEXT = defineMessages({
  notice: { id: "surf.step.notice", defaultMessage: "Notice where you feel the urge in your body — chest, throat, hands, stomach. Just notice." },
  breathe: { id: "surf.step.breathe", defaultMessage: "Breathe slowly into that place. You don't have to act on it or fight it." },
  wave: { id: "surf.step.wave", defaultMessage: "Picture the urge as a wave. Watch it rise. Every wave peaks and falls." },
  board: { id: "surf.step.board", defaultMessage: "Stay on the board. Describe it to yourself: tight, warm, buzzing, heavy?" },
  passing: { id: "surf.step.passing", defaultMessage: "Notice how it's changed since you started. Waves pass — this one is passing." },
});
const STEPS = [
  { seconds: 30, text: STEP_TEXT.notice },
  { seconds: 45, text: STEP_TEXT.breathe },
  { seconds: 60, text: STEP_TEXT.wave },
  { seconds: 60, text: STEP_TEXT.board },
  { seconds: 45, text: STEP_TEXT.passing },
];

export function UrgeSurfing({ dispatch, onDone }: { dispatch: Dispatch; onDone: () => void }) {
  const intl = useIntl();
  const L = useLabels();
  const low = intl.formatMessage({ id: "surf.intensity.low", defaultMessage: "mild" });
  const high = intl.formatMessage({ id: "surf.intensity.high", defaultMessage: "overwhelming" });
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
        <Scale label={intl.formatMessage({ id: "surf.before.label", defaultMessage: "How strong is the urge right now?" })} value={before} onChange={setBefore} low={low} high={high} />
        <button type="button" className="btn" disabled={before === null} onClick={() => goTo(0)}>{intl.formatMessage({ id: "surf.start", defaultMessage: "Start surfing (4 min)" })}</button>
      </div>
    );
  }
  if (step < STEPS.length) {
    return (
      <div className="stack" aria-live="polite">
        <p className="muted">{intl.formatMessage({ id: "surf.progress", defaultMessage: "Step {step} of {total}, {seconds}s left" }, { step: step + 1, total: STEPS.length, seconds: left })}</p>
        <p style={{ fontSize: "1.25rem", fontFamily: "var(--display)" }}>{intl.formatMessage(STEPS[step].text)}</p>
        <button type="button" className="btn ghost small" onClick={() => goTo(step + 1)}>{intl.formatMessage({ id: "common.next", defaultMessage: "Next" })}</button>
      </div>
    );
  }
  return (
    <div className="stack">
      <Scale label={intl.formatMessage({ id: "surf.after.label", defaultMessage: "And now?" })} value={after} onChange={setAfter} low={low} high={high} />
      {before !== null && after !== null && after < before && <p className="soft">{intl.formatMessage({ id: "surf.dropped", defaultMessage: "It dropped from {before} to {after}. You rode the wave." }, { before, after })}</p>}
      <label className="field"><span>{intl.formatMessage({ id: "surf.trigger.label", defaultMessage: "What set it off?" })}</span><Select value={trigger} options={L.options("trigger")} onChange={setTrigger} allowEmpty={intl.formatMessage({ id: "surf.trigger.empty", defaultMessage: "Choose a trigger" })} /></label>
      <button type="button" className="btn" disabled={after === null || !trigger} onClick={save}>{intl.formatMessage({ id: "surf.save", defaultMessage: "Log it" })}</button>
    </div>
  );
}
