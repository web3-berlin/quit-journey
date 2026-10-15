import type { QuitJourneyState, QuitPlan } from "document-models/quit-journey/v1";
import { computeJourney, computeToolkit, latestAssessments, localDateKey } from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState } from "./helpers.js";

const at = (day: number, hour = 12) => new Date(2026, 8, day, hour).getTime();
const iso = (ms: number) => new Date(ms).toISOString();

function plan(overrides: Partial<QuitPlan> = {}): QuitPlan {
  return {
    quitDateTime: iso(at(1, 8)),
    productType: "CIGARETTES",
    unitsPerDay: 20,
    unitsPerPack: 20,
    packPrice: 10,
    currency: "EUR",
    yearsSmoked: null,
    customName: null,
    unitLabel: null,
    goal: null,
    dailyLimit: null,
    standardDrinkGrams: null,
    ...overrides,
  };
}

const NEW_FIELDS = [
  "naloxoneKits",
  "drugChecks",
  "exclusions",
  "ifThenPlans",
  "drinks",
  "screenTime",
  "gamblingLosses",
  "assessments",
  "medicationPlans",
  "takeHomes",
  "programs",
] as const;

/** A state as saved before the toolkit existed: the new keys are absent, not just null. */
function oldState(p: QuitPlan | null): QuitJourneyState {
  const state = makeState({ plan: p });
  for (const k of NEW_FIELDS) Reflect.deleteProperty(state, k);
  if (state.plan) Reflect.deleteProperty(state.plan, "standardDrinkGrams");
  return state;
}

describe("computeJourney toolkit", () => {
  it("works on an old document without any of the new fields", () => {
    for (const p of [null, plan(), plan({ productType: "ALCOHOL" }), plan({ productType: "OPIOIDS" })]) {
      const state = oldState(p);
      expect("programs" in state).toBe(false);
      const snap = computeJourney(state, at(10));
      expect(snap.toolkit.naloxone).toEqual([]);
      expect(snap.toolkit.exclusions).toEqual([]);
      expect(snap.toolkit.programs).toEqual([]);
      expect(snap.toolkit.medication).toEqual([]);
      expect(snap.toolkit.latestAssessments).toEqual({});
      expect(snap.toolkit.drinkWeek).toEqual(p?.productType === "ALCOHOL" ? { standardDrinks: 0, gramsAlcohol: 0, drinkingDays: 0 } : null);
      expect(snap.toolkit.alerts.length > 0).toBe(p?.productType === "OPIOIDS");
      expect(snap.toolkit.ladder.streakDays).toBe(p ? 10 : 0);
    }
  });

  it("includes only active programs and the latest result per instrument", () => {
    const state = makeState({
      plan: plan({ productType: "ALCOHOL" }),
      programs: [
        { id: "a", program: "DRY_MONTH", startedAt: iso(at(1)), completedMissions: [], endedAt: null },
        { id: "b", program: "SKILL_LESSONS", startedAt: iso(at(1)), completedMissions: [], endedAt: iso(at(2)) },
      ],
      assessments: [
        { id: "1", instrument: "AUDIT_C", answers: [1, 1, 1], score: 3, takenAt: iso(at(5)) },
        { id: "2", instrument: "AUDIT_C", answers: [4, 4, 4], score: 12, takenAt: iso(at(2)) },
        { id: "3", instrument: "AUDIT", answers: [4, 4, 4, 4, 4, 0, 0, 0, 0, 0], score: 20, takenAt: iso(at(3)) },
      ],
      drinks: [
        { id: "d", slipId: "s", timestamp: iso(at(10, 9)), beverage: "WINE", volumeMl: 175, abvPercent: 12.5, gramsAlcohol: 17.3, standardDrinks: 1.7 },
      ],
      slips: [{ id: "s", timestamp: iso(at(10, 9)), units: 1.7, trigger: null, note: null }],
    });
    const { toolkit } = computeJourney(state, at(10));
    expect(toolkit.programs.map((p) => p.enrollmentId)).toEqual(["a"]);
    expect(toolkit.programs[0].day).toBe(10);
    expect(toolkit.latestAssessments.AUDIT_C).toMatchObject({ score: 3, takenAt: iso(at(5)), band: { label: "Lower risk" } });
    expect(toolkit.latestAssessments.AUDIT?.band?.label).toBe("Highest risk");
    expect(toolkit.drinkWeek).toEqual({ standardDrinks: 1.7, gramsAlcohol: 17.3, drinkingDays: 1 });
    expect(toolkit.ladder.todayPoints).toBe(0);
    expect(toolkit.alerts).toEqual([]);
    expect(latestAssessments(state)).toEqual(toolkit.latestAssessments);
  });

  it("is pure and matches computeToolkit", () => {
    const state = makeState({ plan: plan({ productType: "OPIOIDS" }) });
    const before = JSON.stringify(state);
    const snap = computeJourney(state, at(4));
    expect(JSON.stringify(state)).toBe(before);
    expect(snap.toolkit).toEqual(computeToolkit(state, at(4)));
    expect(snap.toolkit.alerts.map((a) => a.key)).toContain("medetomidine");
    expect(localDateKey(snap.now)).toBe(localDateKey(at(4)));
  });
});
