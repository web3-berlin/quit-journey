import { generateId } from "document-model";
import { actions, localDateKey, shiftDateKey } from "document-models/quit-journey";
import { useState } from "react";
import { formatShortDuration } from "../../lib/format.js";
import type { TabProps } from "../../lib/types.js";

export function ScreenTime({ state, snapshot, dispatch, host }: TabProps) {
  const today = localDateKey(snapshot.now);
  const entries = state.screenTime ?? [];
  const todayEntry = entries.find((e) => e.date === today);
  const [minutes, setMinutes] = useState(todayEntry ? String(todayEntry.minutes) : "");
  const [message, setMessage] = useState<string | null>(null);
  const baseline = (state.plan?.unitsPerDay ?? 0) * (snapshot.profile.minutesPerUnit ?? 60);
  const week = Array.from({ length: 7 }, (_, i) => shiftDateKey(today, i - 6)).map((d) => ({ d, m: entries.find((e) => e.date === d)?.minutes ?? null }));
  const max = Math.max(baseline, 1, ...week.map((w) => w.m ?? 0));

  function save(value: number) {
    dispatch(actions.logScreenTime({ id: generateId(), date: today, minutes: value }));
  }

  async function readFromPhone() {
    const value = await host.screenTimeToday?.();
    if (value == null) {
      setMessage("Grant usage access and pick your apps in Settings → Screen time first.");
      return;
    }
    setMessage(null);
    setMinutes(String(value));
    save(value);
  }

  return (
    <section className="stack">
      <h3>Screen time</h3>
      <p className="soft">Your old average was about {formatShortDuration(baseline * 60_000)} a day. Track today's time to watch it come down.</p>
      <div className="bars" role="img" aria-label="Minutes per day, last 7 days">
        {week.map((w) => (
          <div key={w.d} title={`${w.d}: ${w.m ?? "not logged"} min`}>
            <i style={{ height: `${((w.m ?? 0) / max) * 100}%`, opacity: w.m === null ? 0.25 : 1 }} />
          </div>
        ))}
      </div>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="number" min="0" max="1440" value={minutes} onChange={(e) => setMinutes(e.target.value)} aria-label="Minutes today" placeholder="Minutes today" />
        <button type="button" className="btn ghost" onClick={() => {
          const m = Math.round(Number(minutes));
          if (m >= 0 && m <= 1440) save(m);
        }}>Save</button>
        {host.screenTimeToday && <button type="button" className="btn ghost" onClick={() => void readFromPhone()}>Read from phone</button>}
      </div>
      {message && <p className="soft">{message}</p>}
    </section>
  );
}
