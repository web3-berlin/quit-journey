import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { computeJourney, type QuitJourneyDocument, type QuitJourneyState } from "./core.js";

export interface NotifySettings {
  enabled: boolean;
  /** Daily check-in reminder time, "HH:MM". */
  reminderTime: string;
}

const KEY = "qj-notify-settings";
const DEFAULTS: NotifySettings = { enabled: false, reminderTime: "20:00" };

export function readSettings(): NotifySettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<NotifySettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function writeSettings(settings: NotifySettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Settings are a convenience; the journey itself lives in the document.
  }
}

export const isNative = () => Capacitor.isNativePlatform();

export async function ensureChannels() {
  if (Capacitor.getPlatform() !== "android") return;
  await LocalNotifications.createChannel({ id: "milestones", name: "Health milestones", description: "When your body reaches a recovery milestone", importance: 4 });
  await LocalNotifications.createChannel({ id: "reminders", name: "Check-in reminders", description: "Daily check-in and risky-time heads-ups", importance: 3 });
  // Channel sound and importance are fixed once created; the sound lives in android/app/src/main/res/raw.
  await LocalNotifications.createChannel({
    id: SAFETY_CHANNEL, name: "Safety check alarms", description: "Loud alarm when a safety check you started runs out",
    importance: 5, visibility: 0, vibration: true, sound: "safety_alarm.wav", lights: true, lightColor: "#D9483B",
  });
}

export const SAFETY_CHANNEL = "safety";

/** Safety alarms use their own id range so journey schedules (blocks of 10,000 from 0) never touch them. */
const SAFETY_ID_MIN = 900_000;
const SAFETY_ID_SPAN = 100_000;

/** Stable notification id for a safety check (FNV-1a hash of its id, inside the reserved range). */
export function safetyNotificationId(checkId: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < checkId.length; i++) {
    h ^= checkId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return SAFETY_ID_MIN + (h % SAFETY_ID_SPAN);
}

export const isSafetyNotificationId = (id: number) => id >= SAFETY_ID_MIN && id < SAFETY_ID_MIN + SAFETY_ID_SPAN;

/** Asks for notification permission; resolves to whether it was granted. */
export async function requestPermission(): Promise<boolean> {
  if (!isNative()) return false;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === "granted") return true;
  const asked = await LocalNotifications.requestPermissions();
  return asked.display === "granted";
}

const MILESTONE_BASE = 1000;
const MAX_MILESTONES = 12;

/** Each journey gets its own block of notification ids. */
const JOURNEY_ID_BLOCK = 10_000;

/** Builds the notification schedule for one journey (pure, exported for testing). */
export function buildSchedule(state: QuitJourneyState, settings: NotifySettings, now: number, journeyIndex = 0, labelled = false): LocalNotificationSchema[] {
  if (!settings.enabled) return [];
  const snap = computeJourney(state, now);
  const list: LocalNotificationSchema[] = [];

  if (snap.phase === "PREP" && snap.quitAt !== null) {
    list.push({ id: 10, title: "Day one starts now", body: "Your journey starts today. Open the app to watch the sky clear.", channelId: "milestones", schedule: { at: new Date(snap.quitAt), allowWhileIdle: true } });
  }

  snap.health
    .filter((h) => !h.reached && h.reachedAt > now + 60_000)
    .slice(0, MAX_MILESTONES)
    .forEach((h, i) => {
      list.push({ id: MILESTONE_BASE + i, title: `${h.icon} ${h.title}`, body: h.description, channelId: "milestones", schedule: { at: new Date(h.reachedAt), allowWhileIdle: true } });
    });

  const [hour, minute] = settings.reminderTime.split(":").map(Number);
  if (snap.phase !== "NOT_STARTED" && Number.isFinite(hour) && Number.isFinite(minute)) {
    list.push({ id: 1, title: "How was today?", body: "Take 30 seconds for your check-in and keep your streak alive.", channelId: "reminders", schedule: { on: { hour, minute }, allowWhileIdle: true } });
  }

  const risk = snap.insights.riskWindow;
  if (risk && snap.phase === "QUIT") {
    // 30 minutes before the window; Capacitor weekdays run 1 (Sunday) to 7 (Saturday).
    const before = risk.startHour === 0;
    const weekday = ((before ? risk.weekday + 6 : risk.weekday) % 7) + 1;
    list.push({
      id: 2, title: "Craving time is coming up", body: "This is usually a tough hour for you. Line up your best strategy now.", channelId: "reminders",
      schedule: { on: { weekday, hour: before ? 23 : risk.startHour - 1, minute: 30 }, allowWhileIdle: true },
    });
  }
  // Minutes of slack are fine for reminders; exact alarms would send users to a system settings screen.
  return list.map((n) => ({
    ...n,
    id: journeyIndex * JOURNEY_ID_BLOCK + n.id,
    title: labelled ? `${snap.profile.name}: ${n.title}` : n.title,
    isExactNotification: false,
  }));
}

/** Replaces all pending journey notifications with a freshly computed schedule; safety alarms are left alone. */
export async function syncNotifications(docs: QuitJourneyDocument[], settings: NotifySettings) {
  if (!isNative()) return;
  const pending = await LocalNotifications.getPending();
  const stale = pending.notifications.filter((n) => !isSafetyNotificationId(n.id));
  if (stale.length) {
    await LocalNotifications.cancel({ notifications: stale.map((n) => ({ id: n.id })) });
  }
  const now = Date.now();
  const started = docs.filter((d) => d.state.global.plan);
  const schedule = started.flatMap((d, i) => buildSchedule(d.state.global, settings, now, i, started.length > 1));
  if (schedule.length) await LocalNotifications.schedule({ notifications: schedule });
}
