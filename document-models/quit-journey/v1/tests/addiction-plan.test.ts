import { generateId } from "document-model";
import type { QuitJourneyDocument } from "document-models/quit-journey/v1";
import {
  addRewardGoal,
  claimReward,
  computeJourney,
  HEALTH_MILESTONES,
  isQuitJourneyDocument,
  isQuitJourneyState,
  logCraving,
  logSlip,
  reducer,
  restartJourney,
  setQuitPlan,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { addDays, errs, planInput, QUIT, run, storedPlan } from "./helpers.js";

const REDUCTION_ERROR =
  "A reduction goal needs a daily limit above 0 and below your current daily amount";

describe("reduction goal validation", () => {
  it("rejects a REDUCTION goal without a valid daily limit and keeps the previous plan", () => {
    const doc = run([
      setQuitPlan(planInput()), // 0 baseline plan
      setQuitPlan(planInput({ goal: "REDUCTION" })), // 1 limit omitted
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: null })), // 2 limit null
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 0 })), // 3 zero
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: -2 })), // 4 negative
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 20 })), // 5 equal to unitsPerDay
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 25 })), // 6 above unitsPerDay
    ]);
    expect(errs(doc)).toEqual([
      null,
      REDUCTION_ERROR,
      REDUCTION_ERROR,
      REDUCTION_ERROR,
      REDUCTION_ERROR,
      REDUCTION_ERROR,
      REDUCTION_ERROR,
    ]);
    expect(doc.state.global.plan).toEqual(storedPlan());
  });

  it("the generic plan check runs before the reduction check", () => {
    const doc = run([setQuitPlan(planInput({ unitsPerDay: 0, goal: "REDUCTION" }))]);
    expect(doc.operations.global[0].error).toBe(
      "unitsPerDay and unitsPerPack must be positive and packPrice must not be negative",
    );
    expect(doc.state.global.plan).toBeNull();
  });

  it("stores the daily limit for a valid REDUCTION plan (fractional limits allowed)", () => {
    const doc = run([
      setQuitPlan(planInput({ productType: "ALCOHOL", unitsPerDay: 6, goal: "REDUCTION", dailyLimit: 2 })),
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 19.5 })),
    ]);
    expect(errs(doc)).toEqual([null, null]);
    expect(doc.state.global.plan).toEqual(storedPlan({ goal: "REDUCTION", dailyLimit: 19.5 }));
  });

  it("drops the daily limit for ABSTINENCE or an omitted goal", () => {
    const abstinence = run([setQuitPlan(planInput({ goal: "ABSTINENCE", dailyLimit: 5 }))]);
    expect(abstinence.operations.global[0].error).toBeUndefined();
    expect(abstinence.state.global.plan).toMatchObject({ goal: "ABSTINENCE", dailyLimit: null });

    const omitted = run([setQuitPlan(planInput({ dailyLimit: 5 }))]);
    expect(omitted.operations.global[0].error).toBeUndefined();
    expect(omitted.state.global.plan).toMatchObject({ goal: null, dailyLimit: null });

    const explicitNull = run([setQuitPlan(planInput({ goal: null, dailyLimit: 0 }))]);
    expect(explicitNull.state.global.plan).toMatchObject({ goal: null, dailyLimit: null });
  });

  it("switching from REDUCTION back to ABSTINENCE clears the limit", () => {
    const doc = run([
      setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 5 })),
      setQuitPlan(planInput({ goal: "ABSTINENCE" })),
    ]);
    expect(errs(doc)).toEqual([null, null]);
    expect(doc.state.global.plan).toMatchObject({ goal: "ABSTINENCE", dailyLimit: null });
  });
});

describe("custom name and unit label", () => {
  it("trims values and stores blanks as null", () => {
    const trimmed = run([
      setQuitPlan(planInput({ productType: "OTHER", customName: "  Energy drinks ", unitLabel: " cans  " })),
    ]);
    expect(trimmed.state.global.plan).toMatchObject({ customName: "Energy drinks", unitLabel: "cans" });

    const blank = run([setQuitPlan(planInput({ customName: "   ", unitLabel: "" }))]);
    expect(blank.state.global.plan).toMatchObject({ customName: null, unitLabel: null });

    const nulls = run([setQuitPlan(planInput({ customName: null, unitLabel: null }))]);
    expect(nulls.state.global.plan).toEqual(storedPlan());
  });
});

