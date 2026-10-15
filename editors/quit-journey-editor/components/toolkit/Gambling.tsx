import { generateId } from "document-model";
import { actions, localDateKey, protectionLinksFor, type ExclusionScheme } from "document-models/quit-journey";
import { useState } from "react";
import { formatMoney } from "../../lib/format.js";
import { entries, EXCLUSION_LABELS } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Field, Select } from "../ui.js";

export function GamblingProtection({ state, snapshot, dispatch }: TabProps) {
  const [scheme, setScheme] = useState<ExclusionScheme>("GAMSTOP");
  const [start, setStart] = useState(localDateKey(snapshot.now));
  const [end, setEnd] = useState("");
  const [loss, setLoss] = useState("");
  const statuses = new Map(snapshot.toolkit.exclusions.map((s) => [s.exclusionId, s]));
  const links = protectionLinksFor("GAMBLING").filter((l) => !/meeting|narcotics|smart/i.test(l.name));
  const losses = state.gamblingLosses ?? [];
  const total = losses.reduce((s, l) => s + l.amount, 0);
  const currency = state.plan?.currency ?? "EUR";

  return (
    <section className="stack">
      <h3>Protection kit</h3>
      <p className="soft">Make gambling hard to reach on your worst day: self-exclude, block, and let your bank stop gambling payments. Most blocks have a cooling-off delay before they can be lifted — that's the point.</p>
      <ul className="list">
        {links.map((l) => (
          <li key={l.key}><span><a href={l.url} target="_blank" rel="noreferrer"><strong>{l.name}</strong></a> <span className="muted">({l.region})</span><br /><span className="soft">{l.description}</span></span></li>
        ))}
      </ul>
      <h3>My exclusions & blocks</h3>
      <ul className="list">
        {(state.exclusions ?? []).map((x) => {
          const s = statuses.get(x.id);
          return (
            <li key={x.id}>
              <span>
                <strong>{EXCLUSION_LABELS[x.scheme]}</strong> since {x.startDate}<br />
                <span className={s?.state === "ENDING_SOON" ? "error" : "muted"}>
                  {s?.state === "OPEN_ENDED" ? "No end date" : s?.state === "ENDED" ? `Ended ${x.endDate ?? ""}` : `${s?.daysLeft ?? "?"} days left${s?.state === "ENDING_SOON" ? " — renew it before it lapses" : ""}`}
                </span>
              </span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteExclusion({ id: x.id }))}>Delete</button>
            </li>
          );
        })}
      </ul>
      <div className="grid2">
        <Field label="Scheme"><Select value={scheme} options={entries(EXCLUSION_LABELS)} onChange={(v) => v && setScheme(v)} /></Field>
        <Field label="Start"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="End (optional)"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      </div>
      <button type="button" className="btn ghost" disabled={!start || (end !== "" && end < start)} onClick={() => {
        dispatch(actions.addExclusion({ id: generateId(), scheme, startDate: start, endDate: end || null, note: null }));
        setEnd("");
      }}>Add exclusion</button>

      <h3>Losses</h3>
      <p className="soft">Seeing the real number helps. Logged so far: <strong>{formatMoney(total, currency)}</strong>.</p>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="number" min="0" step="0.01" value={loss} onChange={(e) => setLoss(e.target.value)} aria-label="Amount lost" placeholder="Amount lost" />
        <button type="button" className="btn ghost" disabled={!(Number(loss) > 0)} onClick={() => {
          dispatch(actions.logGamblingLoss({ id: generateId(), date: localDateKey(snapshot.now), amount: Number(loss), note: null }));
          setLoss("");
        }}>Log loss</button>
      </div>
      {losses.length > 0 && (
        <ul className="list">
          {[...losses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((l) => (
            <li key={l.id}><span>{l.date}: {formatMoney(l.amount, currency)}</span><button type="button" className="linkish" onClick={() => dispatch(actions.deleteGamblingLoss({ id: l.id }))}>Delete</button></li>
          ))}
        </ul>
      )}
    </section>
  );
}
