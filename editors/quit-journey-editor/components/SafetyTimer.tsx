import { generateId } from "document-model";
import { actions, helplinesFor } from "document-models/quit-journey";
import { useEffect, useState } from "react";
import { startAlarm } from "../lib/alarm.js";
import { pad2 } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";

const DURATIONS = [5, 10, 15, 30, 60];

/**
 * "Check on me": a countdown before using. If the user doesn't confirm they're OK,
 * the phone alarms loudly and offers one tap to message a contact. It cannot contact
 * anyone by itself — staffed hotlines like Never Use Alone are the proven option.
 */
export function SafetyTimer({ state, local, snapshot, dispatch, host }: TabProps) {
  const contacts = state.supportContacts.filter((c) => c.phone);
  const [minutes, setMinutes] = useState(15);
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [late, setLate] = useState(false);
  const active = (local.safetyChecks ?? []).find((c) => c.outcome === "ACTIVE") ?? null;
  const endsAt = active ? Date.parse(active.startedAt) + active.durationMinutes * 60_000 : null;
  const overdue = endsAt !== null && snapshot.now >= endsAt;
  const contact = active ? state.supportContacts.find((c) => active.contactIds.includes(c.id)) ?? null : null;
  const hotlines = helplinesFor(snapshot.profile.key).filter((h) => /never use alone|nors/i.test(h.name));

  useEffect(() => {
    if (!overdue) return;
    return startAlarm();
  }, [overdue]);

  function start() {
    const id = generateId();
    const startedAt = new Date().toISOString();
    dispatch(actions.startSafetyCheck({ id, startedAt, durationMinutes: minutes, note: note.trim() || null, contactIds: contactId ? [contactId] : [] }));
    const picked = state.supportContacts.find((c) => c.id === contactId);
    void host.scheduleSafetyAlarm?.(id, new Date(Date.parse(startedAt) + minutes * 60_000), picked?.name ?? null).then((r) => setLate(r ? !r.exact : false));
  }

  function end(outcome: "OK" | "ALARM" | "CANCELLED") {
    if (!active) return;
    dispatch(actions.endSafetyCheck({ id: active.id, endedAt: new Date().toISOString(), outcome }));
    void host.cancelSafetyAlarm?.(active.id);
  }

  function messageContact() {
    if (!contact?.phone) return;
    const body = `I started a safety check in my recovery app and didn't respond. Please check on me now.${active?.note ? ` I'm at: ${active.note}` : ""}`;
    if (host.composeMessage) host.composeMessage(contact.phone, body);
    else window.location.href = `sms:${contact.phone}?body=${encodeURIComponent(body)}`;
    end("ALARM");
  }

  if (active && endsAt !== null) {
    const left = Math.max(0, Math.ceil((endsAt - snapshot.now) / 1000));
    return (
      <section className={overdue ? "panel tint-ember stack" : "panel stack"} role={overdue ? "alert" : undefined}>
        <h3>{overdue ? "Are you OK?" : "Check on me is running"}</h3>
        <p style={{ fontFamily: "var(--display)", fontSize: "2.2rem", fontWeight: 800 }}>
          {overdue ? "Time's up" : `${Math.floor(left / 60)}:${pad2(left % 60)}`}
        </p>
        {late && !overdue && <p className="error">Your phone may ring this alarm a few minutes late. Allow "Alarms &amp; reminders" for this app in Android settings so it rings on time.</p>}
        {overdue && <p>Tap "I'm OK" to stop the alarm. If someone is with you and you can't be woken, they should call emergency services and give naloxone.</p>}
        <div className="row">
          <button type="button" className="btn" onClick={() => end("OK")}>I'm OK</button>
          {contact?.phone && <button type="button" className="btn ember" onClick={messageContact}>Message {contact.name}</button>}
          {!overdue && <button type="button" className="btn ghost" onClick={() => end("CANCELLED")}>Cancel</button>}
        </div>
      </section>
    );
  }

  return (
    <section className="panel stack">
      <h3>Check on me</h3>
      <p className="soft">
        If you're going to use, don't use alone. Start a timer: if you don't tap "I'm OK" in time, your phone alarms loudly so someone nearby can help,
        and you can message your contact with one tap. The app can't call anyone by itself.
        {host.scheduleSafetyAlarm && " The first time, Android asks you to allow \"Alarms & reminders\" so the alarm rings on the minute."}
      </p>
      <div className="chips" role="group" aria-label="Minutes">
        {DURATIONS.map((m) => (
          <button key={m} type="button" className="chip" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>{m} min</button>
        ))}
      </div>
      <div className="grid2">
        {contacts.length > 0 && (
          <label className="field">
            <span>Who should I message?</span>
            <select value={contactId} onChange={(e) => setContactId(e.target.value)}>
              <option value="">Nobody</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        <label className="field">
          <span>Where are you? (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. my flat, back room" />
        </label>
      </div>
      <button type="button" className="btn" onClick={start}>Start {minutes}-minute check</button>
      {hotlines.length > 0 && (
        <p className="soft">
          Better: a person on the line.{" "}
          {hotlines.map((h, n) => (
            <span key={h.key}>{n > 0 && ", "}<a href={`tel:${h.phone}`}>{h.name} ({h.region}) {h.phone}</a></span>
          ))}
        </p>
      )}
    </section>
  );
}
