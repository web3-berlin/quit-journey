import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { localDateKey, shiftDateKey } from "../time.js";
import type { RewardLadder } from "./types.js";

export const LADDER = {
  base: 10,
  step: 5,
  cap: 100,
  bonus: 25,
  /** Every n-th consecutive clean day earns the bonus. */
  bonusEvery: 3,
  /** Consecutive clean days after a reset that restore the previous level. */
  restoreAfter: 3,
} as const;

/** Points for a clean day on a given rung (1 = first day of a run). */
const rungValue = (rung: number): number => Math.min(LADDER.cap, LADDER.base + LADDER.step * (rung - 1));

const dayPoints = (rung: number, streak: number): number =>
  rungValue(rung) + (streak % LADDER.bonusEvery === 0 ? LADDER.bonus : 0);

const EMPTY: RewardLadder = {
  streakDays: 0,
  todayPoints: 0,
  totalPoints: 0,
  nextPoints: dayPoints(1, 1),
  recovering: false,
  restoreInDays: 0,
};

/**
 * Contingency-management-style escalating points from self-report.
 * Each slip-free local calendar day from the quit date to today earns 10 + 5 per extra streak day
 * (capped at 100) plus 25 every third day. A slip day earns nothing and resets the value to 10;
 * three clean days in a row afterwards restore the level reached before the slip ("rapid reset").
 */
export function computeRewardLadder(state: QuitJourneyState, now: number): RewardLadder {
  if (!state.plan) return EMPTY;
  const quitAt = Date.parse(state.plan.quitDateTime);
  if (!Number.isFinite(quitAt) || quitAt > now) return EMPTY;

  const slipDays = new Set(
    state.slips
      .map((s) => Date.parse(s.timestamp))
      .filter((t) => t >= quitAt && t <= now)
      .map((t) => localDateKey(t)),
  );

  const today = localDateKey(now);
  let rung = 0;
  let streak = 0;
  let savedRung = 0;
  let recovering = false;
  let cleanSinceReset = 0;
  let totalPoints = 0;
  let todayPoints = 0;

  for (let key = localDateKey(quitAt); key <= today; key = shiftDateKey(key, 1)) {
    let points = 0;
    if (slipDays.has(key)) {
      savedRung = recovering ? Math.max(savedRung, rung) : rung;
      rung = 0;
      streak = 0;
      cleanSinceReset = 0;
      // Only worth "recovering" when the old level is above what three fresh days reach anyway.
      recovering = savedRung > LADDER.restoreAfter;
    } else {
      rung += 1;
      streak += 1;
      if (recovering) {
        cleanSinceReset += 1;
        if (cleanSinceReset >= LADDER.restoreAfter) {
          rung = Math.max(rung, savedRung);
          recovering = false;
        }
      }
      points = dayPoints(rung, streak);
    }
    totalPoints += points;
    if (key === today) todayPoints = points;
  }

  // Tomorrow, if it stays clean.
  let nextRung = rung + 1;
  if (recovering && cleanSinceReset + 1 >= LADDER.restoreAfter) nextRung = Math.max(nextRung, savedRung);

  return {
    streakDays: streak,
    todayPoints,
    totalPoints,
    nextPoints: dayPoints(nextRung, streak + 1),
    recovering,
    restoreInDays: recovering ? LADDER.restoreAfter - cleanSinceReset : 0,
  };
}
