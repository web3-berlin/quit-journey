import { generateId } from "document-model";
import { actions, availableAssessments, scoreAssessment, type AssessmentDefinition, type AssessmentInstrument } from "document-models/quit-journey";
import { useState } from "react";
import { formatDateTime } from "../../lib/format.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Empty } from "../ui.js";

function AssessmentForm({ def, dispatch, onDone }: { def: AssessmentDefinition; dispatch: Dispatch; onDone: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => def.items.map(() => null));
  const complete = answers.every((a) => a !== null);

  function save() {
    const values = answers.filter((a): a is number => a !== null);
    if (values.length !== def.items.length) return;
    dispatch(actions.recordAssessment({ id: generateId(), instrument: def.instrument, takenAt: new Date().toISOString(), answers: values }));
    onDone();
  }

  return (
    <div className="panel stack">
      <h3>{def.name}</h3>
      <p className="soft">{def.purpose}</p>
      <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
        {def.items.map((item, n) => (
          <li key={n}>
            <p style={{ marginBottom: 6 }}>{item.text}</p>
            <div className="chips" role="group" aria-label={item.text}>
              {item.options.map((o) => (
                <button key={o.value} type="button" className="chip" aria-pressed={answers[n] === o.value}
                  onClick={() => setAnswers((cur) => cur.map((a, i) => (i === n ? o.value : a)))}>{o.label}</button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="muted" style={{ fontSize: ".85rem" }}>{def.citation}</p>
      <div className="row">
        <button type="button" className="btn" disabled={!complete} onClick={save}>Save my answers</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

export function Assessments({ state, snapshot, dispatch }: TabProps) {
  const [open, setOpen] = useState<AssessmentInstrument | null>(null);
  const defs = availableAssessments(snapshot.profile.key);
  const history = [...(state.assessments ?? [])].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const active = defs.find((d) => d.instrument === open);

  return (
    <section className="stack">
      <h3>Check-ins & scales</h3>
      <p className="soft">Short, validated questionnaires. Retaking them shows your progress over time — they're information for you, not a diagnosis.</p>
      {active ? (
        <AssessmentForm def={active} dispatch={dispatch} onDone={() => setOpen(null)} />
      ) : defs.length === 0 ? (
        <Empty>No scales for this journey yet.</Empty>
      ) : (
        <ul className="list">
          {defs.map((d) => {
            const latest = snapshot.toolkit.latestAssessments[d.instrument];
            const due = !latest || snapshot.now - Date.parse(latest.takenAt) > d.retakeDays * 86_400_000;
            return (
              <li key={d.instrument}>
                <div>
                  <strong>{d.name}</strong>
                  <p className="muted">{d.purpose}</p>
                  {latest && (
                    <p className={latest.redFlag ? "error" : "soft"}>
                      Last: {latest.score}/{latest.maxScore}{latest.band ? ` — ${latest.band.label}` : ""} ({formatDateTime(latest.takenAt)})
                    </p>
                  )}
                  {latest?.redFlag && <p className="error">Your last answers point to severe symptoms. Contact your doctor or prescriber today, or emergency services if you feel unsafe.</p>}
                </div>
                <button type="button" className={due ? "btn small" : "btn ghost small"} onClick={() => setOpen(d.instrument)}>{latest ? "Retake" : "Start"}</button>
              </li>
            );
          })}
        </ul>
      )}
      {history.length > 0 && !active && (
        <details>
          <summary className="soft" style={{ cursor: "pointer" }}>History ({history.length})</summary>
          <ul className="list">
            {history.map((h) => {
              const result = scoreAssessment(h.instrument, h.answers);
              return (
                <li key={h.id}>
                  <span>{defs.find((d) => d.instrument === h.instrument)?.name ?? h.instrument}: {h.score}/{result.maxScore}{result.band ? ` — ${result.band.label}` : ""}<br /><span className="muted">{formatDateTime(h.takenAt)}</span></span>
                  <button type="button" className="linkish" onClick={() => dispatch(actions.deleteAssessment({ id: h.id }))}>Delete</button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
