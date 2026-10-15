/**
 * The Android app's implementation of the shared UI's HostCapabilities.
 * Everything runs on the device; the only network use is fetching a meeting feed the user entered.
 */
import { CapacitorHttp } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { useEffect, useMemo, useState } from "react";
import type { HostCapabilities } from "../../editors/quit-journey-editor/lib/host.js";
import { isAndroid, QjNative, type LaunchableApp } from "./native.js";
import { isNative, requestPermission, safetyNotificationId, SAFETY_CHANNEL } from "./notifications.js";
import { cachedDisguisedIcon, pinEnabled, readDisguisedIcon, setDisguisedIcon, setPin } from "./privacy.js";

// ---- Safety alarms ----------------------------------------------------------

async function scheduleSafetyAlarm(checkId: string, at: Date, contactName: string | null): Promise<{ exact: boolean }> {
  if (!(await requestPermission())) throw new Error("Notifications are blocked for this app.");
  const id = safetyNotificationId(checkId);
  // Discreet wording when the icon is disguised: the alarm still rings, but doesn't name the app's purpose.
  const discreet = cachedDisguisedIcon();
  const body = discreet
    ? "Time to check in."
    : contactName
      ? `Your safety check is up. Open the app to say you're OK, or message ${contactName}.`
      : "Your safety check is up. Open the app to say you're OK.";
  const result = await LocalNotifications.schedule({
    notifications: [{
      id,
      title: discreet ? "Reminder" : "Safety check",
      body,
      channelId: SAFETY_CHANNEL,
      // Exact: an inexact alarm was measured arriving minutes late, which defeats an overdose safety timer.
      // The first time, the plugin opens Android's "Alarms & reminders" screen; if declined it falls back to inexact.
      schedule: { at: new Date(Math.max(at.getTime(), Date.now() + 1000)), allowWhileIdle: true },
      isExactNotification: true,
      ongoing: false,
      autoCancel: true,
      extra: { kind: "safety", checkId },
    }],
  });
  return { exact: !result.warning };
}

async function cancelSafetyAlarm(checkId: string): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id: safetyNotificationId(checkId) }] });
}

// ---- Messaging, location, sharing, network ---------------------------------

function composeMessage(phone: string, body: string): void {
  if (isAndroid()) {
    void QjNative.composeSms({ phone, body }).catch((e: unknown) => console.error(e));
    return;
  }
  window.location.href = `sms:${encodeURIComponent(phone)}?body=${encodeURIComponent(body)}`;
}

/** Foreground ("while using the app") position; null when the user declines or it times out. */
async function currentPosition(): Promise<{ lat: number; lng: number } | null> {
  let precise = true;
  try {
    if (isNative()) {
      let perm = await Geolocation.checkPermissions();
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        perm = await Geolocation.requestPermissions({ permissions: ["location", "coarseLocation"] });
      }
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") return null;
      precise = perm.location === "granted";
    }
  } catch (e) {
    console.warn("Location permission failed", e);
    return null;
  }
  // GPS when the user allowed precise location (risky-place radii can be small), network otherwise;
  // if that source has no fix in time, try the other once.
  for (const enableHighAccuracy of [precise, !precise]) {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy, timeout: 12_000, maximumAge: 60_000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.warn("No position", enableHighAccuracy ? "(GPS)" : "(network)", e);
    }
  }
  return null;
}

async function shareText(title: string, text: string): Promise<void> {
  await Share.share({ title, text, dialogTitle: title });
}

async function fetchJson(url: string): Promise<unknown> {
  if (!/^https:\/\//i.test(url)) throw new Error("Only https:// feeds are supported.");
  if (isNative()) {
    const res = await CapacitorHttp.get({ url, responseType: "json", headers: { Accept: "application/json" }, connectTimeout: 15_000, readTimeout: 30_000 });
    if (res.status < 200 || res.status >= 300) throw new Error(`The feed answered ${res.status}.`);
    const data: unknown = res.data;
    return typeof data === "string" ? (JSON.parse(data) as unknown) : data;
  }
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`The feed answered ${res.status}.`);
  return (await res.json()) as unknown;
}

// ---- Screen time --------------------------------------------------------------

const SCREEN_APPS_KEY = "qj-screen-apps";

export function readScreenTimeApps(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SCREEN_APPS_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeScreenTimeApps(packages: string[]) {
  try {
    localStorage.setItem(SCREEN_APPS_KEY, JSON.stringify(packages));
  } catch {
    // Not persisted; the picker shows the current choice anyway.
  }
}

export async function hasUsageAccess(): Promise<boolean> {
  return isAndroid() ? (await QjNative.hasUsageAccess()).granted : false;
}

export async function listLaunchableApps(): Promise<LaunchableApp[]> {
  return isAndroid() ? (await QjNative.listLaunchableApps()).apps : [];
}

/** Minutes today in the chosen apps; null without usage access. */
async function screenTimeToday(): Promise<number | null> {
  const res = await QjNative.screenTimeToday({ packages: readScreenTimeApps() });
  return res.granted ? (res.minutes ?? 0) : null;
}

async function requestUsageAccess(): Promise<void> {
  await QjNative.openUsageAccessSettings();
}

// ---- Assembly -----------------------------------------------------------------

const BASE: HostCapabilities = {
  composeMessage,
  currentPosition,
  shareText,
  fetchJson,
  ...(isNative() ? { scheduleSafetyAlarm, cancelSafetyAlarm } : {}),
  ...(isAndroid() ? { screenTimeToday, requestUsageAccess } : {}),
};

/** Host capabilities with live privacy state. */
export function useHost(): HostCapabilities {
  const [pinOn, setPinOn] = useState(pinEnabled);
  const [disguised, setDisguised] = useState(cachedDisguisedIcon);

  useEffect(() => {
    void readDisguisedIcon().then(setDisguised).catch((e: unknown) => console.error(e));
  }, []);

  return useMemo<HostCapabilities>(() => ({
    ...BASE,
    privacy: {
      pinEnabled: pinOn,
      setPin: async (pin) => {
        await setPin(pin);
        setPinOn(pin !== null);
        if (isAndroid()) await QjNative.setSecure({ on: pin !== null });
      },
      disguisedIcon: disguised,
      setDisguisedIcon: async (on) => {
        await setDisguisedIcon(on);
        setDisguised(on);
      },
    },
  }), [pinOn, disguised]);
}
