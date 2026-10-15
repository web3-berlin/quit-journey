import { generateId } from "document-model";
import { actions, plansForTrigger, substanceProfile, type CopingStrategy, type CravingOutcome, type CravingTrigger, type IfThenPlan, type SubstanceProfile } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { useLabels } from "../lib/labels.js";
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
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const [intensity, setIntensity] = useState<number | null>(3);
  const [trigger, setTrigger] = useState<CravingTrigger | "">("");
  const [strategy, setStrategy] = useState<CopingStrategy | "">(initialStrategy ?? "");
  const [outcome, setOutcome] = useState<CravingOutcome>("RESISTED");
  const [units, setUnits] = useState("1");
  const [note, setNote] = useState("");
  // The profile carries the user's own unit label when they set one; only the built-in unit is translated.
  const unit = profile.unit === substanceProfile(profile.key).unit ? tc(cid.substance(profile.key, "unit"), profile.unit) : profile.unit;

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
      <Scale
        label={intl.formatMessage({ id: "craving.intensity.label", defaultMessage: "How strong was it?" })}
        value={intensity}
        onChange={setIntensity}
        low={intl.formatMessage({ id: "craving.intensity.low", defaultMessage: "mild" })}
        high={intl.formatMessage({ id: "craving.intensity.high", defaultMessage: "overwhelming" })}
      />
      <div className="grid2">
        <Field label={intl.formatMessage({ id: "craving.trigger.label", defaultMessage: "What set it off?" })}>
          <Select value={trigger} options={L.options("trigger")} onChange={setTrigger} allowEmpty={intl.formatMessage({ id: "craving.trigger.empty", defaultMessage: "Choose a trigger" })} />
        </Field>
        <Field label={intl.formatMessage({ id: "craving.strategy.label", defaultMessage: "What did you do?" })}>
          <Select value={strategy} options={L.options("strategy")} onChange={setStrategy} allowEmpty={intl.formatMessage({ id: "craving.strategy.empty", defaultMessage: "Nothing in particular" })} />
        </Field>
      </div>
      {trigger && plansForTrigger(plans, trigger).slice(0, 1).map((p) => (
        <div key={p.id} className="panel tint-amber"><p className="soft">{intl.formatMessage({ id: "craving.planForThis", defaultMessage: "Your plan for this:" })}</p><PlanCard plan={p} /></div>
      ))}
      <div className="chips" role="group" aria-label={intl.formatMessage({ id: "craving.outcome.label", defaultMessage: "Outcome" })}>
        <button type="button" className="chip" aria-pressed={outcome === "RESISTED"} onClick={() => setOutcome("RESISTED")}>{intl.formatMessage({ id: "craving.outcome.resisted", defaultMessage: "I resisted it" })}</button>
        <button type="button" className="chip" aria-pressed={outcome === "SMOKED"} onClick={() => setOutcome("SMOKED")}>{intl.formatMessage({ id: "craving.outcome.used", defaultMessage: "I used" })}</button>
      </div>
      {outcome === "SMOKED" && (
        <div className="panel tint-ember stack">
          <p>
            {reducing
              ? intl.formatMessage({ id: "craving.used.reducing", defaultMessage: "Logged against today's limit. Honest numbers are what make cutting down work." })
              : intl.formatMessage({ id: "craving.used.slip", defaultMessage: "A slip isn't a failure — your start date stays. Logging it honestly keeps your savings and recovery timeline accurate." })}
          </p>
          {profile.overdoseRiskAfterBreak && <SafetyNotes notes={profile.safety.filter((n) => n.level === "critical")} />}
          <Field label={intl.formatMessage({ id: "craving.used.howMany", defaultMessage: "How many {unit}?" }, { unit })}>
            <input type="number" min="0.5" step="0.5" value={units} onChange={(e) => setUnits(e.target.value)} />
          </Field>
        </div>
      )}
      <Field label={intl.formatMessage({ id: "craving.note.label", defaultMessage: "Note (optional)" })}>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={!trigger || intensity === null} onClick={save}>{intl.formatMessage({ id: "craving.save", defaultMessage: "Log craving" })}</button>
        <button type="button" className="btn ghost" onClick={onDone}>{intl.formatMessage({ id: "common.cancel", defaultMessage: "Cancel" })}</button>
      </div>
    </div>
  );
}
