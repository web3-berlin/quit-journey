import { useRef, useState } from "react";
import { exportBackup, InvalidBackupError, readBackup } from "./backup.js";
import type { QuitJourneyDocument } from "./core.js";
import { journeyName } from "./JourneySwitcher.js";
import { isNative, requestPermission, type NotifySettings } from "./notifications.js";

interface Props {
  doc: QuitJourneyDocument;
  journeyCount: number;
  settings: NotifySettings;
  onSettings: (s: NotifySettings) => void;
  onRestore: (doc: QuitJourneyDocument) => void;
  onDelete: () => void;
}

export function MobileSettings({ doc, journeyCount, settings, onSettings, onRestore, onDelete }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pendingRestore, setPendingRestore] = useState<QuitJourneyDocument | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function toggleNotifications(enabled: boolean) {
    if (enabled && !(await requestPermission())) {
      setMessage({ text: "Notifications are blocked. Allow them for Quit Journey in Android settings, then try again.", error: true });
      return;
    }
    setMessage(null);
    onSettings({ ...settings, enabled });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      setPendingRestore(await readBackup(file));
      setMessage(null);
    } catch (e) {
      setMessage({ text: e instanceof InvalidBackupError ? e.message : "Couldn't read that file.", error: true });
    }
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <h3>Notifications</h3>
        <p className="soft">Get a heads-up when you reach a recovery milestone, a daily check-in reminder, and a warning before your riskiest time of the week — for every journey.</p>
        {isNative() ? (
          <>
            <label className="row" style={{ cursor: "pointer" }}>
              <input type="checkbox" style={{ width: 22, height: 22 }} checked={settings.enabled} onChange={(e) => void toggleNotifications(e.target.checked)} />
              <span>Send me milestone alerts and reminders</span>
            </label>
            {settings.enabled && (
              <label className="field" style={{ maxWidth: 220 }}>
                <span>Daily check-in reminder</span>
                <input type="time" value={settings.reminderTime} onChange={(e) => e.target.value && onSettings({ ...settings, reminderTime: e.target.value })} />
              </label>
            )}
          </>
        ) : (
          <p className="muted">Notifications are available in the Android app.</p>
        )}
      </section>

      <section className="stack">
        <h3>Backup</h3>
        <p className="soft">Your journeys are stored only on this phone. Save a backup of this journey to Drive, email or anywhere you like. Restoring a backup brings it back next to your other journeys.</p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => void exportBackup(doc).catch(() => setMessage({ text: "Couldn't create the backup file.", error: true }))}>Save a backup</button>
          <button type="button" className="btn ghost" onClick={() => fileInput.current?.click()}>Restore from backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        {pendingRestore && (
          <div className="panel tint-ember stack">
            <p>Restore "{journeyName(pendingRestore)}" ({pendingRestore.state.global.cravings.length} cravings, {pendingRestore.state.global.checkIns.length} check-ins)? If this journey is already on the phone, the backup replaces it.</p>
            <div className="row">
              <button type="button" className="btn ember" onClick={() => { onRestore(pendingRestore); setPendingRestore(null); setMessage({ text: "Backup restored.", error: false }); }}>Restore backup</button>
              <button type="button" className="btn ghost" onClick={() => setPendingRestore(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {message && <p className={message.error ? "error" : "soft"} role="status">{message.text}</p>}

      <section className="stack">
        <h3>Delete this journey</h3>
        <p className="soft">
          Removes "{journeyName(doc)}" and everything logged in it from this phone{journeyCount > 1 ? "; your other journeys stay" : ""}. Save a backup first if you might want it back.
        </p>
        {confirmDelete ? (
          <div className="row">
            <button type="button" className="btn ember" onClick={() => { setConfirmDelete(false); onDelete(); }}>Delete permanently</button>
            <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setConfirmDelete(true)}>Delete this journey</button>
        )}
      </section>

      <section className="stack">
        <h3>About</h3>
        <p className="muted">
          Quit Journey supports your recovery; it isn't medical advice or treatment. Recovery timelines summarise public-health guidance (WHO, CDC, NHS, NIAAA, NIDA, SAMHSA) and the studies named on each timeline.
          Talk to a doctor or pharmacist about medication, and never stop alcohol or benzodiazepines suddenly after heavy use without medical advice. In an emergency, call your local emergency number.
        </p>
      </section>
    </div>
  );
}
