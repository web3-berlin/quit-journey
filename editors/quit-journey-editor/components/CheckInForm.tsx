import { generateId } from "document-model";
import { actions, localDateKey, type WithdrawalSymptom } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useLabels } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { Chips, Field, Scale } from "./ui.js";

export function CheckInForm({ dispatch, now, onDone }: { dispatch: Dispatch; now: number; onDone: () => void }) {
  const intl = useIntl();
  const L = useLabels();
  const [mood, setMood] = useState<number | null>(null);
  const [craving, setCraving] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState<WithdrawalSymptom[]>([]);
  const [note, setNote] = useState("");

  const toggle = (s: WithdrawalSymptom) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  function save() {
    if (mood === null || craving === null) return;
    dispatch(actions.dailyCheckIn({
      id: generateId(),
      date: localDateKey(now),
      mood,
      cravingLevel: craving,
      energy,
      sleepQuality: sleep,
      weightKg: weight ? Number(weight) : null,
      symptoms,
      note: note.trim() || null,
    }));
    onDone();
  }

  return (
    <div className="stack">
      <Scale label={intl.formatMessage({ id: "checkin.mood", defaultMessage: "Mood" })} value={mood} onChange={setMood}
        low={intl.formatMessage({ id: "checkin.mood.low", defaultMessage: "rough" })} high={intl.formatMessage({ id: "checkin.mood.high", defaultMessage: "great" })} />
      <Scale label={intl.formatMessage({ id: "checkin.craving", defaultMessage: "Craving level" })} value={craving} onChange={setCraving}
        low={intl.formatMessage({ id: "checkin.craving.low", defaultMessage: "none" })} high={intl.formatMessage({ id: "checkin.craving.high", defaultMessage: "intense" })} />
      <Scale label={intl.formatMessage({ id: "checkin.energy", defaultMessage: "Energy" })} value={energy} onChange={setEnergy}
        low={intl.formatMessage({ id: "checkin.energy.low", defaultMessage: "drained" })} high={intl.formatMessage({ id: "checkin.energy.high", defaultMessage: "buzzing" })} />
      <Scale label={intl.formatMessage({ id: "checkin.sleep", defaultMessage: "Sleep" })} value={sleep} onChange={setSleep}
        low={intl.formatMessage({ id: "checkin.sleep.low", defaultMessage: "awful" })} high={intl.formatMessage({ id: "checkin.sleep.high", defaultMessage: "deep" })} />
      <div>
        <p className="soft" style={{ marginBottom: 6 }}>{intl.formatMessage({ id: "checkin.symptoms.prompt", defaultMessage: "Anything bothering you today?" })}</p>
        <Chips label={intl.formatMessage({ id: "checkin.symptoms.label", defaultMessage: "Withdrawal symptoms" })} options={L.options("symptom")} selected={symptoms} onToggle={toggle} />
      </div>
      <div className="grid2">
        <Field label={intl.formatMessage({ id: "checkin.weight", defaultMessage: "Weight in kg (optional)" })}>
          <input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </div>
      <Field label={intl.formatMessage({ id: "checkin.journal", defaultMessage: "Journal" })}>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={intl.formatMessage({ id: "checkin.journal.placeholder", defaultMessage: "What helped today? What was hard?" })} />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={mood === null || craving === null} onClick={save}>{intl.formatMessage({ id: "checkin.save", defaultMessage: "Save check-in" })}</button>
        <button type="button" className="btn ghost" onClick={onDone}>{intl.formatMessage({ id: "common.cancel", defaultMessage: "Cancel" })}</button>
      </div>
    </div>
  );
}
