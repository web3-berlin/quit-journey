import { splitDuration } from "document-models/quit-journey";

/** Locale for all Intl formatting; set by I18nProvider before each render. */
let formatLocale = "en";

export function setFormatLocale(locale: string) {
  formatLocale = locale;
}

const unit = (value: number, u: "year" | "day" | "hour" | "minute", display: "narrow" | "long", digits = 0) =>
  new Intl.NumberFormat(formatLocale, { style: "unit", unit: u, unitDisplay: display, maximumFractionDigits: digits }).format(value);

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(formatLocale, { style: "currency", currency, maximumFractionDigits: amount < 100 ? 2 : 0 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat(formatLocale, { maximumFractionDigits: digits }).format(n);
}

/** "3d 4h", "5h 12m", "42m" — the two most significant units, in the active locale. */
export function formatShortDuration(ms: number): string {
  const d = splitDuration(ms);
  if (d.days >= 365) return unit(d.days / 365, "year", "long", 1);
  if (d.days > 0) return `${unit(d.days, "day", "narrow")} ${unit(d.hours, "hour", "narrow")}`;
  if (d.hours > 0) return `${unit(d.hours, "hour", "narrow")} ${unit(d.minutes, "minute", "narrow")}`;
  return unit(d.minutes, "minute", "narrow");
}

export function formatLifeMinutes(minutes: number): string {
  if (minutes >= 60 * 24) return unit(minutes / 60 / 24, "day", "long", 1);
  if (minutes >= 60) return unit(minutes / 60, "hour", "long", 1);
  return unit(minutes, "minute", "long");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(formatLocale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(formatLocale, { dateStyle: "medium" });
}

/** Value for <input type="datetime-local"> from an ISO string or timestamp. */
export function toLocalInput(value: string | number): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Rough singular of a unit label: "drinks" → "drink", "hours" → "hour". */
export function singular(unit: string): string {
  return unit.endsWith("s") ? unit.slice(0, -1) : unit;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Short weekday name for 0 (Sunday) … 6 (Saturday) in the active locale. */
export function weekdayName(day: number): string {
  // 2023-01-01 was a Sunday.
  return new Date(2023, 0, 1 + day).toLocaleDateString(formatLocale, { weekday: "short" });
}

/**
 * A label used mid-sentence. English lowercases it ("after a meal"); other languages keep the
 * translator's casing (German nouns stay capitalised, many scripts have no case at all).
 */
export function inSentence(text: string, locale: string): string {
  return locale.toLowerCase().startsWith("en") ? text.toLowerCase() : text;
}
