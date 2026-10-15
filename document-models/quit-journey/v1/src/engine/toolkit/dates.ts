import type { ProductType } from "document-models/quit-journey/v1";
import { SUBSTANCE_GROUPS } from "../substances.js";
import { DAY, localDateKey } from "../time.js";

/** Every ProductType, in picker order. */
export const ALL_PRODUCTS: ProductType[] = SUBSTANCE_GROUPS.flatMap((g) => g.keys);

export const NICOTINE_PRODUCTS: ProductType[] = ["CIGARETTES", "ROLL_YOUR_OWN", "CIGARS", "VAPE", "HEATED_TOBACCO"];

/** Local noon of a YYYY-MM-DD key (noon keeps DST shifts from changing the day). */
function noonOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}

/** Whole calendar days from key `from` to key `to` (negative when `to` is earlier). */
export function daysBetweenDateKeys(from: string, to: string): number {
  return Math.round((noonOf(to) - noonOf(from)) / DAY);
}

/** Accepts a YYYY-MM-DD key or an ISO timestamp and returns the local date key. */
export function toDateKey(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : localDateKey(Date.parse(value));
}

/** Rounds to one decimal, exactly like the reducers. */
export const round1 = (x: number): number => Math.round(x * 10) / 10;
