import { generateId } from "document-model";
import { actions, type CopingStrategy, type CravingTrigger, type IfThenPlan } from "document-models/quit-journey";
import { useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { useLabels } from "../../lib/labels.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Empty, Field, Select } from "../ui.js";

const REVIEW_AFTER_DAYS = 14;

/** One plan as a readable sentence: "If … then …". */
export function PlanCard({ plan }: { plan: IfThenPlan }) {
  const intl = useIntl();
  return (
    <p>
      {intl.formatMessage(
        { id: "toolkit.plans.card", defaultMessage: "<b>If</b> {ifText}, <b>then</b> {thenText}." },
        { b: (c: ReactNode[]) => <strong>{c}</strong>, ifText: plan.ifText, thenText: plan.thenText },
      )}
    </p>
  );
}

function PlanEditor({ dispatch, initial, onDone }: { dispatch: Dispatch; initial?: IfThenPlan; onDone: () => void }) {
  const intl = useIntl();
  const L = useLabels();
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
        <Field label={intl.formatMessage({ id: "toolkit.plans.triggerLabel", defaultMessage: "When this triggers it" })}>
          <Select value={trigger} options={L.options("trigger")} onChange={setTrigger} allowEmpty={intl.formatMessage({ id: "toolkit.plans.anyTrigger", defaultMessage: "Any trigger" })} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.plans.strategyLabel", defaultMessage: "Strategy" })}>
          <Select value={strategy} options={L.options("strategy")} onChange={setStrategy} allowEmpty={intl.formatMessage({ id: "toolkit.plans.noStrategy", defaultMessage: "None" })} />
        </Field>
      </div>
      <Field label={intl.formatMessage({ id: "toolkit.plans.ifLabel", defaultMessage: "If…" })}>
        <input value={ifText} onChange={(e) => setIf(e.target.value)} placeholder={intl.formatMessage({ id: "toolkit.plans.ifPlaceholder", defaultMessage: "I'm walking past the bar after work" })} />
      </Field>
      <Field label={intl.formatMessage({ id: "toolkit.plans.thenLabel", defaultMessage: "…then I will" })}>
        <input value={thenText} onChange={(e) => setThen(e.target.value)} placeholder={intl.formatMessage({ id: "toolkit.plans.thenPlaceholder", defaultMessage: "call Anna and keep walking to the gym" })} />
      </Field>
      <div className="row">
        <button type="button" className="btn" disabled={!ok} onClick={save}>
          {initial
            ? intl.formatMessage({ id: "toolkit.plans.save", defaultMessage: "Save plan" })
            : intl.formatMessage({ id: "toolkit.plans.add", defaultMessage: "Add plan" })}
        </button>
        <button type="button" className="btn ghost" onClick={onDone}>{intl.formatMessage({ id: "toolkit.plans.cancel", defaultMessage: "Cancel" })}</button>
      </div>
    </div>
  );
}

export function IfThenPlans({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const [editing, setEditing] = useState<IfThenPlan | "new" | null>(null);
  const plans = state.ifThenPlans ?? [];
  const stale = (p: IfThenPlan) => snapshot.now - Date.parse(p.lastReviewedAt ?? p.createdAt) > REVIEW_AFTER_DAYS * 86_400_000;

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.plans.heading", defaultMessage: "If-then plans" })}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.plans.intro",
          defaultMessage: "Decide now what you'll do when a trigger hits. Plans pop up when you log a craving with that trigger. They work best when you refresh them every couple of weeks.",
        })}
      </p>
      {plans.length === 0 && editing === null && (
        <Empty>{intl.formatMessage({ id: "toolkit.plans.empty", defaultMessage: "No plans yet. Start with your most common trigger." })}</Empty>
      )}
      <ul className="list">
        {plans.map((p) => (
          <li key={p.id}>
            <div>
              {p.trigger && <p className="muted">{L.label("trigger", p.trigger)}</p>}
              <PlanCard plan={p} />
              {stale(p) && <p className="muted">{intl.formatMessage({ id: "toolkit.plans.reviewDue", defaultMessage: "Time for a quick review — does this still fit?" })}</p>}
            </div>
            <span className="row" style={{ flexWrap: "nowrap" }}>
              {stale(p) && (
                <button type="button" className="linkish" onClick={() => dispatch(actions.reviewIfThenPlan({ id: p.id, reviewedAt: new Date().toISOString() }))}>
                  {intl.formatMessage({ id: "toolkit.plans.stillGood", defaultMessage: "Still good" })}
                </button>
              )}
              <button type="button" className="linkish" onClick={() => setEditing(p)}>{intl.formatMessage({ id: "toolkit.plans.edit", defaultMessage: "Edit" })}</button>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteIfThenPlan({ id: p.id }))}>{intl.formatMessage({ id: "toolkit.plans.delete", defaultMessage: "Delete" })}</button>
            </span>
          </li>
        ))}
      </ul>
      {editing !== null ? (
        <PlanEditor key={editing === "new" ? "new" : editing.id} dispatch={dispatch} initial={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="btn ghost" onClick={() => setEditing("new")}>{intl.formatMessage({ id: "toolkit.plans.addPlan", defaultMessage: "Add an if-then plan" })}</button>
      )}
    </section>
  );
}
