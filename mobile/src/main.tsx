import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "./mobile.css";
import { App as CapApp } from "@capacitor/app";
import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { QuitJourneyApp, type BackHandler } from "../../editors/quit-journey-editor/QuitJourneyApp.js";
import { JourneySwitcher } from "./JourneySwitcher.js";
import { MobileSettings } from "./MobileSettings.js";
import { ensureChannels, isNative, readSettings, syncNotifications, writeSettings, type NotifySettings } from "./notifications.js";
import { useJourneys } from "./store.js";

function App() {
  const { docs, active: doc, activeId, setActiveId, dispatch, startNew, restore, remove, flush } = useJourneys();
  const [settings, setSettings] = useState<NotifySettings>(readSettings);
  const backHandler = useRef<BackHandler | null>(null);
  const state = doc?.state.global;

  const registerBackHandler = useCallback((handler: BackHandler) => {
    backHandler.current = handler;
    return () => {
      if (backHandler.current === handler) backHandler.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isNative()) return;
    void ensureChannels();
    const subs = [
      CapApp.addListener("backButton", () => {
        if (!backHandler.current?.()) void CapApp.minimizeApp();
      }),
      CapApp.addListener("pause", () => void flush()),
    ];
    return () => subs.forEach((s) => void s.then((h) => h.remove()));
  }, [flush]);

  // Reschedule notifications whenever any journey or the settings change, and when the app resumes.
  useEffect(() => {
    if (!docs) return;
    const id = window.setTimeout(() => void syncNotifications(docs, settings).catch((e: unknown) => console.error(e)), 1500);
    const resume = isNative() ? CapApp.addListener("resume", () => void syncNotifications(docs, settings)) : null;
    return () => {
      window.clearTimeout(id);
      void resume?.then((h) => h.remove());
    };
  }, [docs, settings]);

  const updateSettings = useCallback((next: NotifySettings) => {
    writeSettings(next);
    setSettings(next);
  }, []);

  if (!docs || !doc || !state || !activeId) return <div className="boot" aria-busy="true" />;

  return (
    <QuitJourneyApp
      // Remount per journey so tab and form state never leak between journeys.
      key={activeId}
      state={state}
      dispatch={dispatch}
      registerBackHandler={registerBackHandler}
      toolbar={docs.length > 1 || state.plan ? <JourneySwitcher docs={docs} activeId={activeId} onSelect={setActiveId} onNew={startNew} /> : undefined}
      settings={
        <MobileSettings doc={doc} journeyCount={docs.length} settings={settings} onSettings={updateSettings} onRestore={restore} onDelete={() => remove(activeId)} />
      }
    />
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
