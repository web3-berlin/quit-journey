import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { exportBackup, InvalidBackupError, readBackup } from "./backup.js";
import type { QuitJourneyDocument } from "./core.js";
import { useJourneyName } from "./JourneySwitcher.js";
import type { HostCapabilities } from "../../editors/quit-journey-editor/lib/host.js";
import { MeetingsSettings } from "./MeetingsSettings.js";
import { isNative, requestPermission, type NotifySettings } from "./notifications.js";
import { PrivacySettings } from "./PrivacySettings.js";
import { ScreenTimeSettings } from "./ScreenTimeSettings.js";

interface Props {
  doc: QuitJourneyDocument;
  journeyCount: number;
  settings: NotifySettings;
  onSettings: (s: NotifySettings) => void;
  onRestore: (doc: QuitJourneyDocument) => void;
  onDelete: () => void;
  host: HostCapabilities;
}

export function MobileSettings({ doc, journeyCount, settings, onSettings, onRestore, onDelete, host }: Props) {
  const intl = useIntl();
  const journeyName = useJourneyName();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pendingRestore, setPendingRestore] = useState<QuitJourneyDocument | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function toggleNotifications(enabled: boolean) {
    if (enabled && !(await requestPermission())) {
      setMessage({ text: intl.formatMessage({ id: "mobile.notifications.blocked", defaultMessage: "Notifications are blocked. Allow them for Quit Journey in Android settings, then try again." }), error: true });
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
      setMessage({ text: e instanceof InvalidBackupError ? e.message : intl.formatMessage({ id: "mobile.backup.readFailed", defaultMessage: "Couldn't read that file." }), error: true });
    }
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <h3>{intl.formatMessage({ id: "mobile.notifications.heading", defaultMessage: "Notifications" })}</h3>
        <p className="soft">
          {intl.formatMessage({ id: "mobile.notifications.intro", defaultMessage: "Get a heads-up when you reach a recovery milestone, a daily check-in reminder, and a warning before your riskiest time of the week — for every journey." })}
        </p>
        {isNative() ? (
          <>
            <label className="row" style={{ cursor: "pointer" }}>
              <input type="checkbox" style={{ width: 22, height: 22 }} checked={settings.enabled} onChange={(e) => void toggleNotifications(e.target.checked)} />
              <span>{intl.formatMessage({ id: "mobile.notifications.enable", defaultMessage: "Send me milestone alerts and reminders" })}</span>
            </label>
            {settings.enabled && (
              <label className="field" style={{ maxWidth: 220 }}>
                <span>{intl.formatMessage({ id: "mobile.notifications.reminderTime", defaultMessage: "Daily check-in reminder" })}</span>
                <input type="time" value={settings.reminderTime} onChange={(e) => e.target.value && onSettings({ ...settings, reminderTime: e.target.value })} />
              </label>
            )}
          </>
        ) : (
          <p className="muted">{intl.formatMessage({ id: "mobile.notifications.androidOnly", defaultMessage: "Notifications are available in the Android app." })}</p>
        )}
      </section>

      {host.privacy && <PrivacySettings privacy={host.privacy} />}

      {host.screenTimeToday && host.requestUsageAccess && <ScreenTimeSettings screenTimeToday={host.screenTimeToday} requestUsageAccess={host.requestUsageAccess} />}

      {host.fetchJson && <MeetingsSettings fetchJson={host.fetchJson} />}

      <section className="stack">
        <h3>{intl.formatMessage({ id: "mobile.backup.heading", defaultMessage: "Backup" })}</h3>
        <p className="soft">
          {intl.formatMessage({ id: "mobile.backup.intro", defaultMessage: "Your journeys are stored only on this phone. Save a backup of this journey to Drive, email or anywhere you like. Restoring a backup brings it back next to your other journeys." })}
        </p>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => void exportBackup(doc).catch(() => setMessage({ text: intl.formatMessage({ id: "mobile.backup.createFailed", defaultMessage: "Couldn't create the backup file." }), error: true }))}>{intl.formatMessage({ id: "mobile.backup.save", defaultMessage: "Save a backup" })}</button>
          <button type="button" className="btn ghost" onClick={() => fileInput.current?.click()}>{intl.formatMessage({ id: "mobile.backup.restoreFrom", defaultMessage: "Restore from backup" })}</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
        {pendingRestore && (
          <div className="panel tint-ember stack">
            <p>
              {intl.formatMessage(
                { id: "mobile.backup.confirmRestore", defaultMessage: "Restore \"{name}\" ({cravings, plural, one {# craving} other {# cravings}}, {checkIns, plural, one {# check-in} other {# check-ins}})? If this journey is already on the phone, the backup replaces it." },
                { name: journeyName(pendingRestore), cravings: pendingRestore.state.global.cravings.length, checkIns: pendingRestore.state.global.checkIns.length },
              )}
            </p>
            <div className="row">
              <button type="button" className="btn ember" onClick={() => { onRestore(pendingRestore); setPendingRestore(null); setMessage({ text: intl.formatMessage({ id: "mobile.backup.restored", defaultMessage: "Backup restored." }), error: false }); }}>{intl.formatMessage({ id: "mobile.backup.restore", defaultMessage: "Restore backup" })}</button>
              <button type="button" className="btn ghost" onClick={() => setPendingRestore(null)}>{intl.formatMessage({ id: "mobile.common.cancel", defaultMessage: "Cancel" })}</button>
            </div>
          </div>
        )}
      </section>

      {message && <p className={message.error ? "error" : "soft"} role="status">{message.text}</p>}

      <section className="stack">
        <h3>{intl.formatMessage({ id: "mobile.delete.heading", defaultMessage: "Delete this journey" })}</h3>
        <p className="soft">
          {journeyCount > 1
            ? intl.formatMessage(
              { id: "mobile.delete.introOthers", defaultMessage: "Removes \"{name}\" and everything logged in it from this phone; your other journeys stay. Save a backup first if you might want it back." },
              { name: journeyName(doc) },
            )
            : intl.formatMessage(
              { id: "mobile.delete.intro", defaultMessage: "Removes \"{name}\" and everything logged in it from this phone. Save a backup first if you might want it back." },
              { name: journeyName(doc) },
            )}
        </p>
        {confirmDelete ? (
          <div className="row">
            <button type="button" className="btn ember" onClick={() => { setConfirmDelete(false); onDelete(); }}>{intl.formatMessage({ id: "mobile.delete.confirm", defaultMessage: "Delete permanently" })}</button>
            <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>{intl.formatMessage({ id: "mobile.common.cancel", defaultMessage: "Cancel" })}</button>
          </div>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setConfirmDelete(true)}>{intl.formatMessage({ id: "mobile.delete.heading", defaultMessage: "Delete this journey" })}</button>
        )}
      </section>

      <section className="stack">
        <h3>{intl.formatMessage({ id: "mobile.about.heading", defaultMessage: "About" })}</h3>
        <p className="muted">
          {intl.formatMessage({ id: "mobile.about.disclaimer", defaultMessage: "Quit Journey supports your recovery; it isn't medical advice or treatment. Recovery timelines summarise public-health guidance (WHO, CDC, NHS, NIAAA, NIDA, SAMHSA) and the studies named on each timeline." })}{" "}
          {intl.formatMessage({ id: "mobile.about.medical", defaultMessage: "Talk to a doctor or pharmacist about medication, and never stop alcohol or benzodiazepines suddenly after heavy use without medical advice. In an emergency, call your local emergency number." })}
        </p>
      </section>
    </div>
  );
}