describe("backward compatibility with documents saved before the addiction fields", () => {
  /** A document exactly as stored before customName/unitLabel/goal/dailyLimit existed. */
  function legacyDocument(): QuitJourneyDocument {
    const fresh = utils.createDocument();
    const json = JSON.parse(JSON.stringify(fresh)) as {
      state: { global: Record<string, unknown> };
    };
    json.state.global.plan = {
      quitDateTime: QUIT,
      productType: "CIGARETTES",
      unitsPerDay: 20,
      unitsPerPack: 20,
      packPrice: 10,
      currency: "EUR",
      yearsSmoked: 12,
    };
    return json as unknown as QuitJourneyDocument;
  }

  it("validates the legacy state and document", () => {
    const doc = legacyDocument();
    const plan = doc.state.global.plan;
    expect(plan && "goal" in plan).toBe(false);
    expect(isQuitJourneyState(doc.state)).toBe(true);
    expect(isQuitJourneyDocument(doc)).toBe(true);
  });

  it("computes a nicotine abstinence journey from the legacy plan", () => {
    const state = legacyDocument().state.global;
    const now = Date.parse(addDays(QUIT, 4));
    const j = computeJourney(state, now);
    expect(j.phase).toBe("QUIT");
    expect(j.profile).toMatchObject({ key: "CIGARETTES", name: "Cigarettes", unit: "cigarettes", freeWord: "smoke-free" });
    expect(j.goal).toBe("ABSTINENCE");
    expect(j.reduction).toBeNull();
    expect(j.health.map((h) => h.key)).toEqual(HEALTH_MILESTONES.map((h) => h.key));
    expect(j.health.find((h) => h.key === "nicotine-free")?.reached).toBe(true);
    expect(j.money).toMatchObject({ unitsAvoided: 80, moneySaved: 40, lifeRegainedMinutes: 1600, timeRegainedMinutes: null });
    expect(j.gamification.badges.find((b) => b.key === "avoided-100")?.description).toBe("Skip 100 cigarettes");
  });

  it("accepts further actions on a legacy document", () => {
    const reward = generateId();
    const doc = run(
      [
        logCraving({ id: generateId(), timestamp: addDays(QUIT, 1), intensity: 4, trigger: "COFFEE", outcome: "RESISTED" }), // 0
        logSlip({ id: generateId(), timestamp: addDays(QUIT, 2), units: 2 }), // 1
        addRewardGoal({ id: reward, title: "Dinner", cost: 20 }), // 2
        claimReward({ id: reward, claimedAt: addDays(QUIT, 5) }), // 3
        restartJourney({ attemptId: generateId(), endedAt: addDays(QUIT, 6), newQuitDateTime: addDays(QUIT, 7) }), // 4
      ],
      legacyDocument(),
    );
    expect(errs(doc)).toEqual([null, null, null, null, null]);
    const s = doc.state.global;
    expect(s.cravings).toHaveLength(1);
    expect(s.slips).toHaveLength(1);
    expect(s.rewards[0].claimedAt).toBe(addDays(QUIT, 5));
    expect(s.pastAttempts).toHaveLength(1);
    // untouched legacy fields stay absent; the plan is otherwise preserved
    expect(s.plan).toEqual({
      quitDateTime: addDays(QUIT, 7),
      productType: "CIGARETTES",
      unitsPerDay: 20,
      unitsPerPack: 20,
      packPrice: 10,
      currency: "EUR",
      yearsSmoked: 12,
    });
    expect(isQuitJourneyDocument(doc)).toBe(true);
    expect(computeJourney(s, Date.parse(addDays(QUIT, 8))).goal).toBe("ABSTINENCE");
  });

  it("a new plan on a legacy document fills in the new fields", () => {
    const doc = reducer(legacyDocument(), setQuitPlan(planInput({ goal: "REDUCTION", dailyLimit: 10 })));
    expect(doc.operations.global[0].error).toBeUndefined();
    expect(doc.state.global.plan).toEqual(storedPlan({ goal: "REDUCTION", dailyLimit: 10 }));
  });
});
