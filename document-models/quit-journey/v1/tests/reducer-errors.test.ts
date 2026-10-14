import { generateId } from "document-model";
import {
  addMotivation,
  addQuitAid,
  addRewardGoal,
  addSupportContact,
  claimReward,
  computeMoney,
  dailyCheckIn,
  deleteCheckIn,
  deleteCraving,
  deleteRewardGoal,
  deleteSlip,
  endQuitAid,
  logAidUse,
  logCraving,
  logSlip,
  removeMotivation,
  removeSupportContact,
  restartJourney,
  setQuitPlan,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { addDays, errs, planInput, QUIT, run, withPlan } from "./helpers.js";

const INVALID_PLAN =
  "unitsPerDay and unitsPerPack must be positive and packPrice must not be negative";
const RATING = "Ratings must be integers between 1 and 5";
const INTENSITY = "Intensity must be an integer between 1 and 5";
const INVALID_DATE = "Check-in date must be a calendar date in YYYY-MM-DD format";
const RESTART =
  "endedAt must be after the current quit date and the new quit date must not be before endedAt";

describe("plan errors", () => {
  it("rejects invalid quit plans and keeps the previous plan", () => {
    const doc = run([
      setQuitPlan(planInput({ unitsPerDay: 0 })),
      setQuitPlan(planInput({ unitsPerPack: 0 })),
      setQuitPlan(planInput({ packPrice: -1 })),
      setQuitPlan(planInput({ packPrice: 0 })),
    ]);
    expect(errs(doc)).toEqual([INVALID_PLAN, INVALID_PLAN, INVALID_PLAN, null]);
    expect(doc.state.global.plan).toEqual({ ...planInput({ packPrice: 0 }), yearsSmoked: null });
  });

  it("rejects empty motivations and unknown motivation ids", () => {
    const doc = run([
      addMotivation({ id: generateId(), text: "   " }),
      removeMotivation({ id: "missing" }),
    ]);
    expect(errs(doc)).toEqual(["Motivation text must not be empty", "Motivation missing not found"]);
    expect(doc.state.global.motivations).toEqual([]);
  });
});

describe("craving errors", () => {
  it("rejects intensities outside 1..5 or non-integers and negative durations", () => {
    const base = { trigger: "COFFEE", outcome: "RESISTED", timestamp: QUIT } as const;
    const doc = run([
      logCraving({ ...base, id: generateId(), intensity: 0 }),
      logCraving({ ...base, id: generateId(), intensity: 6 }),
      logCraving({ ...base, id: generateId(), intensity: 2.5 }),
      logCraving({ ...base, id: generateId(), intensity: 1, durationMinutes: -1 }),
      logCraving({ ...base, id: generateId(), intensity: 1, durationMinutes: null, strategy: null, note: "" }),
      deleteCraving({ id: "missing" }),
    ]);
    expect(errs(doc)).toEqual([
      INTENSITY,
      INTENSITY,
      INTENSITY,
      "Duration must not be negative",
      null,
      "Craving missing not found",
    ]);
    expect(doc.state.global.cravings).toHaveLength(1);
    expect(doc.state.global.cravings[0]).toMatchObject({ strategy: null, durationMinutes: null, note: null });
  });
});

describe("slip errors", () => {
  it("rejects non-positive units and unknown slips", () => {
    const doc = run([
      logSlip({ id: generateId(), timestamp: QUIT, units: 0 }),
      logSlip({ id: generateId(), timestamp: QUIT, units: -2 }),
      deleteSlip({ id: "missing" }),
    ]);
    expect(errs(doc)).toEqual([
      "Units smoked must be positive",
      "Units smoked must be positive",
      "Slip missing not found",
    ]);
    expect(doc.state.global.slips).toEqual([]);
  });

  it("cannot restart without a plan", () => {
    const doc = run([
      restartJourney({ attemptId: generateId(), endedAt: QUIT, newQuitDateTime: QUIT }),
    ]);
    expect(errs(doc)).toEqual(["There is no quit plan to restart"]);
    expect(doc.state.global.pastAttempts).toEqual([]);
  });

  it("validates both restart date rules and accepts equal boundaries", () => {
    const attemptId = generateId();
    const doc = run(
      [
        // endedAt before the current quit date
        restartJourney({ attemptId: generateId(), endedAt: addDays(QUIT, -1), newQuitDateTime: addDays(QUIT, 1) }),
        // new quit date before endedAt
        restartJourney({ attemptId: generateId(), endedAt: addDays(QUIT, 3), newQuitDateTime: addDays(QUIT, 2) }),
        // equal boundaries are allowed; no reason given
        restartJourney({ attemptId, endedAt: QUIT, newQuitDateTime: QUIT, reason: "" }),
      ],
      withPlan(),
    );
    expect(errs(doc)).toEqual([null, RESTART, RESTART, null]);
    expect(doc.state.global.pastAttempts).toEqual([{ id: attemptId, quitDateTime: QUIT, endedAt: QUIT, reason: null }]);
    expect(doc.state.global.plan?.quitDateTime).toBe(QUIT);
  });
});

describe("check-in errors", () => {
  const date = "2026-01-05";
  it("rejects dates that are not a YYYY-MM-DD calendar date", () => {
    const doc = run([
      dailyCheckIn({ id: generateId(), date: "14/10/2026", mood: 3, cravingLevel: 3 }),
      dailyCheckIn({ id: generateId(), date: "2026-10-14T00:00:00.000Z", mood: 3, cravingLevel: 3 }),
      dailyCheckIn({ id: generateId(), date: "2026-1-5", mood: 3, cravingLevel: 3 }),
      dailyCheckIn({ id: generateId(), date: "2026-10-14", mood: 3, cravingLevel: 3 }),
    ]);
    const e = errs(doc);
    expect(e[3]).toBeNull();
    expect(e.slice(0, 3)).toEqual([INVALID_DATE, INVALID_DATE, INVALID_DATE]);
    expect(doc.state.global.checkIns.map((c) => c.date)).toEqual(["2026-10-14"]);
  });

  it("rejects duplicates, invalid ratings and invalid weights", () => {
    const doc = run([
      dailyCheckIn({ id: generateId(), date, mood: 0, cravingLevel: 3 }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 6 }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 3, energy: 2.5 }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 3, sleepQuality: 0 }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 3, weightKg: 0 }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 3, weightKg: -70 }),
      dailyCheckIn({
        id: generateId(),
        date,
        mood: 5,
        cravingLevel: 1,
        energy: null,
        sleepQuality: null,
        weightKg: null,
        symptoms: null,
        note: null,
      }),
      dailyCheckIn({ id: generateId(), date, mood: 3, cravingLevel: 3 }),
      deleteCheckIn({ id: "missing" }),
    ]);
    expect(errs(doc)).toEqual([
      RATING,
      RATING,
      RATING,
      RATING,
      "Weight must be positive",
      "Weight must be positive",
      null,
      `A check-in for ${date} already exists`,
      "Check-in missing not found",
    ]);
    expect(doc.state.global.checkIns).toHaveLength(1);
    expect(doc.state.global.checkIns[0]).toMatchObject({
      energy: null,
      sleepQuality: null,
      weightKg: null,
      symptoms: [],
      note: null,
    });
  });
});

