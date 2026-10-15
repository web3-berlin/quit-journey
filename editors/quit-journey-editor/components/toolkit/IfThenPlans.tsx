import { generateId } from "document-model";
import { actions, type CopingStrategy, type CravingTrigger, type IfThenPlan } from "document-models/quit-journey";
import { useState } from "react";
import { entries, STRATEGY_LABELS, TRIGGER_LABELS } from "../../lib/labels.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Empty, Field, Select } from "../ui.js";

const REVIEW_AFTER_DAYS = 14;

/** One plan as a readable sentence: "If … then …". */
export function PlanCard({ plan }: { plan: IfThenPlan }) {
  return (
    <p>
      <strong>If</strong> {plan.ifText}, <strong>then</strong> {plan.thenText}.
    </p>
  );
}

function PlanEditor({ dispatch, initial, onDone }: { dispatch: Dispatch; initial?: IfThenPlan; onDone: () => void }) {
  const [trigger, setTrigger] = useState<CravingTrigger | "">(initial?.trigger ?? "");
  const [ifText, setIf] = useState(initial?.ifText ?? "");
  const [thenText, setThen] = useState(initial?.thenText ?? "");
  const [strategy, setStrategy] = useState<CopingStrategy | "">(initial?.strategy ?? "");
  const ok = ifText.trim() && thenText.trim();

  function save() {
    if (!ok) return;
    const common = { trigger: trigger || null, ifText, thenText, strategy: strategy || null };
    dispatch(initial ? actions.updateIfThenPlan({ id: initial.id, ...common }) : actions.addIfThenPlan({ id: generateId(), createdAt: new Date().toISOString(), ...common }));
    onDone();
  }

  return (
    <div className="panel stack">
      <div className="grid2">
        <Field label="When this triggers it"><Select value={trigger} options={entries(TRIGGER_LABELS)} onChange={setTrigger} allowEmpty="Any trigger" /></Field>
        <Field label="Strategy"><Select value={strategy} options={entries(STRATEGY_LABELS)} onChange={setStrategy} allowEmpty="None" /></Field>
      </div>
      <Field label="If…"><input value={ifText} onChange={(e) => setIf(e.target.value)} placeholder="I'm walking past the bar after work" /></Field>
      <Field label="…then I will"><input value={thenText} onChange={(e) => setThen(e.target.value)} placeholder="call Anna and keep walking to the gym" /></Field>
      <div className="row">
        <button type="button" className="btn" disabled={!ok} onClick={save}>{initial ? "Save plan" : "Add plan"}</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

export function IfThenPlans({ state, snapshot, dispatch }: TabProps) {
  const [editing, setEditing] = useState<IfThenPlan | "new" | null>(null);
  const plans = state.ifThenPlans ?? [];
  const stale = (p: IfThenPlan) => snapshot.now - Date.parse(p.lastReviewedAt ?? p.createdAt) > REVIEW_AFTER_DAYS * 86_400_000;

  return (
    <section className="stack">
      <h3>If-then plans</h3>
      <p className="soft">Decide now what you'll do when a trigger hits. Plans pop up when you log a craving with that trigger. They work best when you refresh them every couple of weeks.</p>
      {plans.length === 0 && editing === null && <Empty>No plans yet. Start with your most common trigger.</Empty>}
      <ul className="list">
        {plans.map((p) => (
          <li key={p.id}>
            <div>
              {p.trigger && <p className="muted">{TRIGGER_LABELS[p.trigger]}</p>}
              <PlanCard plan={p} />
              {stale(p) && <p className="muted">Time for a quick review — does this still fit?</p>}
            </div>
            <span className="row" style={{ flexWrap: "nowrap" }}>
              {stale(p) && <button type="button" className="linkish" onClick={() => dispatch(actions.reviewIfThenPlan({ id: p.id, reviewedAt: new Date().toISOString() }))}>Still good</button>}
              <button type="button" className="linkish" onClick={() => setEditing(p)}>Edit</button>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteIfThenPlan({ id: p.id }))}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
      {editing !== null ? (
        <PlanEditor key={editing === "new" ? "new" : editing.id} dispatch={dispatch} initial={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="btn ghost" onClick={() => setEditing("new")}>Add an if-then plan</button>
      )}
    </section>
  );
}
