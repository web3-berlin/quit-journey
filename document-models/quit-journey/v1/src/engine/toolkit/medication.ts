import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { localDateKey } from "../time.js";
import { daysBetweenDateKeys, toDateKey } from "./dates.js";
import type { MedicationToday } from "./types.js";

/**
 * Today's step of each medication plan that has started (day 1 = startDate, local calendar days).
 * takeHomeRemaining = doses picked up − doses logged since the earliest pick-up (never below 0); null without take-homes.
 */
export function medicationToday(state: QuitJourneyState, now: number): MedicationToday[] {
  const today = localDateKey(now);
  const out: MedicationToday[] = [];
  for (const plan of state.medicationPlans ?? []) {
    const day = daysBetweenDateKeys(plan.startDate, today) + 1;
    const step = [...plan.steps].reverse().find((s) => s.fromDay <= day);
    if (!step) continue; // not started yet
    const uses = state.aidUses.filter((u) => u.aidId === plan.aidId);
    const takenToday = uses.filter((u) => localDateKey(Date.parse(u.timestamp)) === today).length;
    const takeHomes = (state.takeHomes ?? []).filter((t) => t.aidId === plan.aidId);
    let takeHomeRemaining: number | null = null;
    if (takeHomes.length > 0) {
      const first = takeHomes.map((t) => toDateKey(t.pickedUpOn)).sort()[0];
      const picked = takeHomes.reduce((sum, t) => sum + t.doses, 0);
      const usedSince = uses.filter((u) => localDateKey(Date.parse(u.timestamp)) >= first).length;
      takeHomeRemaining = Math.max(0, picked - usedSince);
    }
    out.push({ aidId: plan.aidId, day, dose: step.dose, timesPerDay: step.timesPerDay, takenToday, takeHomeRemaining });
  }
  return out;
}
