import { useRef, useState } from "react";
import { exportBackup, InvalidBackupError, readBackup } from "./backup.js";
import type { QuitJourneyDocument } from "./core.js";
import { isNative, requestPermission, type NotifySettings } from "./notifications.js";

interface Props {
  doc: QuitJourneyDocument;
  settings: NotifySettings;
  onSettings: (s: NotifySettings) => void;
  onRestore: (doc: QuitJourneyDocument) => void;
}

export function MobileSettings({ doc, settings, onSettings, onRestore }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pendingRestore, setPendingRestore] = useState<QuitJourneyDocument | null>(null);

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
        <p className="soft">Get a heads-up when you reach a health milestone, a daily check-in reminder, and a warning before your riskiest time of the week.</p>
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
        <p className="soft">Your journey is stored only on this phone. Save a backup file to Drive, email or anywhere you like, and restore it on a new phone.</p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => void exportBackup(doc).catch(() => setMessage({ text: "Couldn't create the backup file.", error: true }))}>Save a backup</button>
          <button type="button" className="btn ghost" onClick={() => fileInput.current?.click()}>Restore from backup</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        {pendingRestore && (
          <div className="panel tint-ember stack">
            <p>Restoring replaces everything on this phone with the backup ({pendingRestore.state.global.cravings.length} cravings, {pendingRestore.state.global.checkIns.length} check-ins).</p>
            <div className="row">
              <button type="button" className="btn ember" onClick={() => { onRestore(pendingRestore); setPendingRestore(null); setMessage({ text: "Backup restored.", error: false }); }}>Replace with backup</button>
              <button type="button" className="btn ghost" onClick={() => setPendingRestore(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {message && <p className={message.error ? "error" : "soft"} role="status">{message.text}</p>}

      <section className="stack">
        <h3>About</h3>
        <p className="muted">
          Quit Journey supports your decision to quit; it isn't medical advice. Health timelines summarise guidance from the WHO, CDC, American Cancer Society and NHS.
          Talk to a doctor or pharmacist about quit aids and medication.
        </p>
      </section>
    </div>
  );
}
