/**
 * Meeting Guide / code4recovery JSON feeds (https://github.com/code4recovery/spec).
 * The feed URL, a cached copy and the user's favourites live only in this phone's storage.
 */
import { formatMessage } from "./translate.js";

export interface Meeting {
  key: string;
  name: string;
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
  time: string | null;
  endTime: string | null;
  place: string | null;
  address: string | null;
  online: string | null;
  types: string[];
  notes: string | null;
}

const FEED_KEY = "qj-meeting-feed";
const CACHE_KEY = "qj-meeting-cache";
const FAVS_KEY = "qj-meeting-favs";

const MAX_MEETINGS = 5000;

function str(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return null;
}

function day(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

/** Parses a feed defensively; entries without a name are dropped. */
export function parseMeetings(data: unknown): Meeting[] {
  if (!Array.isArray(data)) throw new Error(formatMessage({ id: "mobile.meetings.notAFeed", defaultMessage: "That doesn't look like a meeting feed (expected a JSON list)." }));
  const out: Meeting[] = [];
  for (const raw of data.slice(0, MAX_MEETINGS) as unknown[]) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as Record<string, unknown>;
    const name = str(m.name);
    if (!name) continue;
    const days = (Array.isArray(m.day) ? (m.day as unknown[]) : [m.day]).map(day).filter((d): d is number => d !== null);
    const address = str(m.formatted_address) ?? ([str(m.address), str(m.city)].filter(Boolean).join(", ") || null);
    const online = str(m.conference_url);
    const time = str(m.time);
    out.push({
      key: str(m.slug) ?? `${name}|${days.join(",")}|${time ?? ""}|${address ?? ""}`,
      name,
      days,
      time: time ? time.slice(0, 5) : null,
      endTime: str(m.end_time)?.slice(0, 5) ?? null,
      place: str(m.location),
      address,
      online: online && /^https:\/\//i.test(online) ? online : null,
      types: Array.isArray(m.types) ? (m.types as unknown[]).map(str).filter((t): t is string => !!t) : [],
      notes: str(m.notes),
    });
  }
  return out;
}

/** Meetings on a weekday, sorted by start time. */
export function meetingsOn(meetings: Meeting[], weekday: number): Meeting[] {
  return meetings.filter((m) => m.days.includes(weekday)).sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A big feed may not fit; the list still works until the app restarts.
  }
}

export const readFeedUrl = () => read<string>(FEED_KEY, "");
export const writeFeedUrl = (url: string) => write(FEED_KEY, url);

export function readCachedMeetings(): { fetchedAt: number; meetings: Meeting[] } | null {
  const c = read<{ fetchedAt: number; meetings: Meeting[] } | null>(CACHE_KEY, null);
  return c && Array.isArray(c.meetings) ? c : null;
}
export const writeCachedMeetings = (meetings: Meeting[], fetchedAt: number) => write(CACHE_KEY, { fetchedAt, meetings });

export const readFavourites = () => new Set(read<string[]>(FAVS_KEY, []));
export const writeFavourites = (favs: Set<string>) => write(FAVS_KEY, [...favs]);
