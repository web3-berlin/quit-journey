import { generateId } from "document-model";
import { actions, localDateKey, shiftDateKey } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { formatShortDuration } from "../../lib/format.js";
import type { TabProps } from "../../lib/types.js";

export function ScreenTime({ state, snapshot, dispatch, host }: TabProps) {
  const intl = useIntl();
  const today = localDateKey(snapshot.now);
  const entries = state.screenTime ?? [];
  const todayEntry = entries.find((e) => e.date === today);
  const [minutes, setMinutes] = useState(todayEntry ? String(todayEntry.minutes) : "");
  const [message, setMessage] = useState<string | null>(null);
  const baseline = (state.plan?.unitsPerDay ?? 0) * (snapshot.profile.minutesPerUnit ?? 60);
  const week = Array.from({ length: 7 }, (_, i) => shiftDateKey(today, i - 6)).map((d) => ({ d, m: entries.find((e) => e.date === d)?.minutes ?? null }));
  const max = Math.max(baseline, 1, ...week.map((w) => w.m ?? 0));

  const minutesToday = intl.formatMessage({ id: "toolkit.screenTime.minutesToday", defaultMessage: "Minutes today" });

  function save(value: number) {
    dispatch(actions.logScreenTime({ id: generateId(), date: today, minutes: value }));
  }

  async function readFromPhone() {
    const value = await host.screenTimeToday?.();
    if (value == null) {
      setMessage(intl.formatMessage({ id: "toolkit.screenTime.grantAccess", defaultMessage: "Grant usage access and pick your apps in Settings → Screen time first." }));
      return;
    }
    setMessage(null);
    setMinutes(String(value));
    save(value);
  }

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.screenTime.heading", defaultMessage: "Screen time" })}</h3>
      <p className="soft">
        {intl.formatMessage(
          { id: "toolkit.screenTime.intro", defaultMessage: "Your old average was about {duration} a day. Track today's time to watch it come down." },
          { duration: formatShortDuration(baseline * 60_000) },
        )}
      </p>
      <div className="bars" role="img" aria-label={intl.formatMessage({ id: "toolkit.screenTime.chartLabel", defaultMessage: "Minutes per day, last 7 days" })}>
        {week.map((w) => (
          <div key={w.d} title={w.m === null
            ? intl.formatMessage({ id: "toolkit.screenTime.barNotLogged", defaultMessage: "{date}: not logged" }, { date: w.d })
            : intl.formatMessage({ id: "toolkit.screenTime.barMinutes", defaultMessage: "{date}: {minutes} min" }, { date: w.d, minutes: w.m })}>
            <i style={{ height: `${((w.m ?? 0) / max) * 100}%`, opacity: w.m === null ? 0.25 : 1 }} />
          </div>
        ))}
      </div>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="number" min="0" max="1440" value={minutes} onChange={(e) => setMinutes(e.target.value)} aria-label={minutesToday} placeholder={minutesToday} />
        <button type="button" className="btn ghost" onClick={() => {
          const m = Math.round(Number(minutes));
          if (m >= 0 && m <= 1440) save(m);
        }}>{intl.formatMessage({ id: "toolkit.screenTime.save", defaultMessage: "Save" })}</button>
        {host.screenTimeToday && <button type="button" className="btn ghost" onClick={() => void readFromPhone()}>{intl.formatMessage({ id: "toolkit.screenTime.readFromPhone", defaultMessage: "Read from phone" })}</button>}
      </div>
      {message && <p className="soft">{message}</p>}
    </section>
  );
}
