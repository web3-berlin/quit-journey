import { generateId } from "document-model";
import { actions, localDateKey, type MedicationPlanSource, type QuitAid } from "document-models/quit-journey";
import { useState } from "react";
import { AID_LABELS, entries, MED_SOURCE_LABELS } from "../../lib/labels.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Empty, Field, Select } from "../ui.js";

interface StepDraft {
  fromDay: string;
  dose: string;
  timesPerDay: string;
}

function PlanEditor({ aid, dispatch, now, onDone }: { aid: QuitAid; dispatch: Dispatch; now: number; onDone: () => void }) {
  const [source, setSource] = useState<MedicationPlanSource>("CLINICIAN");
  const [startDate, setStartDate] = useState(localDateKey(now));
  const [steps, setSteps] = useState<StepDraft[]>([{ fromDay: "1", dose: aid.dosage ?? "", timesPerDay: "1" }]);
  const [error, setError] = useState<string | null>(null);

  const update = (n: number, patch: Partial<StepDraft>) => setSteps((cur) => cur.map((s, i) => (i === n ? { ...s, ...patch } : s)));

  function save() {
    const parsed = steps.map((s) => ({ id: generateId(), fromDay: Number(s.fromDay), dose: s.dose.trim(), timesPerDay: Number(s.timesPerDay) }));
    const ordered = parsed.every((s, n) => n === 0 || s.fromDay > parsed[n - 1].fromDay);
    if (parsed[0].fromDay !== 1 || !ordered || parsed.some((s) => !s.dose || !(s.timesPerDay >= 1))) {
      setError("Start with day 1, keep days in increasing order, and give every step a dose and how many times a day.");
      return;
    }
    dispatch(actions.setMedicationPlan({ id: generateId(), aidId: aid.id, source, startDate, steps: parsed, note: null }));
    onDone();
  }

  return (
    <div className="panel stack">
      <p className="soft">Copy the schedule exactly as your clinician or the leaflet gives it. Quit Journey only reminds you — it never suggests doses.</p>
      <div className="grid2">
        <Field label="Where is this schedule from?"><Select value={source} options={entries(MED_SOURCE_LABELS)} onChange={(v) => v && setSource(v)} /></Field>
        <Field label="Day 1 is"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
      </div>
      {steps.map((s, n) => (
        <div key={n} className="grid2">
          <Field label="From day"><input type="number" min="1" value={s.fromDay} onChange={(e) => update(n, { fromDay: e.target.value })} /></Field>
          <Field label="Dose"><input value={s.dose} onChange={(e) => update(n, { dose: e.target.value })} placeholder="e.g. 21 mg patch, 0.5 mg" /></Field>
          <Field label="Times per day"><input type="number" min="1" value={s.timesPerDay} onChange={(e) => update(n, { timesPerDay: e.target.value })} /></Field>
        </div>
      ))}
      <button type="button" className="linkish" onClick={() => setSteps((cur) => [...cur, { fromDay: String(Number(cur[cur.length - 1].fromDay) + 7), dose: "", timesPerDay: "1" }])}>Add a step</button>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button type="button" className="btn" onClick={save}>Save schedule</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

export function Medication({ state, snapshot, dispatch }: TabProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pickup, setPickup] = useState<{ aidId: string; doses: string } | null>(null);
  const aids = state.aids.filter((a) => !a.endedAt);
  const isAlcohol = snapshot.profile.key === "ALCOHOL";

  if (aids.length === 0) {
    return (
      <section className="stack">
        <h3>Medication schedule</h3>
        <Empty>Add the medication or aid you use under My plan → Quit aids, then set its schedule here.</Empty>
      </section>
    );
  }

  return (
    <section className="stack">
      <h3>Medication schedule</h3>
      {aids.map((aid) => {
        const plan = (state.medicationPlans ?? []).find((p) => p.aidId === aid.id);
        const today = snapshot.toolkit.medication.find((m) => m.aidId === aid.id);
        return (
          <div key={aid.id} className="panel stack">
            <div className="spread"><strong>{AID_LABELS[aid.type]}{aid.name ? ` — ${aid.name}` : ""}</strong>{plan && <span className="muted">{MED_SOURCE_LABELS[plan.source]}</span>}</div>
            {today && (
              <p>
                Day {today.day}: <strong>{today.dose}</strong>, {today.timesPerDay}× a day — {today.takenToday} logged today.
                {today.takeHomeRemaining !== null && ` ${today.takeHomeRemaining} take-home dose${today.takeHomeRemaining === 1 ? "" : "s"} left.`}
              </p>
            )}
            {today && today.takeHomeRemaining !== null && today.takeHomeRemaining < 0 && (
              <p className="error">More doses logged than picked up — check your count with your clinic. Store take-homes locked and out of reach of children.</p>
            )}
            <div className="row">
              <button type="button" className="btn small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: aid.id, timestamp: new Date().toISOString(), note: null, beforeDrinking: null }))}>Log a dose</button>
              {isAlcohol && (aid.type === "NALTREXONE" || aid.type === "OTHER") && (
                <button type="button" className="btn ghost small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: aid.id, timestamp: new Date().toISOString(), note: null, beforeDrinking: true }))}>Took it before drinking</button>
              )}
              <button type="button" className="linkish" onClick={() => setEditing(aid.id)}>{plan ? "Change schedule" : "Set schedule"}</button>
              {plan && <button type="button" className="linkish" onClick={() => dispatch(actions.clearMedicationPlan({ aidId: aid.id }))}>Remove schedule</button>}
              {(aid.type === "METHADONE" || aid.type === "BUPRENORPHINE") && <button type="button" className="linkish" onClick={() => setPickup({ aidId: aid.id, doses: "7" })}>Record take-home pick-up</button>}
            </div>
            {pickup?.aidId === aid.id && (
              <div className="row" style={{ flexWrap: "nowrap" }}>
                <input type="number" min="1" max="31" value={pickup.doses} onChange={(e) => setPickup({ aidId: aid.id, doses: e.target.value })} aria-label="Doses picked up" style={{ maxWidth: 100 }} />
                <button type="button" className="btn small" onClick={() => {
                  const doses = Math.round(Number(pickup.doses));
                  if (doses >= 1 && doses <= 31) dispatch(actions.recordTakeHome({ id: generateId(), aidId: aid.id, pickedUpOn: localDateKey(snapshot.now), doses }));
                  setPickup(null);
                }}>Save</button>
              </div>
            )}
            {editing === aid.id && <PlanEditor aid={aid} dispatch={dispatch} now={snapshot.now} onDone={() => setEditing(null)} />}
          </div>
        );
      })}
      <p className="muted">If you miss a dose or feel withdrawal during a dose change, don't double up — call your prescriber or pharmacist.</p>
    </section>
  );
}