describe("reward errors", () => {
  it("rejects invalid goals and unknown rewards", () => {
    const doc = run([
      addRewardGoal({ id: generateId(), title: "  ", cost: 10 }),
      addRewardGoal({ id: generateId(), title: "Shoes", cost: 0 }),
      addRewardGoal({ id: generateId(), title: "Shoes", cost: -5 }),
      claimReward({ id: "missing", claimedAt: QUIT }),
      deleteRewardGoal({ id: "missing" }),
    ]);
    const invalid = "Reward needs a title and a positive cost";
    expect(errs(doc)).toEqual([
      invalid,
      invalid,
      invalid,
      "Reward missing not found",
      "Reward missing not found",
    ]);
    expect(doc.state.global.rewards).toEqual([]);
  });

  it("needs a plan before claiming", () => {
    const id = generateId();
    const doc = run([
      addRewardGoal({ id, title: "Coffee", cost: 1 }),
      claimReward({ id, claimedAt: QUIT }),
      deleteRewardGoal({ id }),
    ]);
    expect(errs(doc)).toEqual([null, "Set a quit plan before claiming rewards", null]);
    expect(doc.state.global.rewards).toEqual([]);
  });

  it("skips empty/inverted periods and agrees with computeMoney", () => {
    const spa = generateId();
    const coffee = generateId();
    const secondQuit = addDays(QUIT, 10);
    const thirdQuit = addDays(QUIT, 30);
    const claimAt = addDays(QUIT, 20);
    const setup = run(
      [
        logSlip({ id: generateId(), timestamp: addDays(QUIT, 1), units: 4 }),
        logSlip({ id: generateId(), timestamp: addDays(QUIT, 12), units: 50 }),
        // attempt 1: 10 days -> 200 - 4 = 196 units
        restartJourney({ attemptId: generateId(), endedAt: secondQuit, newQuitDateTime: secondQuit }),
        // attempt 2: zero length (end <= start), the slip at day 12 is outside every period
        restartJourney({ attemptId: generateId(), endedAt: secondQuit, newQuitDateTime: thirdQuit }),
        addRewardGoal({ id: spa, title: "Spa", cost: 100 }),
        addRewardGoal({ id: coffee, title: "Coffee", cost: 98 }),
      ],
      withPlan(),
    );
    // claim before the current quit date: current period is skipped too
    const money = computeMoney(setup.state.global, Date.parse(claimAt));
    expect(money?.unitsAvoided).toBeCloseTo(196);
    expect(money?.moneyAvailable).toBeCloseTo(98);

    const doc = run(
      [
        claimReward({ id: spa, claimedAt: claimAt }),
        claimReward({ id: coffee, claimedAt: claimAt }),
        claimReward({ id: spa, claimedAt: addDays(claimAt, 1) }),
      ],
      setup,
    );
    expect(errs(doc).slice(7)).toEqual([
      "Not enough savings yet: 98.00 available, 100.00 needed",
      null,
      "Not enough savings yet: 0.00 available, 100.00 needed",
    ]);
    expect(doc.state.global.rewards.map((r) => r.claimedAt)).toEqual([null, claimAt]);
    expect(computeMoney(doc.state.global, Date.parse(claimAt))?.moneyAvailable).toBeCloseTo(0);
  });

  it("slips larger than the baseline never make a period negative", () => {
    const id = generateId();
    const doc = run(
      [
        logSlip({ id: generateId(), timestamp: addDays(QUIT, 1), units: 500 }),
        addRewardGoal({ id, title: "Gum", cost: 0.01 }),
        claimReward({ id, claimedAt: addDays(QUIT, 2) }),
      ],
      withPlan(),
    );
    expect(errs(doc).slice(1)).toEqual([null, null, "Not enough savings yet: 0.00 available, 0.01 needed"]);
    expect(computeMoney(doc.state.global, Date.parse(addDays(QUIT, 2)))?.moneySaved).toBe(0);
  });
});

