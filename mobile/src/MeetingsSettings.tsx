import { useMemo, useState } from "react";
import { DAY_NAMES, meetingsOn, parseMeetings, readCachedMeetings, readFavourites, readFeedUrl, writeCachedMeetings, writeFavourites, writeFeedUrl, type Meeting } from "./meetings.js";

/** Support-group meetings from a code4recovery (Meeting Guide) feed the user enters. */
export function MeetingsSettings({ fetchJson }: { fetchJson: (url: string) => Promise<unknown> }) {
  const [url, setUrl] = useState(readFeedUrl);
  const [data, setData] = useState(readCachedMeetings);
  const [favs, setFavs] = useState(readFavourites);
  const [weekday, setWeekday] = useState(() => new Date().getDay());
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const feed = url.trim();
    if (!/^https:\/\/\S+$/i.test(feed)) return setError("Enter the feed's https:// address.");
    setBusy(true);
    setError(null);
    try {
      const meetings = parseMeetings(await fetchJson(feed));
      const fetchedAt = Date.now();
      writeFeedUrl(feed);
      writeCachedMeetings(meetings, fetchedAt);
      setData({ meetings, fetchedAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load that feed.");
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

  return (
    <section className="stack">
      <h3>Meetings</h3>
      <p className="soft">
        Many AA, NA and other fellowships publish their meeting lists as a Meeting Guide (code4recovery) feed — ask your local intergroup for the JSON address. The list and your stars stay on this phone.
      </p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); void load(); }}>
        <label className="field" style={{ flex: "1 1 240px" }}>
          <span>Feed address</span>
          <input type="url" inputMode="url" placeholder="https://…/meetings.json" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button type="submit" className="btn ghost" disabled={busy} style={{ alignSelf: "flex-end" }}>{busy ? "Loading…" : data ? "Refresh" : "Load meetings"}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      {data && (
        <>
          <p className="muted">{data.meetings.length} meetings · updated {new Date(data.fetchedAt).toLocaleDateString()}</p>
          <div className="chips" role="group" aria-label="Day">
            {DAY_NAMES.map((d, i) => (
              <button key={d} type="button" className="chip" aria-pressed={weekday === i} onClick={() => setWeekday(i)}>{d.slice(0, 3)}</button>
            ))}
            <button type="button" className="chip" aria-pressed={onlyFavs} onClick={() => setOnlyFavs(!onlyFavs)}>★ Starred</button>
          </div>
          <div className="pick-list">
            {list.length === 0 ? (
              <p className="muted" style={{ padding: "8px 0" }}>{onlyFavs ? "No starred meetings on " : "No meetings on "}{DAY_NAMES[weekday]}.</p>
            ) : list.map((m) => (
              <div className="meeting" key={m.key}>
                <button type="button" className="star" aria-pressed={favs.has(m.key)} aria-label={favs.has(m.key) ? `Unstar ${m.name}` : `Star ${m.name}`} onClick={() => toggleFav(m)}>
                  {favs.has(m.key) ? "★" : "☆"}
                </button>
                <div>
                  <strong>{m.time ?? "Time n/a"}{m.endTime ? `–${m.endTime}` : ""} · {m.name}</strong>
                  {(m.place || m.address) && <p className="soft">{[m.place, m.address].filter(Boolean).join(" — ")}</p>}
                  {m.online && <p><a href={m.online} target="_blank" rel="noreferrer">Join online</a></p>}
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
