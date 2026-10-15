import { splitDuration } from "document-models/quit-journey";

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: amount < 100 ? 2 : 0 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

/** "3d 4h", "5h 12m", "42m" — the two most significant units. */
export function formatShortDuration(ms: number): string {
  const d = splitDuration(ms);
  if (d.days >= 365) return `${formatNumber(d.days / 365, 1)} years`;
  if (d.days > 0) return `${d.days}d ${d.hours}h`;
  if (d.hours > 0) return `${d.hours}h ${d.minutes}m`;
  return `${d.minutes}m`;
}

export function formatLifeMinutes(minutes: number): string {
  if (minutes >= 60 * 24) return `${formatNumber(minutes / 60 / 24, 1)} days`;
  if (minutes >= 60) return `${formatNumber(minutes / 60, 1)} hours`;
  return `${formatNumber(minutes)} minutes`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
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
