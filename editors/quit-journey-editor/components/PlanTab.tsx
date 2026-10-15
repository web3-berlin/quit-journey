import { generateId } from "document-model";
import { actions, type QuitAidType } from "document-models/quit-journey";
import { useState } from "react";
import { formatDateTime, fromLocalInput, toLocalInput } from "../lib/format.js";
import { AID_LABELS, entries, TRIGGER_LABELS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { PlanForm } from "./PlanForm.js";
import { Empty, Field, Select } from "./ui.js";

export function PlanTab({ state, snapshot, dispatch }: TabProps) {
  const now = snapshot.now;
  const [why, setWhy] = useState("");
  const [name, setName] = useState(state.displayName ?? "");
  const [contact, setContact] = useState({ name: "", phone: "", relation: "" });
  const [quitline, setQuitline] = useState(state.quitlinePhone ?? "");
  const [aidType, setAidType] = useState<QuitAidType | "">("");
  const [aidDosage, setAidDosage] = useState("");
  const [restartAt, setRestartAt] = useState(toLocalInput(now));
  const [restartReason, setRestartReason] = useState("");
  const [confirmRestart, setConfirmRestart] = useState(false);

  function addWhy() {
    if (!why.trim()) return;
    dispatch(actions.addMotivation({ id: generateId(), text: why.trim(), imageUrl: null }));
    setWhy("");
  }

  function addContact() {
    if (!contact.name.trim()) return;
    dispatch(actions.addSupportContact({ id: generateId(), name: contact.name.trim(), phone: contact.phone.trim() || null, relation: contact.relation.trim() || null }));
    setContact({ name: "", phone: "", relation: "" });
  }

  function addAid() {
    if (!aidType) return;
    dispatch(actions.addQuitAid({ id: generateId(), type: aidType, name: null, dosage: aidDosage.trim() || null, startedAt: new Date(now).toISOString() }));
    setAidType("");
    setAidDosage("");
  }

  function restart() {
    const nowIso = new Date(now).toISOString();
    const newQuit = fromLocalInput(restartAt);
    dispatch(actions.restartJourney({ attemptId: generateId(), endedAt: nowIso, newQuitDateTime: newQuit < nowIso ? nowIso : newQuit, reason: restartReason.trim() || null }));
    setConfirmRestart(false);
    setRestartReason("");
  }

  const activeAids = state.aids.filter((a) => !a.endedAt);
  const slips = [...state.slips].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="stack-lg">
      <section className="panel stack">
        <h2>Quit plan</h2>
        <PlanForm key={state.plan?.quitDateTime ?? "new"} plan={state.plan} dispatch={dispatch} now={now} />
      </section>

      <section className="stack">
        <h3>Your name</h3>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
          <button type="button" className="btn ghost" onClick={() => dispatch(actions.setDisplayName({ displayName: name.trim() || null }))}>Save</button>
        </div>
      </section>

      <section className="stack">
        <h3>My reasons to quit</h3>
        <p className="soft">These show up in the SOS screen when a craving hits.</p>
        {state.motivations.length === 0 && <Empty>Add the first one: who or what are you doing this for?</Empty>}
        <ul className="list">
          {state.motivations.map((m) => (
            <li key={m.id}><span>{m.text}</span><button type="button" className="linkish" onClick={() => dispatch(actions.removeMotivation({ id: m.id }))}>Remove</button></li>
          ))}
        </ul>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="To run with my kids without getting out of breath" onKeyDown={(e) => e.key === "Enter" && addWhy()} />
          <button type="button" className="btn" disabled={!why.trim()} onClick={addWhy}>Add</button>
        </div>
      </section>

      <section className="stack">
        <h3>Quit aids</h3>
        <p className="soft">Medication and support make a real difference: nicotine replacement, methadone or buprenorphine for opioids, naltrexone or acamprosate for alcohol, therapy and support groups for everything. Log each use or meeting to keep track.</p>
        <ul className="list">
          {activeAids.map((a) => {
            const uses = state.aidUses.filter((u) => u.aidId === a.id).length;
            return (
              <li key={a.id}>
                <span><strong>{AID_LABELS[a.type]}</strong>{a.dosage && <span className="soft"> {a.dosage}</span>}<br /><span className="muted">{uses} uses logged</span></span>
                <span className="row">
                  <button type="button" className="btn small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: a.id, timestamp: new Date().toISOString(), note: null }))}>Log use</button>
                  <button type="button" className="linkish" onClick={() => dispatch(actions.endQuitAid({ id: a.id, endedAt: new Date().toISOString() }))}>Stop</button>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="grid2">
          <Field label="Aid"><Select value={aidType} options={entries(AID_LABELS)} onChange={setAidType} allowEmpty="Choose an aid" /></Field>
          <Field label="Dosage (optional)"><input value={aidDosage} onChange={(e) => setAidDosage(e.target.value)} placeholder="21 mg / 24 h" /></Field>
        </div>
        <button type="button" className="btn ghost" disabled={!aidType} onClick={addAid}>Start using this aid</button>
      </section>

      <section className="stack">
        <h3>Support network</h3>
        <ul className="list">
          {state.supportContacts.map((c) => (
            <li key={c.id}>
              <span><strong>{c.name}</strong>{c.relation && <span className="soft">, {c.relation}</span>}{c.phone && <><br /><span className="muted">{c.phone}</span></>}</span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.removeSupportContact({ id: c.id }))}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="grid2">
          <Field label="Name"><input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
          <Field label="Phone"><input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
          <Field label="Who are they?"><input value={contact.relation} onChange={(e) => setContact({ ...contact, relation: e.target.value })} placeholder="Sister, quit buddy…" /></Field>
        </div>
        <button type="button" className="btn ghost" disabled={!contact.name.trim()} onClick={addContact}>Add contact</button>
        <Field label="Helpline phone number">
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="tel" value={quitline} onChange={(e) => setQuitline(e.target.value)} placeholder="e.g. US SAMHSA 1-800-662-4357, UK Frank 0300 123 6600" />
            <button type="button" className="btn ghost" onClick={() => dispatch(actions.setQuitline({ phone: quitline.trim() || null }))}>Save</button>
          </div>
        </Field>
      </section>

      <section className="stack">
        <h3>Slips</h3>
        <p className="soft">A slip keeps your quit date. It only adjusts your savings and restarts the health clock.</p>
        {slips.length === 0 ? <Empty>No slips. Keep it that way, one craving at a time.</Empty> : (
          <ul className="list">
            {slips.map((s) => (
              <li key={s.id}>
                <span>{s.units} {snapshot.profile.unit} {s.trigger && <span className="soft">— {TRIGGER_LABELS[s.trigger].toLowerCase()}</span>}<br /><span className="muted">{formatDateTime(s.timestamp)}</span></span>
                <button type="button" className="linkish" onClick={() => dispatch(actions.deleteSlip({ id: s.id }))}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {state.plan && (
        <section className="panel tint-ember stack">
          <h3>Start over</h3>
          <p>Back to using regularly? Most people need several attempts — each one teaches you something. Your past attempts and savings stay in your history.</p>
          {state.pastAttempts.length > 0 && <p className="soft">Previous attempts: {state.pastAttempts.length}</p>}
          {confirmRestart ? (
            <div className="stack">
              <div className="grid2">
                <Field label="New quit date"><input type="datetime-local" value={restartAt} onChange={(e) => setRestartAt(e.target.value)} /></Field>
                <Field label="What happened? (optional)"><input value={restartReason} onChange={(e) => setRestartReason(e.target.value)} /></Field>
              </div>
              <div className="row">
                <button type="button" className="btn ember" onClick={restart}>Start a new attempt</button>
                <button type="button" className="btn ghost" onClick={() => setConfirmRestart(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirmRestart(true)}>Start a new attempt</button>
          )}
        </section>
      )}
    </div>
  );
}
