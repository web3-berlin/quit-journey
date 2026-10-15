/**
 * Device-only privacy: an optional app PIN (salted SHA-256, never stored in plain text)
 * and the disguised launcher icon. Nothing leaves the phone.
 */
import { isAndroid, QjNative } from "./native.js";

const PIN_KEY = "qj-pin";
const ATTEMPTS_KEY = "qj-pin-attempts";
const DISGUISE_KEY = "qj-disguised-icon";

/** After this many wrong PINs in a row, each further try waits LOCKOUT_MS. */
const FREE_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

interface StoredPin {
  salt: string;
  hash: string;
}

interface Attempts {
  failed: number;
  lastAt: number;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked; the PIN simply won't persist.
  }
}

const toHex = (bytes: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");

async function hashPin(pin: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${pin}`));
  return toHex(digest);
}

export const isValidPin = (pin: string) => /^\d{4,8}$/.test(pin);

export function pinEnabled(): boolean {
  const stored = readJson<StoredPin>(PIN_KEY);
  return !!stored?.salt && !!stored.hash;
}

/** Sets a new PIN, or removes it with null. */
export async function setPin(pin: string | null): Promise<void> {
  writeJson(ATTEMPTS_KEY, null);
  if (pin === null) {
    writeJson(PIN_KEY, null);
    return;
  }
  if (!isValidPin(pin)) throw new Error("A PIN is 4 to 8 digits.");
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  writeJson(PIN_KEY, { salt, hash: await hashPin(pin, salt) } satisfies StoredPin);
}

/** Milliseconds until another attempt is allowed (0 = now). */
export function lockoutRemaining(now = Date.now()): number {
  const a = readJson<Attempts>(ATTEMPTS_KEY);
  if (!a || a.failed < FREE_ATTEMPTS) return 0;
  return Math.max(0, a.lastAt + LOCKOUT_MS - now);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = readJson<StoredPin>(PIN_KEY);
  if (!stored) return true;
  if (lockoutRemaining() > 0) return false;
  const ok = (await hashPin(pin, stored.salt)) === stored.hash;
  if (ok) writeJson(ATTEMPTS_KEY, null);
  else {
    const a = readJson<Attempts>(ATTEMPTS_KEY);
    writeJson(ATTEMPTS_KEY, { failed: (a?.failed ?? 0) + 1, lastAt: Date.now() } satisfies Attempts);
  }
  return ok;
}

/** Last known disguise state, for a correct first render before the native answer arrives. */
export function cachedDisguisedIcon(): boolean {
  return readJson<boolean>(DISGUISE_KEY) === true;
}

export async function readDisguisedIcon(): Promise<boolean> {
  if (!isAndroid()) return false;
  const { on } = await QjNative.getDisguisedIcon();
  writeJson(DISGUISE_KEY, on);
  return on;
}

export async function setDisguisedIcon(on: boolean): Promise<void> {
  if (!isAndroid()) return;
  await QjNative.setDisguisedIcon({ on });
  writeJson(DISGUISE_KEY, on);
}
