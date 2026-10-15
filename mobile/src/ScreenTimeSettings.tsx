import { App as CapApp } from "@capacitor/app";
import { useCallback, useEffect, useState } from "react";
import { hasUsageAccess, listLaunchableApps, readScreenTimeApps, writeScreenTimeApps } from "./host.js";
import type { LaunchableApp } from "./native.js";

/** Grant usage access and choose which apps count towards screen time. */
export function ScreenTimeSettings({ screenTimeToday, requestUsageAccess }: { screenTimeToday: () => Promise<number | null>; requestUsageAccess: () => Promise<void> }) {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [apps, setApps] = useState<LaunchableApp[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(readScreenTimeApps()));
  const [picking, setPicking] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setGranted(await hasUsageAccess());
    setMinutes(await screenTimeToday());
  }, [screenTimeToday]);

  // Re-check after the user comes back from the system settings screen.
  useEffect(() => {
    void refresh();
    const sub = CapApp.addListener("resume", () => void refresh());
    return () => void sub.then((h) => h.remove());
  }, [refresh]);

  async function openPicker() {
    setPicking(true);
    if (!apps) setApps(await listLaunchableApps());
  }

  function toggle(pkg: string, on: boolean) {
    const next = new Set(chosen);
    if (on) next.add(pkg);
    else next.delete(pkg);
    setChosen(next);
    writeScreenTimeApps([...next]);
    void screenTimeToday().then(setMinutes);
  }

  return (
    <section className="stack">
      <h3>Screen time</h3>
      <p className="soft">For gaming or social-media journeys: count today's minutes in the apps you pick. Android needs "usage access" for this; the numbers never leave your phone.</p>
      {granted === false && (
        <button type="button" className="btn ghost" onClick={() => void requestUsageAccess()}>Allow usage access</button>
      )}
      {granted && (
        <>
          <p>{chosen.size === 0 ? "No apps chosen yet." : `${chosen.size} app${chosen.size === 1 ? "" : "s"} counted · ${minutes ?? 0} min today`}</p>
          {picking ? (
            <>
              <div className="pick-list" role="group" aria-label="Apps that count">
                {apps === null ? <p className="muted">Loading apps…</p> : apps.map((a) => (
                  <label key={a.packageName}>
                    <input type="checkbox" checked={chosen.has(a.packageName)} onChange={(e) => toggle(a.packageName, e.target.checked)} />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
              <button type="button" className="btn ghost" onClick={() => setPicking(false)}>Done</button>
            </>
          ) : (
            <button type="button" className="btn ghost" onClick={() => void openPicker()}>Choose apps</button>
          )}
        </>
      )}
    </section>
  );
}
