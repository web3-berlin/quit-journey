import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { formatDate } from "../../editors/quit-journey-editor/lib/format.js";
import { meetingsOn, parseMeetings, readCachedMeetings, readFavourites, readFeedUrl, writeCachedMeetings, writeFavourites, writeFeedUrl, type Meeting } from "./meetings.js";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
/** 2023-01-01 was a Sunday. */
const weekdayDate = (day: number) => new Date(2023, 0, 1 + day);

/** Support-group meetings from a code4recovery (Meeting Guide) feed the user enters. */
export function MeetingsSettings({ fetchJson }: { fetchJson: (url: string) => Promise<unknown> }) {
  const intl = useIntl();
  const [url, setUrl] = useState(readFeedUrl);
  const [data, setData] = useState(readCachedMeetings);
  const [favs, setFavs] = useState(readFavourites);
  const [weekday, setWeekday] = useState(() => new Date().getDay());
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const feed = url.trim();
    if (!/^https:\/\/\S+$/i.test(feed)) return setError(intl.formatMessage({ id: "mobile.meetings.enterHttps", defaultMessage: "Enter the feed's https:// address." }));
    setBusy(true);
    setError(null);
    try {
      const meetings = parseMeetings(await fetchJson(feed));
      const fetchedAt = Date.now();
      writeFeedUrl(feed);
      writeCachedMeetings(meetings, fetchedAt);
      setData({ meetings, fetchedAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : intl.formatMessage({ id: "mobile.meetings.loadFailed", defaultMessage: "Couldn't load that feed." }));
    } finally {
      setBusy(false);
    }
  }

  function toggleFav(m: Meeting) {
    const next = new Set(favs);
    if (next.has(m.key)) next.delete(m.key);
    else next.add(m.key);
    setFavs(next);
    writeFavourites(next);
  }

  const list = useMemo(() => {
    const day = data ? meetingsOn(data.meetings, weekday) : [];
    return onlyFavs ? day.filter((m) => favs.has(m.key)) : day;
  }, [data, weekday, onlyFavs, favs]);

  const dayName = intl.formatDate(weekdayDate(weekday), { weekday: "long" });

  function meetingTitle(m: Meeting): string {
    const time = m.time
      ? m.endTime
        ? intl.formatMessage({ id: "mobile.meetings.timeRange", defaultMessage: "{start}–{end}" }, { start: m.time, end: m.endTime })
        : m.time
      : intl.formatMessage({ id: "mobile.meetings.noTime", defaultMessage: "Time n/a" });
    return intl.formatMessage({ id: "mobile.meetings.title", defaultMessage: "{time} · {name}" }, { time, name: m.name });
  }

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "mobile.meetings.heading", defaultMessage: "Meetings" })}</h3>
      <p className="soft">
        {intl.formatMessage({ id: "mobile.meetings.intro", defaultMessage: "Many AA, NA and other fellowships publish their meeting lists as a Meeting Guide (code4recovery) feed — ask your local intergroup for the JSON address. The list and your stars stay on this phone." })}
      </p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); void load(); }}>
        <label className="field" style={{ flex: "1 1 240px" }}>
          <span>{intl.formatMessage({ id: "mobile.meetings.feedLabel", defaultMessage: "Feed address" })}</span>
          <input type="url" inputMode="url" placeholder="https://…/meetings.json" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button type="submit" className="btn ghost" disabled={busy} style={{ alignSelf: "flex-end" }}>
          {busy
            ? intl.formatMessage({ id: "mobile.meetings.loading", defaultMessage: "Loading…" })
            : data
              ? intl.formatMessage({ id: "mobile.meetings.refresh", defaultMessage: "Refresh" })
              : intl.formatMessage({ id: "mobile.meetings.load", defaultMessage: "Load meetings" })}
        </button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      {data && (
        <>
          <p className="muted">
            {intl.formatMessage(
              { id: "mobile.meetings.summary", defaultMessage: "{count, plural, one {# meeting} other {# meetings}} · updated {date}" },
              { count: data.meetings.length, date: formatDate(data.fetchedAt) },
            )}
          </p>
          <div className="chips" role="group" aria-label={intl.formatMessage({ id: "mobile.meetings.dayLabel", defaultMessage: "Day" })}>
            {WEEKDAYS.map((i) => (
              <button key={i} type="button" className="chip" aria-pressed={weekday === i} onClick={() => setWeekday(i)}>
                {intl.formatDate(weekdayDate(i), { weekday: "short" })}
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={onlyFavs} onClick={() => setOnlyFavs(!onlyFavs)}>
              {intl.formatMessage({ id: "mobile.meetings.starredFilter", defaultMessage: "★ Starred" })}
            </button>
          </div>
          <div className="pick-list">
            {list.length === 0 ? (
              <p className="muted" style={{ padding: "8px 0" }}>
                {onlyFavs
                  ? intl.formatMessage({ id: "mobile.meetings.noneStarred", defaultMessage: "No starred meetings on {day}." }, { day: dayName })
                  : intl.formatMessage({ id: "mobile.meetings.none", defaultMessage: "No meetings on {day}." }, { day: dayName })}
              </p>
            ) : list.map((m) => (
              <div className="meeting" key={m.key}>
                <button
                  type="button"
                  className="star"
                  aria-pressed={favs.has(m.key)}
                  aria-label={favs.has(m.key)
                    ? intl.formatMessage({ id: "mobile.meetings.unstar", defaultMessage: "Unstar {name}" }, { name: m.name })
                    : intl.formatMessage({ id: "mobile.meetings.star", defaultMessage: "Star {name}" }, { name: m.name })}
                  onClick={() => toggleFav(m)}
                >
                  {favs.has(m.key) ? "★" : "☆"}
                </button>
                <div>
                  <strong>{meetingTitle(m)}</strong>
                  {(m.place || m.address) && <p className="soft">{[m.place, m.address].filter(Boolean).join(" — ")}</p>}
                  {m.online && <p><a href={m.online} target="_blank" rel="noreferrer">{intl.formatMessage({ id: "mobile.meetings.joinOnline", defaultMessage: "Join online" })}</a></p>}
                  {m.notes && <p className="muted">{m.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
