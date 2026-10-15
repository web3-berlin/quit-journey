import { generateId } from "document-model";
import { actions, plansForTrigger, type CopingStrategy, type CravingOutcome, type CravingTrigger, type IfThenPlan, type SubstanceProfile } from "document-models/quit-journey";
import { useState } from "react";
import { entries, STRATEGY_LABELS, TRIGGER_LABELS } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { SafetyNotes } from "./SafetyNotes.js";
import { PlanCard } from "./toolkit/IfThenPlans.js";
import { Field, Scale, Select } from "./ui.js";

interface Props {
  dispatch: Dispatch;
  now: number;
  profile: SubstanceProfile;
  /** True when the goal is cutting down, so use is expected rather than a slip. */
  reducing: boolean;
  /** If-then plans; the one matching the chosen trigger is shown. */
  plans?: IfThenPlan[];
  /** Prefilled from the SOS screen. */
  initialStrategy?: CopingStrategy | null;
  initialDurationMinutes?: number | null;
  onDone: () => void;
}

export function CravingLogForm({ dispatch, now, profile, reducing, plans = [], initialStrategy, initialDurationMinutes, onDone }: Props) {
  const [intensity, setIntensity] = useState<number | null>(3);
  const [trigger, setTrigger] = useState<CravingTrigger | "">("");
  const [strategy, setStrategy] = useState<CopingStrategy | "">(initialStrategy ?? "");
  const [outcome, setOutcome] = useState<CravingOutcome>("RESISTED");
  const [units, setUnits] = useState("1");
  const [note, setNote] = useState("");

  function save() {
    if (intensity === null || !trigger) return;
    const timestamp = new Date(now).toISOString();
    dispatch(actions.logCraving({
      id: generateId(),
      timestamp,
      intensity,
      trigger,
      strategy: strategy || null,
      outcome,
      durationMinutes: initialDurationMinutes ?? null,
      note: note.trim() || null,
    }));
    if (outcome === "SMOKED") {
      dispatch(actions.logSlip({ id: generateId(), timestamp, units: Math.max(0.5, Number(units) || 1), trigger, note: note.trim() || null }));
    }
    onDone();
  }

  return (
    <div className="stack">
      <Scale label="How strong was it?" value={intensity} onChange={setIntensity} low="mild" high="overwhelming" />
      <div className="grid2">
        <Field label="What set it off?">
          <Select value={trigger} options={entries(TRIGGER_LABELS)} onChange={setTrigger} allowEmpty="Choose a trigger" />
        </Field>
        <Field label="What did you do?">
          <Select value={strategy} options={entries(STRATEGY_LABELS)} onChange={setStrategy} allowEmpty="Nothing in particular" />
        </Field>
      </div>
      {trigger && plansForTrigger(plans, trigger).slice(0, 1).map((p) => (
        <div key={p.id} className="panel tint-amber"><p className="soft">Your plan for this:</p><PlanCard plan={p} /></div>
      ))}
      <div className="chips" role="group" aria-label="Outcome">
        <button type="button" className="chip" aria-pressed={outcome === "RESISTED"} onClick={() => setOutcome("RESISTED")}>I resisted it</button>
        <button type="button" className="chip" aria-pressed={outcome === "SMOKED"} onClick={() => setOutcome("SMOKED")}>I used</button>
      </div>
      {outcome === "SMOKED" && (
        <div className="panel tint-ember stack">
          <p>
            {reducing
              ? "Logged against today's limit. Honest numbers are what make cutting down work."
              : "A slip isn't a failure — your start date stays. Logging it honestly keeps your savings and recovery timeline accurate."}
          </p>
          {profile.overdoseRiskAfterBreak && <SafetyNotes notes={profile.safety.filter((n) => n.level === "critical")} />}
          <Field label={`How many ${profile.unit}?`}>
            <input type="number" min="0.5" step="0.5" value={units} onChange={(e) => setUnits(e.target.value)} />
          </Field>
        </div>
      )}
      <Field label="Note (optional)">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={!trigger || intensity === null} onClick={save}>Log craving</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
