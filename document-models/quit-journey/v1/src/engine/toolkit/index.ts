import type { AssessmentInstrument, QuitJourneyState } from "document-models/quit-journey/v1";
import { scoreAssessment } from "./assessments.js";
import { drinkWeek } from "./drinks.js";
import { exclusionStatuses, naloxoneStatuses, supplyAlertsFor } from "./harm-reduction.js";
import { computeRewardLadder } from "./ladder.js";
import { medicationToday } from "./medication.js";
import { PROGRAMS, programStatus } from "./programs.js";
import type { AssessmentResult, JourneyToolkit } from "./types.js";

export * from "./assessments.js";
export * from "./dates.js";
export * from "./drinks.js";
export * from "./harm-reduction.js";
export * from "./ladder.js";
export * from "./medication.js";
export * from "./places.js";
export * from "./plans.js";
export * from "./programs.js";
export type * from "./types.js";

/** Most recent result per instrument. */
export function latestAssessments(state: QuitJourneyState): JourneyToolkit["latestAssessments"] {
  const out: Partial<Record<AssessmentInstrument, AssessmentResult & { takenAt: string }>> = {};
  for (const a of state.assessments ?? []) {
    const prev = out[a.instrument];
    if (prev && Date.parse(prev.takenAt) >= Date.parse(a.takenAt)) continue;
    out[a.instrument] = { ...scoreAssessment(a.instrument, a.answers), takenAt: a.takenAt };
  }
  return out;
}

/** Toolkit part of the journey snapshot. Works on documents saved before the toolkit fields existed. */
export function computeToolkit(state: QuitJourneyState, now: number): JourneyToolkit {
  const product = state.plan?.productType ?? null;
  const known = new Set(PROGRAMS.map((p) => p.key));
  return {
    ladder: computeRewardLadder(state, now),
    naloxone: naloxoneStatuses(state, now),
    exclusions: exclusionStatuses(state, now),
    programs: (state.programs ?? []).filter((p) => !p.endedAt && known.has(p.program)).map((p) => programStatus(p, now)),
    medication: medicationToday(state, now),
    drinkWeek: product === "ALCOHOL" ? drinkWeek(state, now) : null,
    alerts: product ? supplyAlertsFor(product) : [],
    latestAssessments: latestAssessments(state),
  };
}
