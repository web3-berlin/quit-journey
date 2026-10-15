import { actions } from "document-models/quit-journey";
import { useState } from "react";
import { formatDateTime, formatNumber } from "../lib/format.js";
import { STRATEGY_LABELS, TRIGGER_LABELS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CravingLogForm } from "./CravingLogForm.js";
import { Empty } from "./ui.js";

export function CravingsTab({ state, snapshot, dispatch }: TabProps) {
  const [logging, setLogging] = useState(false);
  const { insights } = snapshot;
  const cravings = [...state.cravings].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="stack-lg">
      <section className="stack">
        <div className="spread">
          <h2>Cravings</h2>
          {insights.totalCravings > 0 && (
            <span className="soft">{insights.resistedCravings} of {insights.totalCravings} beaten ({formatNumber(insights.resistRate * 100)}%)</span>
          )}
        </div>
        <p className="soft">Most cravings pass within {insights.typicalCravingMinutes} minutes. Logging each one teaches the app what works for you.</p>
        {logging ? (
          <div className="panel"><CravingLogForm dispatch={dispatch} now={snapshot.now} profile={snapshot.profile} reducing={snapshot.reduction !== null} plans={state.ifThenPlans ?? []} onDone={() => setLogging(false)} /></div>
        ) : (
          <button type="button" className="btn" onClick={() => setLogging(true)}>Log a craving</button>
        )}
      </section>

      <section>
        <h3>History</h3>
        {cravings.length === 0 ? (
          <Empty>No cravings logged yet. When one hits, tap SOS first, log it after.</Empty>
        ) : (
          <ul className="list">
            {cravings.map((c) => (
              <li key={c.id}>
                <div>
                  <strong>{c.outcome === "RESISTED" ? "Beaten" : "Used"}</strong>
                  <span className="soft"> — {TRIGGER_LABELS[c.trigger].toLowerCase()}, intensity {c.intensity}/5</span>
                  {c.strategy && <p className="muted">{STRATEGY_LABELS[c.strategy]}</p>}
                  {c.note && <p className="soft">{c.note}</p>}
                  <p className="muted" style={{ fontSize: ".85rem" }}>{formatDateTime(c.timestamp)}</p>
                </div>
                <button type="button" className="linkish" onClick={() => dispatch(actions.deleteCraving({ id: c.id }))}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
