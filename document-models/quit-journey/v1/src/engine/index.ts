import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { computeGamification, computeStreaks, type Gamification, type Streaks } from "./gamification.js";
import { computeHealth, type HealthMilestoneStatus } from "./health.js";
import { computeInsights, type Insights } from "./insights.js";
import { computeMoney, journeyPeriods, type MoneyStats } from "./money.js";
import { computePrep, type PrepStatus } from "./prep.js";
import { computeReduction, type ReductionStatus } from "./reduction.js";
import { profileForPlan, type SubstanceProfile } from "./substances.js";

export * from "./gamification.js";
export * from "./health.js";
export * from "./insights.js";
export * from "./money.js";
export * from "./prep.js";
export * from "./reduction.js";
export * from "./substances.js";
export * from "./time.js";

export type RecoveryGoalKind = "ABSTINENCE" | "REDUCTION";

export type JourneyPhase = "NOT_STARTED" | "PREP" | "QUIT";

export interface JourneySnapshot {
  now: number;
  phase: JourneyPhase;
  quitAt: number | null;
  /** What is being quit, with the user's custom name/unit applied. */
  profile: SubstanceProfile;
  goal: RecoveryGoalKind;
  /** Daily-limit progress when the goal is REDUCTION. */
  reduction: ReductionStatus | null;
  /** Time since the quit date (slips do not reset this). */
  elapsedMs: number;
  money: MoneyStats | null;
  streaks: Streaks;
  health: HealthMilestoneStatus[];
  nextHealthMilestone: HealthMilestoneStatus | null;
  prep: PrepStatus;
  gamification: Gamification;
  insights: Insights;
}

/** Everything the UI shows, derived purely from document state and a clock value. */
export function computeJourney(state: QuitJourneyState, now: number): JourneySnapshot {
  const quitAt = state.plan ? Date.parse(state.plan.quitDateTime) : null;
  const phase: JourneyPhase = quitAt === null ? "NOT_STARTED" : quitAt > now ? "PREP" : "QUIT";
  const periods = journeyPeriods(state, now);
  const money = computeMoney(state, now);
  const streaks = computeStreaks(state, periods, now);
  const profile = profileForPlan(state.plan);
  const reduction = computeReduction(state, now);
  const health = computeHealth(streaks.recoveryStart, now, profile.milestones);
  return {
    now,
    phase,
    quitAt,
    profile,
    goal: reduction ? "REDUCTION" : "ABSTINENCE",
    reduction,
    elapsedMs: quitAt === null ? 0 : Math.max(0, now - quitAt),
    money,
    streaks,
    health,
    nextHealthMilestone: health.find((h) => !h.reached) ?? null,
    prep: computePrep(state, now),
    gamification: computeGamification(state, periods, streaks, money, now, { unit: profile.unit, reduction }),
    insights: computeInsights(state, now),
  };
}
