import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { cid } from "../../editors/quit-journey-editor/i18n/content.js";
import { computeJourney, type QuitJourneyDocument, type QuitJourneyState } from "./core.js";
import { profileDisplayName } from "./names.js";
import { formatMessage, prepareTranslations, tc } from "./translate.js";

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

/** Creates the Android channels, or renames them in the current language (Android allows updating name and description). */
export async function ensureChannels() {
  if (Capacitor.getPlatform() !== "android") return;
  await prepareTranslations();
  await LocalNotifications.createChannel({
    id: "milestones",
    name: formatMessage({ id: "notify.channel.milestones.name", defaultMessage: "Health milestones" }),
    description: formatMessage({ id: "notify.channel.milestones.description", defaultMessage: "When your body reaches a recovery milestone" }),
    importance: 4,
  });
  await LocalNotifications.createChannel({
    id: "reminders",
    name: formatMessage({ id: "notify.channel.reminders.name", defaultMessage: "Check-in reminders" }),
    description: formatMessage({ id: "notify.channel.reminders.description", defaultMessage: "Daily check-in and risky-time heads-ups" }),
    importance: 3,
  });
  // Channel sound and importance are fixed once created; the sound lives in android/app/src/main/res/raw.
  await LocalNotifications.createChannel({
    id: SAFETY_CHANNEL,
    name: formatMessage({ id: "notify.channel.safety.name", defaultMessage: "Safety check alarms" }),
    description: formatMessage({ id: "notify.channel.safety.description", defaultMessage: "Loud alarm when a safety check you started runs out" }),
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

/** Builds the notification schedule for one journey (pure, exported for testing). Text is in the language loaded by `prepareTranslations`. */
export function buildSchedule(state: QuitJourneyState, settings: NotifySettings, now: number, journeyIndex = 0, labelled = false): LocalNotificationSchema[] {
  if (!settings.enabled) return [];
  const snap = computeJourney(state, now);
  const list: LocalNotificationSchema[] = [];

  if (snap.phase === "PREP" && snap.quitAt !== null) {
    list.push({
      id: 10,
      title: formatMessage({ id: "notify.dayOne.title", defaultMessage: "Day one starts now" }),
      body: formatMessage({ id: "notify.dayOne.body", defaultMessage: "Your journey starts today. Open the app to watch the sky clear." }),
      channelId: "milestones",
      schedule: { at: new Date(snap.quitAt), allowWhileIdle: true },
    });
  }

  snap.health
    .filter((h) => !h.reached && h.reachedAt > now + 60_000)
    .slice(0, MAX_MILESTONES)
    .forEach((h, i) => {
      list.push({
        id: MILESTONE_BASE + i,
        title: `${h.icon} ${tc(cid.milestone(h.key, "title"), h.title)}`,
        body: tc(cid.milestone(h.key, "description"), h.description),
        channelId: "milestones",
        schedule: { at: new Date(h.reachedAt), allowWhileIdle: true },
      });
    });

  const [hour, minute] = settings.reminderTime.split(":").map(Number);
  if (snap.phase !== "NOT_STARTED" && Number.isFinite(hour) && Number.isFinite(minute)) {
    list.push({
      id: 1,
      title: formatMessage({ id: "notify.checkIn.title", defaultMessage: "How was today?" }),
      body: formatMessage({ id: "notify.checkIn.body", defaultMessage: "Take 30 seconds for your check-in and keep your streak alive." }),
      channelId: "reminders",
      schedule: { on: { hour, minute }, allowWhileIdle: true },
    });
  }

  const risk = snap.insights.riskWindow;
  if (risk && snap.phase === "QUIT") {
    // 30 minutes before the window; Capacitor weekdays run 1 (Sunday) to 7 (Saturday).
    const before = risk.startHour === 0;
    const weekday = ((before ? risk.weekday + 6 : risk.weekday) % 7) + 1;
    list.push({
      id: 2,
      title: formatMessage({ id: "notify.riskTime.title", defaultMessage: "Craving time is coming up" }),
      body: formatMessage({ id: "notify.riskTime.body", defaultMessage: "This is usually a tough hour for you. Line up your best strategy now." }),
      channelId: "reminders",
      schedule: { on: { weekday, hour: before ? 23 : risk.startHour - 1, minute: 30 }, allowWhileIdle: true },
    });
  }
  // Minutes of slack are fine for reminders; exact alarms would send users to a system settings screen.
  const journey = labelled && state.plan ? profileDisplayName(state.plan, tc) : null;
  return list.map((n) => ({
    ...n,
    id: journeyIndex * JOURNEY_ID_BLOCK + n.id,
    title: journey ? formatMessage({ id: "notify.labelled", defaultMessage: "{journey}: {title}" }, { journey, title: n.title }) : n.title,
    isExactNotification: false,
  }));
}

/** Replaces all pending journey notifications with a freshly computed schedule; safety alarms are left alone. */
export async function syncNotifications(docs: QuitJourneyDocument[], settings: NotifySettings) {
  if (!isNative()) return;
  await prepareTranslations();
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
