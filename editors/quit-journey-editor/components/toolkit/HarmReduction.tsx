import { generateId } from "document-model";
import { actions, type DrugTestResult, type DrugTestType, type HarmReductionAction, type NaloxoneKind } from "document-models/quit-journey";
import { useState } from "react";
import { formatDateTime } from "../../lib/format.js";
import { DRUG_RESULT_LABELS, DRUG_TEST_LABELS, entries, HARM_ACTION_LABELS, NALOXONE_LABELS } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Chips, Empty, Field, Select } from "../ui.js";

export function Naloxone({ state, snapshot, dispatch }: TabProps) {
  const [kind, setKind] = useState<NaloxoneKind>("NASAL_SPRAY_4MG");
  const [location, setLocation] = useState("");
  const [expires, setExpires] = useState("");
  const kits = state.naloxoneKits ?? [];
  const status = new Map(snapshot.toolkit.naloxone.map((s) => [s.kitId, s]));

  return (
    <section className="stack">
      <h3>Naloxone</h3>
      <p className="soft">Naloxone (Narcan) reverses an opioid overdose. Keep it where you and the people around you can find it, and replace it when it expires or after use.</p>
      {kits.length === 0 && <Empty>No naloxone logged. Pharmacies and harm-reduction services often give it out free.</Empty>}
      <ul className="list">
        {kits.map((k) => {
          const s = status.get(k.id);
          return (
            <li key={k.id}>
              <span>
                <strong>{NALOXONE_LABELS[k.kind]}</strong>{k.location && <span className="soft"> — {k.location}</span>}<br />
                <span className={s?.state === "EXPIRED" || s?.state === "USED" ? "error" : "muted"}>
                  {s?.state === "USED" ? "Used — replace it" : s?.state === "EXPIRED" ? "Expired — replace it" : k.expiresOn ? `Expires ${k.expiresOn}${s?.state === "EXPIRING" ? " (soon)" : ""}` : "No expiry date logged"}
                </span>
              </span>
              <span className="row" style={{ flexWrap: "nowrap" }}>
                {!k.usedAt && <button type="button" className="linkish" onClick={() => dispatch(actions.markNaloxoneUsed({ id: k.id, usedAt: new Date().toISOString() }))}>Used it</button>}
                <button type="button" className="linkish" onClick={() => dispatch(actions.removeNaloxoneKit({ id: k.id }))}>Remove</button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="grid2">
        <Field label="Type"><Select value={kind} options={entries(NALOXONE_LABELS)} onChange={(v) => v && setKind(v)} /></Field>
        <Field label="Where is it?"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bag, kitchen drawer…" /></Field>
        <Field label="Expiry date"><input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></Field>
      </div>
      <button type="button" className="btn ghost" onClick={() => {
        dispatch(actions.addNaloxoneKit({ id: generateId(), kind, location: location.trim() || null, expiresOn: expires || null, addedAt: new Date().toISOString() }));
        setLocation("");
        setExpires("");
      }}>Add naloxone kit</button>
    </section>
  );
}

export function DrugChecks({ state, snapshot, dispatch }: TabProps) {
  const [testType, setTestType] = useState<DrugTestType>("FENTANYL_STRIP");
  const [result, setResult] = useState<DrugTestResult | "">("");
  const [expected, setExpected] = useState("");
  const [taken, setTaken] = useState<HarmReductionAction[]>([]);
  const checks = [...(state.drugChecks ?? [])].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
  const alerts = snapshot.toolkit.alerts;

  return (
    <section className="stack">
      <h3>Drug checking</h3>
      <p className="soft">Testing tells you more, not everything: a negative strip doesn't mean a drug is safe. Log what you found and what you did — it helps you see your own safety habits.</p>
      {alerts.map((a) => (
        <details key={a.key} className="panel">
          <summary style={{ cursor: "pointer" }}><strong>{a.title}</strong> <span className="muted">(checked {a.reviewedOn})</span></summary>
          <p style={{ marginTop: 8 }}>{a.body}</p>
          <p className="muted" style={{ fontSize: ".85rem" }}>Source: {a.source}</p>
        </details>
      ))}
      <div className="grid2">
        <Field label="Test"><Select value={testType} options={entries(DRUG_TEST_LABELS)} onChange={(v) => v && setTestType(v)} /></Field>
        <Field label="Result"><Select value={result} options={entries(DRUG_RESULT_LABELS)} onChange={setResult} allowEmpty="Choose result" /></Field>
        <Field label="What was it supposed to be?"><input value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="optional" /></Field>
      </div>
      {result === "POSITIVE" && <p className="error">Detected. The safest choice is not to use it. If you do: use much less, go slow, never alone, naloxone ready.</p>}
      <div>
        <p className="soft" style={{ marginBottom: 6 }}>What did you do?</p>
        <Chips label="Actions taken" options={entries(HARM_ACTION_LABELS)} selected={taken} onToggle={(k) => setTaken((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))} />
      </div>
      <button type="button" className="btn ghost" disabled={!result} onClick={() => {
        if (!result) return;
        dispatch(actions.logDrugCheck({ id: generateId(), checkedAt: new Date().toISOString(), expectedSubstance: expected.trim() || null, testType, result, actions: taken, note: null }));
        setResult("");
        setExpected("");
        setTaken([]);
      }}>Log check</button>
      {checks.length > 0 && (
        <ul className="list">
          {checks.slice(0, 10).map((c) => (
            <li key={c.id}>
              <span>
                {DRUG_TEST_LABELS[c.testType]}: <strong>{DRUG_RESULT_LABELS[c.result]}</strong>{c.expectedSubstance && <span className="soft"> ({c.expectedSubstance})</span>}<br />
                <span className="muted">{c.actions.map((a) => HARM_ACTION_LABELS[a]).join(", ") || "No action logged"}, {formatDateTime(c.checkedAt)}</span>
              </span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteDrugCheck({ id: c.id }))}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
