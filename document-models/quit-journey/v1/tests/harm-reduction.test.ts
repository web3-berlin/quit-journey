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
  isQuitJourneyDocument,
  logAidUse,
  logCraving,
  logDrink,
  logDrugCheck,
  logGamblingLoss,
  logScreenTime,
  logSlip,
  markNaloxoneUsed,
  recordAssessment,
  recordTakeHome,
  removeNaloxoneKit,
  reviewIfThenPlan,
  setMedicationPlan,
  setQuitPlan,
  startProgram,
  startSafetyCheck,
  updateIfThenPlan,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import {
  addDays,
  errs,
  legacyToolkitDocument,
  localErrs,
  planInput,
  QUIT,
  run,
  storedPlan,
  TOOLKIT_COLLECTIONS,
} from "./helpers.js";

const t = (days: number) => addDays(QUIT, days);

describe("harm-reduction & toolkit scenario", () => {
  it("chains safety, plans, tracking, assessments, medication and programs", () => {
    const doc = run([
      setQuitPlan(planInput({ productType: "ALCOHOL", standardDrinkGrams: 14 })), // 0
      addQuitAid({ id: "aid-nal", type: "NALTREXONE", startedAt: QUIT }), // 1
      addQuitAid({ id: "aid-meth", type: "METHADONE", startedAt: QUIT }), // 2
      logAidUse({ id: "use1", aidId: "aid-nal", timestamp: t(1), beforeDrinking: true }), // 3
      logAidUse({ id: "use2", aidId: "aid-nal", timestamp: t(2), beforeDrinking: false }), // 4
      logCraving({ id: "cr1", timestamp: t(1), intensity: 4, intensityAfter: 2, trigger: "PAYDAY", outcome: "RESISTED" }), // 5
      logCraving({ id: "cr2", timestamp: t(1), intensity: 5, intensityAfter: 5, trigger: "PAYDAY", outcome: "RESISTED" }), // 6
      // Naloxone kits
      addNaloxoneKit({ id: "kit1", kind: "NASAL_SPRAY_4MG", location: " bag ", expiresOn: "2027-03-01", addedAt: t(0) }), // 7
      addNaloxoneKit({ id: "kit2", kind: "INJECTABLE", addedAt: t(0) }), // 8
      addNaloxoneKit({ id: "kit3", kind: "OTHER", location: "   ", expiresOn: "", addedAt: t(0) }), // 9
      markNaloxoneUsed({ id: "kit1", usedAt: t(3) }), // 10
      removeNaloxoneKit({ id: "kit2" }), // 11
      // Drug checks
      logDrugCheck({ id: "dc1", checkedAt: t(2), expectedSubstance: " heroin ", testType: "FENTANYL_STRIP", result: "POSITIVE", actions: ["DID_NOT_USE", "TOLD_SOMEONE"], note: "binned" }), // 12
      logDrugCheck({ id: "dc2", checkedAt: t(2), testType: "REAGENT_KIT", result: "NEGATIVE" }), // 13
      logDrugCheck({ id: "dc3", checkedAt: t(2), expectedSubstance: "  ", testType: "OTHER", result: "INCONCLUSIVE", note: "" }), // 14
      deleteDrugCheck({ id: "dc3" }), // 15
      // Exclusions
      addExclusion({ id: "ex1", scheme: "GAMSTOP", startDate: "2026-01-01", endDate: "2026-07-01", note: "5 years" }), // 16
      addExclusion({ id: "ex2", scheme: "BANK_BLOCK", startDate: "2026-01-02" }), // 17
      addExclusion({ id: "ex3", scheme: "VENUE", startDate: "2026-02-01", endDate: "2026-02-01" }), // 18
      deleteExclusion({ id: "ex3" }), // 19
      // If-then plans
      addIfThenPlan({ id: "p1", trigger: "STRESS", ifText: " If stressed ", thenText: " walk ", strategy: "WALK", createdAt: t(0) }), // 20
      addIfThenPlan({ id: "p2", ifText: "If payday", thenText: "pay rent first", createdAt: t(0) }), // 21
      updateIfThenPlan({ id: "p1", ifText: "If tense", thenText: "breathe" }), // 22
      updateIfThenPlan({ id: "p2", trigger: "PAYDAY", ifText: " If paid ", thenText: " surf it ", strategy: "URGE_SURFING" }), // 23
      reviewIfThenPlan({ id: "p2", reviewedAt: t(4) }), // 24
      deleteIfThenPlan({ id: "p1" }), // 25
      // Drinks (each also logs a slip)
      logSlip({ id: "slip-other", timestamp: t(3), units: 1 }), // 26
      logDrink({ id: "d1", slipId: "slip-d1", timestamp: t(3), beverage: "BEER", volumeMl: 500, abvPercent: 5, note: "pub" }), // 27
      logDrink({ id: "d2", slipId: "slip-d2", timestamp: t(4), beverage: "WINE", volumeMl: 150, abvPercent: 12 }), // 28
      deleteDrink({ id: "d1" }), // 29
      // Screen time upserts per date
      logScreenTime({ id: "st1", date: "2026-01-05", minutes: 120 }), // 30
      logScreenTime({ id: "st2", date: "2026-01-05", minutes: 90 }), // 31
      logScreenTime({ id: "st3", date: "2026-01-06", minutes: 0 }), // 32
      // Gambling losses
      logGamblingLoss({ id: "g1", date: "2026-01-05", amount: 50, note: "slots" }), // 33
      logGamblingLoss({ id: "g2", date: "2026-01-06", amount: 0.5 }), // 34
      deleteGamblingLoss({ id: "g1" }), // 35
      // Assessments
      recordAssessment({ id: "a1", instrument: "AUDIT_C", takenAt: t(0), answers: [4, 4, 4] }), // 36
      recordAssessment({ id: "a2", instrument: "BARC_10", takenAt: t(5), answers: [6, 6, 6, 6, 6, 1, 1, 1, 1, 1] }), // 37
      deleteAssessment({ id: "a1" }), // 38
      // Medication plans: one per aid, a new one replaces the old one
      setMedicationPlan({ id: "mp1", aidId: "aid-nal", source: "CLINICIAN", startDate: "2026-01-01", note: "with food", steps: [{ id: "s1", fromDay: 1, dose: " 25 mg ", timesPerDay: 1 }, { id: "s2", fromDay: 4, dose: "50 mg", timesPerDay: 1 }] }), // 39
      setMedicationPlan({ id: "mp2", aidId: "aid-meth", source: "LEAFLET", startDate: "2026-01-01", steps: [{ id: "s3", fromDay: 1, dose: "30 mg", timesPerDay: 1 }] }), // 40
      setMedicationPlan({ id: "mp3", aidId: "aid-nal", source: "SELF", startDate: "2026-01-10", note: "", steps: [{ id: "s4", fromDay: 1, dose: "50 mg", timesPerDay: 2 }] }), // 41
      clearMedicationPlan({ aidId: "aid-meth" }), // 42
      recordTakeHome({ id: "th1", aidId: "aid-meth", pickedUpOn: "2026-01-08", doses: 6 }), // 43
      // Programs
      startProgram({ id: "pr1", program: "DRY_MONTH", startedAt: t(0) }), // 44
      completeMission({ programId: "pr1", missionKey: "day-1" }), // 45
      completeMission({ programId: "pr1", missionKey: "day-1" }), // 46 (no duplicate)
      completeMission({ programId: "pr1", missionKey: "day-2" }), // 47
      endProgram({ programId: "pr1", endedAt: t(6) }), // 48
      startProgram({ id: "pr2", program: "DRY_MONTH", startedAt: t(7) }), // 49 (allowed after the first ended)
      startProgram({ id: "pr3", program: "T_BREAK", startedAt: t(7) }), // 50
      // Local scope: safety checks and risky places
      startSafetyCheck({ id: "sc1", startedAt: t(1), durationMinutes: 30, note: "at home", contactIds: ["c1"] }), // L0
      endSafetyCheck({ id: "sc1", endedAt: t(1), outcome: "OK" }), // L1
      startSafetyCheck({ id: "sc2", startedAt: t(2), durationMinutes: 240, note: "" }), // L2
      endSafetyCheck({ id: "sc2", endedAt: t(2), outcome: "ALARM" }), // L3
      startSafetyCheck({ id: "sc3", startedAt: t(3), durationMinutes: 1 }), // L4
      endSafetyCheck({ id: "sc3", endedAt: t(3), outcome: "CANCELLED" }), // L5
      addRiskyPlace({ id: "rp1", label: " Corner pub ", lat: 52.5, lng: 13.4, radiusM: 25, planId: "p2" }), // L6
      addRiskyPlace({ id: "rp2", label: "Casino", lat: -90, lng: 180, radiusM: 5000 }), // L7
      addRiskyPlace({ id: "rp3", label: "Corner shop", lat: 90, lng: -180, radiusM: 100 }), // L8
      deleteRiskyPlace({ id: "rp3" }), // L9
    ]);

    expect(isQuitJourneyDocument(doc)).toBe(true);
    expect(errs(doc)).toEqual(Array<null>(51).fill(null));
    expect(localErrs(doc)).toEqual(Array<null>(10).fill(null));

    const s = doc.state.global;
    expect(s.plan).toEqual(storedPlan({ productType: "ALCOHOL", standardDrinkGrams: 14 }));
    expect(s.aidUses.map((u) => u.beforeDrinking)).toEqual([true, false]);
    expect(s.cravings.map((c) => c.intensityAfter)).toEqual([2, 5]);

    expect(s.naloxoneKits).toEqual([
      { id: "kit1", kind: "NASAL_SPRAY_4MG", location: "bag", expiresOn: "2027-03-01", addedAt: t(0), usedAt: t(3) },
      { id: "kit3", kind: "OTHER", location: null, expiresOn: null, addedAt: t(0), usedAt: null },
    ]);
    expect(s.drugChecks).toEqual([
      { id: "dc1", checkedAt: t(2), expectedSubstance: "heroin", testType: "FENTANYL_STRIP", result: "POSITIVE", actions: ["DID_NOT_USE", "TOLD_SOMEONE"], note: "binned" },
      { id: "dc2", checkedAt: t(2), expectedSubstance: null, testType: "REAGENT_KIT", result: "NEGATIVE", actions: [], note: null },
    ]);
    expect(s.exclusions).toEqual([
      { id: "ex1", scheme: "GAMSTOP", startDate: "2026-01-01", endDate: "2026-07-01", note: "5 years" },
      { id: "ex2", scheme: "BANK_BLOCK", startDate: "2026-01-02", endDate: null, note: null },
    ]);
    expect(s.ifThenPlans).toEqual([
      { id: "p2", trigger: "PAYDAY", ifText: "If paid", thenText: "surf it", strategy: "URGE_SURFING", createdAt: t(0), lastReviewedAt: t(4) },
    ]);

    // 150 ml * 12 % * 0.789 = 14.2 g; with a 14 g standard drink that is 1.0.
    expect(s.drinks).toEqual([
      { id: "d2", timestamp: t(4), beverage: "WINE", volumeMl: 150, abvPercent: 12, gramsAlcohol: 14.2, standardDrinks: 1, slipId: "slip-d2" },
    ]);
    // Deleting d1 removed its slip and kept unrelated slips.
    expect(s.slips).toEqual([
      { id: "slip-other", timestamp: t(3), units: 1, trigger: null, note: null },
      { id: "slip-d2", timestamp: t(4), units: 1, trigger: null, note: null },
    ]);

    expect(s.screenTime).toEqual([
      { id: "st1", date: "2026-01-05", minutes: 90 },
      { id: "st3", date: "2026-01-06", minutes: 0 },
    ]);
    expect(s.gamblingLosses).toEqual([{ id: "g2", date: "2026-01-06", amount: 0.5, note: null }]);
    expect(s.assessments).toEqual([
      { id: "a2", instrument: "BARC_10", takenAt: t(5), answers: [6, 6, 6, 6, 6, 1, 1, 1, 1, 1], score: 35 },
    ]);
    expect(s.medicationPlans).toEqual([
      { id: "mp3", aidId: "aid-nal", source: "SELF", startDate: "2026-01-10", note: null, steps: [{ id: "s4", fromDay: 1, dose: "50 mg", timesPerDay: 2 }] },
    ]);
    expect(s.takeHomes).toEqual([{ id: "th1", aidId: "aid-meth", pickedUpOn: "2026-01-08", doses: 6 }]);
    expect(s.programs).toEqual([
      { id: "pr1", program: "DRY_MONTH", startedAt: t(0), completedMissions: ["day-1", "day-2"], endedAt: t(6) },
      { id: "pr2", program: "DRY_MONTH", startedAt: t(7), completedMissions: [], endedAt: null },
      { id: "pr3", program: "T_BREAK", startedAt: t(7), completedMissions: [], endedAt: null },
    ]);

    const l = doc.state.local;
    expect(l.safetyChecks).toEqual([
      { id: "sc1", startedAt: t(1), durationMinutes: 30, note: "at home", contactIds: ["c1"], endedAt: t(1), outcome: "OK" },
      { id: "sc2", startedAt: t(2), durationMinutes: 240, note: null, contactIds: [], endedAt: t(2), outcome: "ALARM" },
      { id: "sc3", startedAt: t(3), durationMinutes: 1, note: null, contactIds: [], endedAt: t(3), outcome: "CANCELLED" },
    ]);
    expect(l.riskyPlaces).toEqual([
      { id: "rp1", label: "Corner pub", lat: 52.5, lng: 13.4, radiusM: 25, planId: "p2" },
      { id: "rp2", label: "Casino", lat: -90, lng: 180, radiusM: 5000, planId: null },
    ]);
    // Local operations never leak into the shared history.
    expect(doc.operations.global.some((o) => o.action.type === "START_SAFETY_CHECK")).toBe(false);
  });

  it("the plan's standard drink size is optional (5-30 g); without it a drink is 10 g", () => {
    const doc = run([
      setQuitPlan(planInput({ productType: "ALCOHOL", standardDrinkGrams: 5 })),
      setQuitPlan(planInput({ productType: "ALCOHOL", standardDrinkGrams: 30 })),
      setQuitPlan(planInput({ productType: "ALCOHOL" })),
      logDrink({ id: "d1", slipId: "s1", timestamp: t(1), beverage: "SPIRITS", volumeMl: 40, abvPercent: 40 }),
    ]);
    expect(errs(doc)).toEqual([null, null, null, null]);
    expect(doc.state.global.plan?.standardDrinkGrams).toBeNull();
    // 40 ml * 40 % * 0.789 = 12.6 g -> 1.3 standard drinks of 10 g
    expect(doc.state.global.drinks).toMatchObject([{ gramsAlcohol: 12.6, standardDrinks: 1.3 }]);
    expect(doc.state.global.slips).toMatchObject([{ id: "s1", units: 1.3 }]);
  });
});

