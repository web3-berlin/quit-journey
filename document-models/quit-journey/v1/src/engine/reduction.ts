import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { localDateKey, shiftDateKey } from "./time.js";

/** Progress for a harm-reduction goal: logged use (slips) is compared with a daily limit. */
export interface ReductionStatus {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  /** Consecutive calendar days, ending today, at or under the limit. */
  streakDays: number;
  bestStreakDays: number;
  daysWithinLimit: number;
  daysTracked: number;
}

export function computeReduction(state: QuitJourneyState, now: number): ReductionStatus | null {
  const plan = state.plan;
  if (plan?.goal !== "REDUCTION" || plan.dailyLimit == null) return null;
  const limit = plan.dailyLimit;
  const quit = Date.parse(plan.quitDateTime);
  const empty: ReductionStatus = { dailyLimit: limit, usedToday: 0, remainingToday: limit, streakDays: 0, bestStreakDays: 0, daysWithinLimit: 0, daysTracked: 0 };
  if (quit > now) return empty;

  const usedByDay = new Map<string, number>();
  for (const s of state.slips) {
    const t = Date.parse(s.timestamp);
    if (t < quit || t > now) continue;
    const key = localDateKey(t);
    usedByDay.set(key, (usedByDay.get(key) ?? 0) + s.units);
  }

  const today = localDateKey(now);
  let run = 0;
  let best = 0;
  let within = 0;
  let tracked = 0;
  // YYYY-MM-DD keys compare correctly as strings.
  for (let key = localDateKey(quit); key <= today; key = shiftDateKey(key, 1)) {
    tracked += 1;
    if ((usedByDay.get(key) ?? 0) <= limit) {
      within += 1;
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  const usedToday = usedByDay.get(today) ?? 0;
  return {
    dailyLimit: limit,
    usedToday,
    remainingToday: Math.max(0, limit - usedToday),
    streakDays: run,
    bestStreakDays: best,
    daysWithinLimit: within,
    daysTracked: tracked,
  };
}
