import type { IfThenPlan } from "document-models/quit-journey/v1";
import type { PlanMatcher } from "./types.js";

const freshness = (p: IfThenPlan): number => Date.parse(p.lastReviewedAt ?? p.createdAt);
const newestFirst = (a: IfThenPlan, b: IfThenPlan): number => freshness(b) - freshness(a);

/**
 * If-then plans for a trigger first, then general plans (no trigger); each group most recently reviewed/created first.
 * Without a trigger: general plans first, then all others.
 */
export const plansForTrigger: PlanMatcher = (plans, trigger) => {
  const general = plans.filter((p) => !p.trigger).sort(newestFirst);
  if (trigger === null) return [...general, ...plans.filter((p) => p.trigger).sort(newestFirst)];
  return [...plans.filter((p) => p.trigger === trigger).sort(newestFirst), ...general];
};