describe("aid errors", () => {
  it("rejects ending or using unknown aids", () => {
    const doc = run([
      endQuitAid({ id: "missing", endedAt: QUIT }),
      logAidUse({ id: generateId(), aidId: "missing", timestamp: QUIT }),
      addQuitAid({ id: "a1", type: "LOZENGE", name: "", dosage: "", startedAt: QUIT }),
      logAidUse({ id: generateId(), aidId: "a1", timestamp: QUIT, note: "" }),
    ]);
    expect(errs(doc)).toEqual(["Quit aid missing not found", "Quit aid missing not found", null, null]);
    expect(doc.state.global.aids[0]).toMatchObject({ name: null, dosage: null, endedAt: null });
    expect(doc.state.global.aidUses).toHaveLength(1);
    expect(doc.state.global.aidUses[0].note).toBeNull();
  });
});

describe("support errors", () => {
  it("rejects empty names and unknown contacts", () => {
    const doc = run([
      addSupportContact({ id: generateId(), name: "  " }),
      removeSupportContact({ id: "missing" }),
      addSupportContact({ id: "c1", name: "Kim", phone: "", relation: "" }),
    ]);
    expect(errs(doc)).toEqual(["Contact name must not be empty", "Contact missing not found", null]);
    expect(doc.state.global.supportContacts).toEqual([{ id: "c1", name: "Kim", phone: null, relation: null }]);
  });
});
