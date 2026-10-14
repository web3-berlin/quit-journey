import { generateId } from "document-model";
import { actions, localDateKey, type WithdrawalSymptom } from "document-models/quit-journey";
import { useState } from "react";
import { entries, SYMPTOM_LABELS } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { Chips, Field, Scale } from "./ui.js";

export function CheckInForm({ dispatch, now, onDone }: { dispatch: Dispatch; now: number; onDone: () => void }) {
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
      <Scale label="Mood" value={mood} onChange={setMood} low="rough" high="great" />
      <Scale label="Craving level" value={craving} onChange={setCraving} low="none" high="intense" />
      <Scale label="Energy" value={energy} onChange={setEnergy} low="drained" high="buzzing" />
      <Scale label="Sleep" value={sleep} onChange={setSleep} low="awful" high="deep" />
      <div>
        <p className="soft" style={{ marginBottom: 6 }}>Anything bothering you today?</p>
        <Chips label="Withdrawal symptoms" options={entries(SYMPTOM_LABELS)} selected={symptoms} onToggle={toggle} />
      </div>
      <div className="grid2">
        <Field label="Weight in kg (optional)">
          <input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </div>
      <Field label="Journal">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What helped today? What was hard?" />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={mood === null || craving === null} onClick={save}>Save check-in</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
