import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { DAY } from "./time.js";

/**
 * Minutes of life expectancy lost per cigarette (Jackson et al., Journal of
 * Addiction, 2025 — revised from the classic 11 minutes estimate).
 */
export const LIFE_MINUTES_PER_CIGARETTE = 20;

export interface Period {
  start: number;
  end: number;
}

/** All smoke-free periods: archived attempts plus the current one up to `now`. */
export function journeyPeriods(state: QuitJourneyState, now: number): Period[] {
  if (!state.plan) return [];
  const periods = state.pastAttempts.map((a) => ({
    start: Date.parse(a.quitDateTime),
    end: Date.parse(a.endedAt),
  }));
  periods.push({ start: Date.parse(state.plan.quitDateTime), end: now });
  return periods.filter((p) => p.end > p.start);
}

export function slipUnitsIn(state: QuitJourneyState, period: Period): number {
  return state.slips
    .filter((s) => {
      const t = Date.parse(s.timestamp);
      return t >= period.start && t <= period.end;
    })
    .reduce((sum, s) => sum + s.units, 0);
}

export function unitsAvoidedIn(state: QuitJourneyState, period: Period): number {
  if (!state.plan) return 0;
  const baseline = ((period.end - period.start) / DAY) * state.plan.unitsPerDay;
  return Math.max(0, baseline - slipUnitsIn(state, period));
}

export interface MoneyStats {
  currency: string;
  pricePerUnit: number;
  costPerDay: number;
  unitsAvoided: number;
  unitsAvoidedCurrent: number;
  moneySaved: number;
  moneySpentOnRewards: number;
  moneyAvailable: number;
  projectedYearlySavings: number;
  /** null for products where the per-cigarette estimate does not apply. */
  lifeRegainedMinutes: number | null;
}

/**
 * Savings across the whole journey. Uses the same formula as the
 * CLAIM_REWARD reducer, so the editor never offers a claim the reducer rejects.
 */
export function computeMoney(state: QuitJourneyState, now: number): MoneyStats | null {
  const plan = state.plan;
  if (!plan) return null;
  const pricePerUnit = plan.packPrice / plan.unitsPerPack;
  const periods = journeyPeriods(state, now);
  const unitsAvoided = periods.reduce((sum, p) => sum + unitsAvoidedIn(state, p), 0);
  const current = periods.find((p) => p.start === Date.parse(plan.quitDateTime) && p.end === now);
  const unitsAvoidedCurrent = current ? unitsAvoidedIn(state, current) : 0;
  const moneySaved = unitsAvoided * pricePerUnit;
  const moneySpentOnRewards = state.rewards.reduce((sum, r) => sum + (r.claimedAt ? r.cost : 0), 0);
  const smokesTobacco = plan.productType === "CIGARETTES" || plan.productType === "ROLL_YOUR_OWN";
  return {
    currency: plan.currency,
    pricePerUnit,
    costPerDay: plan.unitsPerDay * pricePerUnit,
    unitsAvoided,
    unitsAvoidedCurrent,
    moneySaved,
    moneySpentOnRewards,
    moneyAvailable: moneySaved - moneySpentOnRewards,
    projectedYearlySavings: plan.unitsPerDay * pricePerUnit * 365,
    lifeRegainedMinutes: smokesTobacco ? unitsAvoided * LIFE_MINUTES_PER_CIGARETTE : null,
  };
}
