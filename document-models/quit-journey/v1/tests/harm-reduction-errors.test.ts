import type {
  AssessmentInstrument,
  DoseStepInput,
  QuitJourneyAction,
  QuitJourneyDocument,
} from "document-models/quit-journey/v1";
import {
  addExclusion,
  addIfThenPlan,
  addNaloxoneKit,
  addQuitAid,
  addRiskyPlace,
  clearMedicationPlan,
  completeMission,
  deleteAssessment,
  deleteDrink,
  deleteDrugCheck,
  deleteExclusion,
  deleteGamblingLoss,
  deleteIfThenPlan,
  deleteRiskyPlace,
  endProgram,
  endSafetyCheck,
  logAidUse,
  logCraving,
  logDrink,
  logDrugCheck,
  logGamblingLoss,
  logScreenTime,
  markNaloxoneUsed,
  recordAssessment,
  recordTakeHome,
  reducer,
  removeNaloxoneKit,
  reviewIfThenPlan,
  setMedicationPlan,
  setQuitPlan,
  startProgram,
  startSafetyCheck,
  updateIfThenPlan,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { addDays, errs, localErrs, planInput, QUIT, run } from "./helpers.js";

const t = (days: number) => addDays(QUIT, days);

/**
 * Dispatches one action that must fail: the operation is recorded at the next
 * index of its scope with the given error, and the state is unchanged.
 */
function expectRejected(doc: QuitJourneyDocument, action: QuitJourneyAction, message: string) {
  const scope = action.scope === "local" ? "local" : "global";
  const index = doc.operations[scope].length;
  const next = reducer(doc, action);
  expect(next.operations[scope]).toHaveLength(index + 1);
  expect(next.operations[scope][index].error).toBe(message);
  expect(next.state).toEqual(doc.state);
}

/** A document with one entry in every toolkit collection to look up against. */
function seeded(): QuitJourneyDocument {
  const doc = run([
    setQuitPlan(planInput({ productType: "ALCOHOL" })),
    addQuitAid({ id: "aid", type: "NALTREXONE", startedAt: QUIT }),
    addNaloxoneKit({ id: "kit", kind: "NASAL_SPRAY_8MG", addedAt: t(0) }),
    logDrugCheck({ id: "dc", checkedAt: t(0), testType: "BENZO_STRIP", result: "NEGATIVE" }),
    addExclusion({ id: "ex", scheme: "GAMBAN", startDate: "2026-01-01" }),
    addIfThenPlan({ id: "p", ifText: "if", thenText: "then", createdAt: t(0) }),
    logDrink({ id: "d", slipId: "ds", timestamp: t(1), beverage: "COCKTAIL", volumeMl: 200, abvPercent: 10 }),
    logGamblingLoss({ id: "g", date: "2026-01-02", amount: 5 }),
    recordAssessment({ id: "a", instrument: "AUDIT_C", takenAt: t(0), answers: [0, 0, 0] }),
    setMedicationPlan({ id: "mp", aidId: "aid", source: "SELF", startDate: "2026-01-01", steps: [{ id: "s", fromDay: 1, dose: "50 mg", timesPerDay: 1 }] }),
    startProgram({ id: "pr", program: "SKILL_LESSONS", startedAt: t(0) }),
    startProgram({ id: "done", program: "DAILY_MISSIONS", startedAt: t(0) }),
    endProgram({ programId: "done", endedAt: t(1) }),
    startSafetyCheck({ id: "sc-ended", startedAt: t(0), durationMinutes: 10 }),
    endSafetyCheck({ id: "sc-ended", endedAt: t(0), outcome: "OK" }),
    startSafetyCheck({ id: "sc", startedAt: t(1), durationMinutes: 10 }),
    addRiskyPlace({ id: "rp", label: "Bar", lat: 1, lng: 1, radiusM: 50 }),
  ]);
  expect(errs(doc).every((e) => e === null)).toBe(true);
  expect(localErrs(doc).every((e) => e === null)).toBe(true);
  return doc;
}

describe("changed operations", () => {
  it("LOG_CRAVING validates the optional intensity after coping", () => {
    const doc = run([]);
    for (const intensityAfter of [0, 6, 2.5]) {
      expectRejected(
        doc,
        logCraving({ id: "c", timestamp: t(1), intensity: 3, intensityAfter, trigger: "STRESS", outcome: "RESISTED" }),
        "Intensity must be an integer between 1 and 5",
      );
    }
    const ok = run([
      logCraving({ id: "c1", timestamp: t(1), intensity: 3, intensityAfter: 1, trigger: "STRESS", outcome: "RESISTED" }),
      logCraving({ id: "c2", timestamp: t(1), intensity: 3, intensityAfter: null, trigger: "STRESS", outcome: "SMOKED" }),
    ]);
    expect(ok.state.global.cravings.map((c) => c.intensityAfter)).toEqual([1, null]);
  });

  it("LOG_AID_USE stores beforeDrinking, null when omitted", () => {
    const doc = run([
      addQuitAid({ id: "aid", type: "NALTREXONE", startedAt: QUIT }),
      logAidUse({ id: "u1", aidId: "aid", timestamp: t(1) }),
      logAidUse({ id: "u2", aidId: "aid", timestamp: t(1), beforeDrinking: null }),
    ]);
    expect(doc.state.global.aidUses.map((u) => u.beforeDrinking)).toEqual([null, null]);
  });

  it("SET_QUIT_PLAN rejects a standard drink size outside 5-30 g", () => {
    const doc = run([setQuitPlan(planInput())]);
    for (const standardDrinkGrams of [4.9, 30.1]) {
      expectRejected(
        doc,
        setQuitPlan(planInput({ productType: "ALCOHOL", standardDrinkGrams })),
        "unitsPerDay and unitsPerPack must be positive and packPrice must not be negative",
      );
    }
  });
});

describe("safety errors", () => {
  const doc = seeded();

  it("naloxone kits", () => {
    for (const expiresOn of ["2027-3-1", "next year"]) {
      expectRejected(
        doc,
        addNaloxoneKit({ id: "k2", kind: "OTHER", expiresOn, addedAt: t(0) }),
        "Expiry date must be a calendar date in YYYY-MM-DD format",
      );
    }
    expectRejected(doc, markNaloxoneUsed({ id: "nope", usedAt: t(1) }), "Naloxone kit nope not found");
    expectRejected(doc, removeNaloxoneKit({ id: "nope" }), "Naloxone kit nope not found");
  });

  it("drug checks and exclusions", () => {
    expectRejected(doc, deleteDrugCheck({ id: "nope" }), "Drug check nope not found");
    const invalid = "Dates must be YYYY-MM-DD and the end date must not be before the start date";
    expectRejected(doc, addExclusion({ id: "e", scheme: "OTHER", startDate: "01.01.2026" }), invalid);
    expectRejected(doc, addExclusion({ id: "e", scheme: "OTHER", startDate: "2026-01-01", endDate: "2026-13" }), invalid);
    expectRejected(doc, addExclusion({ id: "e", scheme: "OTHER", startDate: "2026-01-02", endDate: "2026-01-01" }), invalid);
    expectRejected(doc, deleteExclusion({ id: "nope" }), "Exclusion nope not found");
  });

  it("safety checks (local scope)", () => {
    const duration = "Duration must be between 1 and 240 minutes";
    for (const durationMinutes of [0, 241, 1.5]) {
      expectRejected(doc, startSafetyCheck({ id: "x", startedAt: t(2), durationMinutes }), duration);
    }
    expectRejected(doc, startSafetyCheck({ id: "x", startedAt: t(2), durationMinutes: 5 }), "A safety check is already running");
    expectRejected(doc, endSafetyCheck({ id: "nope", endedAt: t(2), outcome: "OK" }), "Safety check nope not found");
    const badEnd = "Only an active check can be ended, and not with outcome ACTIVE";
    expectRejected(doc, endSafetyCheck({ id: "sc-ended", endedAt: t(2), outcome: "CANCELLED" }), badEnd);
    expectRejected(doc, endSafetyCheck({ id: "sc", endedAt: t(2), outcome: "ACTIVE" }), badEnd);
  });

  it("risky places (local scope) enforce label, coordinates and radius bounds", () => {
    const message = "A place needs a name, valid coordinates and a radius of 25-5000 m";
    const base = { id: "x", label: "Pub", lat: 0, lng: 0, radiusM: 100 };
    for (const override of [
      { label: "   " },
      { lat: -90.01 },
      { lat: 90.01 },
      { lng: -180.01 },
      { lng: 180.01 },
      { radiusM: 24 },
      { radiusM: 5001 },
    ]) {
      expectRejected(doc, addRiskyPlace({ ...base, ...override }), message);
    }
    expectRejected(doc, deleteRiskyPlace({ id: "nope" }), "Place nope not found");
  });
});

describe("if-then plan errors", () => {
  const doc = seeded();
  it("rejects blank parts and unknown plans", () => {
    const blank = "Both the 'if' and the 'then' part are needed";
    expectRejected(doc, addIfThenPlan({ id: "q", ifText: " ", thenText: "x", createdAt: t(0) }), blank);
    expectRejected(doc, addIfThenPlan({ id: "q", ifText: "x", thenText: " ", createdAt: t(0) }), blank);
    expectRejected(doc, updateIfThenPlan({ id: "nope", ifText: "x", thenText: "y" }), "Plan nope not found");
    expectRejected(doc, updateIfThenPlan({ id: "p", ifText: " ", thenText: "y" }), blank);
    expectRejected(doc, updateIfThenPlan({ id: "p", ifText: "x", thenText: "" }), blank);
    expectRejected(doc, reviewIfThenPlan({ id: "nope", reviewedAt: t(1) }), "Plan nope not found");
    expectRejected(doc, deleteIfThenPlan({ id: "nope" }), "Plan nope not found");
  });
});

describe("tracking errors", () => {
  const doc = seeded();
  it("drinks", () => {
    const message = "Volume must be 1-5000 ml and ABV between 0 and 100 %";
    const base = { id: "x", slipId: "xs", timestamp: t(2), beverage: "BEER" as const, volumeMl: 330, abvPercent: 5 };
    for (const override of [{ volumeMl: 0 }, { volumeMl: 5001 }, { abvPercent: 0 }, { abvPercent: 100.1 }]) {
      expectRejected(doc, logDrink({ ...base, ...override }), message);
    }
    expectRejected(doc, deleteDrink({ id: "nope" }), "Drink nope not found");
  });

  it("screen time and gambling losses", () => {
    const screen = "Date must be YYYY-MM-DD and minutes 0-1440";
    for (const [date, minutes] of [["2026-1-5", 10], ["2026-01-05", 1.5], ["2026-01-05", -1], ["2026-01-05", 1441]] as const) {
      expectRejected(doc, logScreenTime({ id: "x", date, minutes }), screen);
    }
    const loss = "Date must be YYYY-MM-DD and the amount above 0";
    expectRejected(doc, logGamblingLoss({ id: "x", date: "yesterday", amount: 5 }), loss);
    expectRejected(doc, logGamblingLoss({ id: "x", date: "2026-01-05", amount: 0 }), loss);
    expectRejected(doc, deleteGamblingLoss({ id: "nope" }), "Loss nope not found");
  });
});

describe("assessment errors", () => {
  const doc = seeded();
  const shapes: [AssessmentInstrument, number, number, number][] = [
    ["AUDIT_C", 3, 0, 4],
    ["AUDIT", 10, 0, 4],
    ["HSI", 2, 0, 3],
    ["CUDIT_R", 8, 0, 4],
    ["PGSI", 9, 0, 3],
    ["BARC_10", 10, 1, 6],
    ["SOWS", 16, 0, 4],
    ["SAWS", 10, 0, 3],
    ["CWS", 19, 0, 10],
    ["ACSA", 16, 0, 4],
  ];

  it.each(shapes)("%s needs %i answers between %i and %i", (instrument, count, min, max) => {
    const message = `${instrument} needs ${count} answers between ${min} and ${max}`;
    const record = (answers: number[]) => recordAssessment({ id: "x", instrument, takenAt: t(1), answers });
    const fill = (v: number, n = count) => Array<number>(n).fill(v);
    expectRejected(doc, record(fill(min, count - 1)), message);
    expectRejected(doc, record(fill(min, count + 1)), message);
    expectRejected(doc, record([...fill(min, count - 1), min - 1]), message);
    expectRejected(doc, record([...fill(min, count - 1), max + 1]), message);
    expectRejected(doc, record([...fill(min, count - 1), min + 0.5]), message);

    const ok = run([record(fill(min)), record(fill(max))], doc);
    expect(ok.state.global.assessments?.slice(-2).map((a) => a.score)).toEqual([min * count, max * count]);
  });

  it("deleting an unknown assessment", () => {
    expectRejected(doc, deleteAssessment({ id: "nope" }), "Assessment nope not found");
  });
});

describe("medication errors", () => {
  const doc = seeded();
  const invalid =
    "A plan needs a YYYY-MM-DD start date and steps starting on day 1 in increasing day order, each with a dose and at least one time per day";
  const step = (fromDay: number, over: Partial<DoseStepInput> = {}): DoseStepInput => ({
    id: `s${fromDay}`,
    fromDay,
    dose: "25 mg",
    timesPerDay: 1,
    ...over,
  });
  const plan = (steps: DoseStepInput[], startDate = "2026-01-01", aidId = "aid") =>
    setMedicationPlan({ id: "new", aidId, source: "CLINICIAN", startDate, steps });

  it("rejects an unknown quit aid", () => {
    expectRejected(doc, plan([step(1)], "2026-01-01", "nope"), "Quit aid nope not found");
  });

  it.each([
    ["a bad start date", [step(1)], "1 Jan 2026"],
    ["no steps", [], "2026-01-01"],
    ["a first step after day 1", [step(2)], "2026-01-01"],
    ["a first step on day 0", [step(0)], "2026-01-01"],
    ["repeated days", [step(1), step(3), step(3)], "2026-01-01"],
    ["decreasing days", [step(1), step(5), step(3)], "2026-01-01"],
    ["a fractional day", [step(1), step(2.5)], "2026-01-01"],
    ["an empty dose", [step(1), step(2, { dose: "  " })], "2026-01-01"],
    ["a fractional times per day", [step(1, { timesPerDay: 1.5 })], "2026-01-01"],
    ["zero times per day", [step(1), step(2, { timesPerDay: 0 })], "2026-01-01"],
  ] as const)("rejects %s", (_label, steps, startDate) => {
    expectRejected(doc, plan([...steps], startDate), invalid);
  });

  it("clearing and take-homes", () => {
    expectRejected(doc, clearMedicationPlan({ aidId: "nope" }), "No plan for quit aid nope");
    expectRejected(doc, recordTakeHome({ id: "x", aidId: "nope", pickedUpOn: "2026-01-02", doses: 3 }), "Quit aid nope not found");
    const message = "Pick-up date must be YYYY-MM-DD and doses 1-31";
    for (const [pickedUpOn, doses] of [["02/01/2026", 3], ["2026-01-02", 1.5], ["2026-01-02", 0], ["2026-01-02", 32]] as const) {
      expectRejected(doc, recordTakeHome({ id: "x", aidId: "aid", pickedUpOn, doses }), message);
    }
    const ok = run([recordTakeHome({ id: "th", aidId: "aid", pickedUpOn: "2026-01-02", doses: 31 })], doc);
    expect(ok.state.global.takeHomes).toEqual([{ id: "th", aidId: "aid", pickedUpOn: "2026-01-02", doses: 31 }]);
  });

  it("clearing removes only that aid's plan", () => {
    const ok = run([clearMedicationPlan({ aidId: "aid" })], doc);
    expect(errs(ok).at(-1)).toBeNull();
    expect(ok.state.global.medicationPlans).toEqual([]);
  });
});

describe("program errors", () => {
  const doc = seeded();
  it("rejects duplicates, unknown and ended programs", () => {
    expectRejected(doc, startProgram({ id: "x", program: "SKILL_LESSONS", startedAt: t(2) }), "SKILL_LESSONS is already running");
    expectRejected(doc, completeMission({ programId: "nope", missionKey: "m" }), "Program nope not found");
    expectRejected(doc, completeMission({ programId: "done", missionKey: "m" }), "The program has ended");
    expectRejected(doc, endProgram({ programId: "nope", endedAt: t(2) }), "Program nope not found");
    expectRejected(doc, endProgram({ programId: "done", endedAt: t(2) }), "The program has already ended");
  });
});
