import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "./mobile.css";
import { App as CapApp } from "@capacitor/app";
import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { QuitJourneyApp, type BackHandler } from "../../editors/quit-journey-editor/QuitJourneyApp.js";
import { MobileSettings } from "./MobileSettings.js";
import { ensureChannels, isNative, readSettings, syncNotifications, writeSettings, type NotifySettings } from "./notifications.js";
import { useQuitDocument } from "./store.js";

function App() {
  const { doc, dispatch, replace, flush } = useQuitDocument();
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

  // Reschedule notifications whenever the journey or settings change, and when the app resumes.
  useEffect(() => {
    if (!state) return;
    const id = window.setTimeout(() => void syncNotifications(state, settings).catch((e: unknown) => console.error(e)), 1500);
    const resume = isNative() ? CapApp.addListener("resume", () => void syncNotifications(state, settings)) : null;
    return () => {
      window.clearTimeout(id);
      void resume?.then((h) => h.remove());
    };
  }, [state, settings]);

  const updateSettings = useCallback((next: NotifySettings) => {
    writeSettings(next);
    setSettings(next);
  }, []);

  if (!doc || !state) return <div className="boot" aria-busy="true" />;

  return (
    <QuitJourneyApp
      state={state}
      dispatch={dispatch}
      registerBackHandler={registerBackHandler}
      settings={<MobileSettings doc={doc} settings={settings} onSettings={updateSettings} onRestore={replace} />}
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
