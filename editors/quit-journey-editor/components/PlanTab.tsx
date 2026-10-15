import { generateId } from "document-model";
import { actions, substanceProfile, type QuitAidType } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { formatDateTime, fromLocalInput, inSentence, toLocalInput } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { PlanForm } from "./PlanForm.js";
import { Empty, Field, Select } from "./ui.js";

export function PlanTab({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const now = snapshot.now;
  const { profile } = snapshot;
  // The profile carries the user's own unit label when they set one; only the built-in unit is translated.
  const unit = profile.unit === substanceProfile(profile.key).unit ? tc(cid.substance(profile.key, "unit"), profile.unit) : profile.unit;
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
        <h2>{intl.formatMessage({ id: "plan.heading", defaultMessage: "Quit plan" })}</h2>
        <PlanForm key={state.plan?.quitDateTime ?? "new"} plan={state.plan} dispatch={dispatch} now={now} />
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "plan.name.heading", defaultMessage: "Your name" })}</h3>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={intl.formatMessage({ id: "plan.name.placeholder", defaultMessage: "What should we call you?" })} />
          <button type="button" className="btn ghost" onClick={() => dispatch(actions.setDisplayName({ displayName: name.trim() || null }))}>{intl.formatMessage({ id: "common.save", defaultMessage: "Save" })}</button>
        </div>
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "plan.reasons.heading", defaultMessage: "My reasons to quit" })}</h3>
        <p className="soft">{intl.formatMessage({ id: "plan.reasons.intro", defaultMessage: "These show up in the SOS screen when a craving hits." })}</p>
        {state.motivations.length === 0 && <Empty>{intl.formatMessage({ id: "plan.reasons.empty", defaultMessage: "Add the first one: who or what are you doing this for?" })}</Empty>}
        <ul className="list">
          {state.motivations.map((m) => (
            <li key={m.id}><span>{m.text}</span><button type="button" className="linkish" onClick={() => dispatch(actions.removeMotivation({ id: m.id }))}>{intl.formatMessage({ id: "common.remove", defaultMessage: "Remove" })}</button></li>
          ))}
        </ul>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder={intl.formatMessage({ id: "plan.reasons.placeholder", defaultMessage: "To run with my kids without getting out of breath" })} onKeyDown={(e) => e.key === "Enter" && addWhy()} />
          <button type="button" className="btn" disabled={!why.trim()} onClick={addWhy}>{intl.formatMessage({ id: "common.add", defaultMessage: "Add" })}</button>
        </div>
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "plan.aids.heading", defaultMessage: "Quit aids" })}</h3>
        <p className="soft">{intl.formatMessage({ id: "plan.aids.intro", defaultMessage: "Medication and support make a real difference: nicotine replacement, methadone or buprenorphine for opioids, naltrexone or acamprosate for alcohol, therapy and support groups for everything. Log each use or meeting to keep track." })}</p>
        <ul className="list">
          {activeAids.map((a) => {
            const uses = state.aidUses.filter((u) => u.aidId === a.id).length;
            return (
              <li key={a.id}>
                <span><strong>{L.label("aid", a.type)}</strong>{a.dosage && <span className="soft"> {a.dosage}</span>}<br /><span className="muted">{intl.formatMessage({ id: "plan.aids.usesLogged", defaultMessage: "{uses, plural, one {# use logged} other {# uses logged}}" }, { uses })}</span></span>
                <span className="row">
                  <button type="button" className="btn small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: a.id, timestamp: new Date().toISOString(), note: null }))}>{intl.formatMessage({ id: "plan.aids.logUse", defaultMessage: "Log use" })}</button>
                  <button type="button" className="linkish" onClick={() => dispatch(actions.endQuitAid({ id: a.id, endedAt: new Date().toISOString() }))}>{intl.formatMessage({ id: "plan.aids.stop", defaultMessage: "Stop" })}</button>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="grid2">
          <Field label={intl.formatMessage({ id: "plan.aids.aid", defaultMessage: "Aid" })}><Select value={aidType} options={L.options("aid")} onChange={setAidType} allowEmpty={intl.formatMessage({ id: "plan.aids.chooseAid", defaultMessage: "Choose an aid" })} /></Field>
          <Field label={intl.formatMessage({ id: "plan.aids.dosage", defaultMessage: "Dosage (optional)" })}><input value={aidDosage} onChange={(e) => setAidDosage(e.target.value)} placeholder={intl.formatMessage({ id: "plan.aids.dosage.placeholder", defaultMessage: "21 mg / 24 h" })} /></Field>
        </div>
        <button type="button" className="btn ghost" disabled={!aidType} onClick={addAid}>{intl.formatMessage({ id: "plan.aids.start", defaultMessage: "Start using this aid" })}</button>
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "plan.support.heading", defaultMessage: "Support network" })}</h3>
        <ul className="list">
          {state.supportContacts.map((c) => (
            <li key={c.id}>
              <span><strong>{c.name}</strong>{c.relation && <span className="soft">, {c.relation}</span>}{c.phone && <><br /><span className="muted">{c.phone}</span></>}</span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.removeSupportContact({ id: c.id }))}>{intl.formatMessage({ id: "common.remove", defaultMessage: "Remove" })}</button>
            </li>
          ))}
        </ul>
        <div className="grid2">
          <Field label={intl.formatMessage({ id: "plan.support.name", defaultMessage: "Name" })}><input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
          <Field label={intl.formatMessage({ id: "plan.support.phone", defaultMessage: "Phone" })}><input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
          <Field label={intl.formatMessage({ id: "plan.support.relation", defaultMessage: "Who are they?" })}><input value={contact.relation} onChange={(e) => setContact({ ...contact, relation: e.target.value })} placeholder={intl.formatMessage({ id: "plan.support.relation.placeholder", defaultMessage: "Sister, quit buddy…" })} /></Field>
        </div>
        <button type="button" className="btn ghost" disabled={!contact.name.trim()} onClick={addContact}>{intl.formatMessage({ id: "plan.support.add", defaultMessage: "Add contact" })}</button>
        <Field label={intl.formatMessage({ id: "plan.support.helpline", defaultMessage: "Helpline phone number" })}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="tel" value={quitline} onChange={(e) => setQuitline(e.target.value)} placeholder={intl.formatMessage({ id: "plan.support.helpline.placeholder", defaultMessage: "e.g. US SAMHSA 1-800-662-4357, UK Frank 0300 123 6600" })} />
            <button type="button" className="btn ghost" onClick={() => dispatch(actions.setQuitline({ phone: quitline.trim() || null }))}>{intl.formatMessage({ id: "common.save", defaultMessage: "Save" })}</button>
          </div>
        </Field>
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "plan.slips.heading", defaultMessage: "Slips" })}</h3>
        <p className="soft">{intl.formatMessage({ id: "plan.slips.intro", defaultMessage: "A slip keeps your quit date. It only adjusts your savings and restarts the health clock." })}</p>
        {slips.length === 0 ? <Empty>{intl.formatMessage({ id: "plan.slips.empty", defaultMessage: "No slips. Keep it that way, one craving at a time." })}</Empty> : (
          <ul className="list">
            {slips.map((s) => (
              <li key={s.id}>
                <span>
                  {intl.formatMessage(
                    { id: "plan.slips.entry", defaultMessage: "{units} {unit}{hasTrigger, select, yes { <soft>— {trigger}</soft>} other {}}" },
                    {
                      units: s.units,
                      unit,
                      hasTrigger: s.trigger ? "yes" : "no",
                      trigger: s.trigger ? inSentence(L.label("trigger", s.trigger), intl.locale) : "",
                      soft: (c) => <span className="soft">{c}</span>,
                    },
                  )}
                  <br /><span className="muted">{formatDateTime(s.timestamp)}</span></span>
                <button type="button" className="linkish" onClick={() => dispatch(actions.deleteSlip({ id: s.id }))}>{intl.formatMessage({ id: "common.delete", defaultMessage: "Delete" })}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {state.plan && (
        <section className="panel tint-ember stack">
          <h3>{intl.formatMessage({ id: "plan.restart.heading", defaultMessage: "Start over" })}</h3>
          <p>{intl.formatMessage({ id: "plan.restart.intro", defaultMessage: "Back to using regularly? Most people need several attempts — each one teaches you something. Your past attempts and savings stay in your history." })}</p>
          {state.pastAttempts.length > 0 && <p className="soft">{intl.formatMessage({ id: "plan.restart.previous", defaultMessage: "Previous attempts: {count}" }, { count: state.pastAttempts.length })}</p>}
          {confirmRestart ? (
            <div className="stack">
              <div className="grid2">
                <Field label={intl.formatMessage({ id: "plan.restart.newDate", defaultMessage: "New quit date" })}><input type="datetime-local" value={restartAt} onChange={(e) => setRestartAt(e.target.value)} /></Field>
                <Field label={intl.formatMessage({ id: "plan.restart.reason", defaultMessage: "What happened? (optional)" })}><input value={restartReason} onChange={(e) => setRestartReason(e.target.value)} /></Field>
              </div>
              <div className="row">
                <button type="button" className="btn ember" onClick={restart}>{intl.formatMessage({ id: "plan.restart.confirm", defaultMessage: "Start a new attempt" })}</button>
                <button type="button" className="btn ghost" onClick={() => setConfirmRestart(false)}>{intl.formatMessage({ id: "common.cancel", defaultMessage: "Cancel" })}</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirmRestart(true)}>{intl.formatMessage({ id: "plan.restart.confirm", defaultMessage: "Start a new attempt" })}</button>
          )}
        </section>
      )}
    </div>
  );
}