describe("backward compatibility: documents saved before the toolkit modules", () => {
  it("loads without the new collections", () => {
    const doc = legacyToolkitDocument();
    for (const key of TOOLKIT_COLLECTIONS) expect(key in doc.state.global).toBe(false);
    expect(doc.state.local).toEqual({});
    expect(isQuitJourneyDocument(doc)).toBe(true);
  });

  it("lookups on missing collections report not-found and leave the state untouched", () => {
    const legacy = legacyToolkitDocument();
    const doc = run(
      [
        markNaloxoneUsed({ id: "x", usedAt: t(1) }),
        removeNaloxoneKit({ id: "x" }),
        deleteDrugCheck({ id: "x" }),
        deleteExclusion({ id: "x" }),
        updateIfThenPlan({ id: "x", ifText: "a", thenText: "b" }),
        reviewIfThenPlan({ id: "x", reviewedAt: t(1) }),
        deleteIfThenPlan({ id: "x" }),
        deleteDrink({ id: "x" }),
        deleteGamblingLoss({ id: "x" }),
        deleteAssessment({ id: "x" }),
        clearMedicationPlan({ aidId: "x" }),
        completeMission({ programId: "x", missionKey: "m" }),
        endProgram({ programId: "x", endedAt: t(1) }),
        endSafetyCheck({ id: "x", endedAt: t(1), outcome: "OK" }),
        deleteRiskyPlace({ id: "x" }),
      ],
      legacy,
    );
    expect(errs(doc)).toEqual([
      "Naloxone kit x not found",
      "Naloxone kit x not found",
      "Drug check x not found",
      "Exclusion x not found",
      "Plan x not found",
      "Plan x not found",
      "Plan x not found",
      "Drink x not found",
      "Loss x not found",
      "Assessment x not found",
      "No plan for quit aid x",
      "Program x not found",
      "Program x not found",
    ]);
    expect(localErrs(doc)).toEqual(["Safety check x not found", "Place x not found"]);
    expect(doc.state).toEqual(legacy.state);
  });

  it("the first write to each missing collection creates it", () => {
    const doc = run(
      [
        addQuitAid({ id: "aid", type: "BUPRENORPHINE", startedAt: QUIT }),
        addNaloxoneKit({ id: "kit", kind: "AUTO_INJECTOR", addedAt: t(0) }),
        logDrugCheck({ id: "dc", checkedAt: t(0), testType: "XYLAZINE_STRIP", result: "NEGATIVE", actions: [] }),
        addExclusion({ id: "ex", scheme: "OASIS", startDate: "2026-01-01" }),
        addIfThenPlan({ id: "p", ifText: "if", thenText: "then", createdAt: t(0) }),
        logDrink({ id: "d", slipId: "s", timestamp: t(1), beverage: "CIDER", volumeMl: 330, abvPercent: 4.5 }),
        logScreenTime({ id: "st", date: "2026-01-02", minutes: 1440 }),
        logGamblingLoss({ id: "g", date: "2026-01-02", amount: 10 }),
        recordAssessment({ id: "a", instrument: "HSI", takenAt: t(0), answers: [0, 0] }),
        setMedicationPlan({ id: "mp", aidId: "aid", source: "CLINICIAN", startDate: "2026-01-01", steps: [{ id: "s1", fromDay: 1, dose: "8 mg", timesPerDay: 1 }] }),
        recordTakeHome({ id: "th", aidId: "aid", pickedUpOn: "2026-01-03", doses: 1 }),
        startProgram({ id: "pr", program: "QUIT_VAPING", startedAt: t(0) }),
        startSafetyCheck({ id: "sc", startedAt: t(0), durationMinutes: 60 }),
        addRiskyPlace({ id: "rp", label: "Bar", lat: 0, lng: 0, radiusM: 200 }),
      ],
      legacyToolkitDocument(),
    );
    expect(errs(doc)).toEqual(Array<null>(12).fill(null));
    expect(localErrs(doc)).toEqual([null, null]);
    const s = doc.state.global;
    for (const key of TOOLKIT_COLLECTIONS) expect(s[key]).toHaveLength(1);
    // No plan at all: 330 ml * 4.5 % * 0.789 = 11.7 g -> 1.2 drinks of 10 g.
    expect(s.drinks).toMatchObject([{ gramsAlcohol: 11.7, standardDrinks: 1.2 }]);
    expect(s.slips).toMatchObject([{ id: "s", units: 1.2 }]);
    expect(s.assessments).toMatchObject([{ score: 0 }]);
    expect(s.takeHomes).toEqual([{ id: "th", aidId: "aid", pickedUpOn: "2026-01-03", doses: 1 }]);
    expect(doc.state.local.safetyChecks).toMatchObject([{ id: "sc", outcome: "ACTIVE", endedAt: null }]);
    expect(doc.state.local.riskyPlaces).toMatchObject([{ id: "rp", label: "Bar" }]);
  });
});
