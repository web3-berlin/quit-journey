import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "./mobile.css";
import { App as CapApp } from "@capacitor/app";
import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { QuitJourneyApp, type BackHandler } from "../../editors/quit-journey-editor/QuitJourneyApp.js";
import { useHost } from "./host.js";
import { JourneySwitcher } from "./JourneySwitcher.js";
import { LockScreen } from "./LockScreen.js";
import { BootScreen } from "./BootScreen.js";
import { LocaleListener, MobileIntlProvider } from "./MobileIntl.js";
import { MobileSettings } from "./MobileSettings.js";
import { ensureChannels, isNative, readSettings, syncNotifications, writeSettings, type NotifySettings } from "./notifications.js";
import { pinEnabled } from "./privacy.js";
import { isAndroid, QjNative } from "./native.js";
import { useJourneys } from "./store.js";
import { activeLocale, prepareTranslations } from "./translate.js";

/** Ask for the PIN again after this long in the background. */
const RELOCK_AFTER_MS = 60_000;

function App() {
  const { docs, active: doc, activeId, setActiveId, dispatch, startNew, restore, remove, flush } = useJourneys();
  const [settings, setSettings] = useState<NotifySettings>(readSettings);
  const backHandler = useRef<BackHandler | null>(null);
  const host = useHost();
  const [locked, setLocked] = useState(pinEnabled);
  const pausedAt = useRef<number | null>(null);
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const state = doc?.state.global;
  // The UI language, reported from inside QuitJourneyApp; notifications and channel names follow it.
  const [uiLocale, setUiLocale] = useState(activeLocale);

  // PIN lock on resume after more than a minute away; with a PIN, keep the app out of recent-apps previews.
  useEffect(() => {
    if (!isNative()) return;
    if (isAndroid() && pinEnabled()) void QjNative.setSecure({ on: true });
    const subs = [
      CapApp.addListener("pause", () => { pausedAt.current = Date.now(); }),
      CapApp.addListener("resume", () => {
        const away = pausedAt.current === null ? 0 : Date.now() - pausedAt.current;
        pausedAt.current = null;
        if (away > RELOCK_AFTER_MS && pinEnabled()) setLocked(true);
      }),
    ];
    return () => subs.forEach((s) => void s.then((h) => h.remove()));
  }, []);

  const registerBackHandler = useCallback((handler: BackHandler) => {
    backHandler.current = handler;
    return () => {
      if (backHandler.current === handler) backHandler.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isNative()) return;
    const subs = [
      CapApp.addListener("backButton", () => {
        if (lockedRef.current) return void CapApp.minimizeApp();
        if (!backHandler.current?.()) void CapApp.minimizeApp();
      }),
      CapApp.addListener("pause", () => void flush()),
    ];
    return () => subs.forEach((s) => void s.then((h) => h.remove()));
  }, [flush]);

  // Load the catalog for text built outside React, and (re)name the notification channels in that language.
  useEffect(() => {
    void prepareTranslations().then(() => (isNative() ? ensureChannels() : undefined)).catch((e: unknown) => console.error(e));
  }, [uiLocale]);

  // Reschedule notifications whenever any journey, the settings or the language change, and when the app resumes.
  useEffect(() => {
    if (!docs) return;
    const id = window.setTimeout(() => void syncNotifications(docs, settings).catch((e: unknown) => console.error(e)), 1500);
    const resume = isNative() ? CapApp.addListener("resume", () => void syncNotifications(docs, settings)) : null;
    return () => {
      window.clearTimeout(id);
      void resume?.then((h) => h.remove());
    };
  }, [docs, settings, uiLocale]);

  const updateSettings = useCallback((next: NotifySettings) => {
    writeSettings(next);
    setSettings(next);
  }, []);

  const lock = locked ? <MobileIntlProvider><LockScreen onUnlock={() => setLocked(false)} /></MobileIntlProvider> : null;
  if (!docs || !doc || !state || !activeId) return lock ?? <MobileIntlProvider><BootScreen /></MobileIntlProvider>;

  return (
    <>
      {lock}
      {/* Hidden rather than unmounted while locked, so half-filled forms survive. */}
      <div hidden={locked}>
        <QuitJourneyApp
          // Remount per journey so tab and form state never leak between journeys.
          key={activeId}
          state={state}
          local={doc.state.local}
          host={host}
          dispatch={dispatch}
          registerBackHandler={registerBackHandler}
          toolbar={docs.length > 1 || state.plan ? <JourneySwitcher docs={docs} activeId={activeId} onSelect={setActiveId} onNew={startNew} /> : undefined}
          settings={
            <>
              <LocaleListener onLocale={setUiLocale} />
              <MobileSettings doc={doc} journeyCount={docs.length} settings={settings} onSettings={updateSettings} onRestore={restore} onDelete={() => remove(activeId)} host={host} />
            </>
          }
        />
      </div>
    </>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
