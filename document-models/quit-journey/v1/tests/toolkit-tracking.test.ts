import type { AidUse, DrinkEntry, IfThenPlan, MedicationPlan, RiskyPlace, TakeHome } from "document-models/quit-journey/v1";
import {
  COMMON_DRINKS,
  distanceMeters,
  drinkWeek,
  estimateDrink,
  localDateKey,
  logDrink,
  medicationToday,
  placesNear,
  plansForTrigger,
  reducer,
  setQuitPlan,
  STANDARD_DRINKS,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState, planInput } from "./helpers.js";

const at = (day: number, hour = 12) => new Date(2026, 6, day, hour).getTime();
const iso = (ms: number) => new Date(ms).toISOString();
const key = (day: number) => localDateKey(at(day));

describe("standard drinks", () => {
  it("lists common definitions", () => {
    const g = Object.fromEntries(STANDARD_DRINKS.map((s) => [s.country, s.grams]));
    expect(g).toMatchObject({ WHO: 10, "United Kingdom": 8, "United States": 14, Austria: 20, Japan: 20, Canada: 13.45, Germany: 10 });
  });

  it("estimates exactly like the LOG_DRINK reducer", () => {
    const cases: [number, number, number | null][] = [
      [568, 4.5, null],
      [175, 12.5, null],
      [25, 40, 8],
      [330, 5, 14],
      [500, 5, 13.45],
      [33.3, 7.7, 20],
      [1, 0.5, null],
      [4999, 99.9, 8],
    ];
    for (const [volumeMl, abvPercent, grams] of cases) {
      let doc = utils.createDocument();
      doc = reducer(doc, setQuitPlan(planInput({ productType: "ALCOHOL", standardDrinkGrams: grams })));
      doc = reducer(doc, logDrink({ id: "d", slipId: "s", timestamp: iso(at(1)), beverage: "OTHER", volumeMl, abvPercent }));
      const [stored] = doc.state.global.drinks ?? [];
      const est = estimateDrink(volumeMl, abvPercent, grams ?? undefined);
      expect(est).toEqual({ gramsAlcohol: stored.gramsAlcohol, standardDrinks: stored.standardDrinks });
      expect(doc.state.global.slips[0].units).toBe(est.standardDrinks);
    }
  });

  it("has sensible presets", () => {
    expect(estimateDrink(568, 4.5)).toEqual({ gramsAlcohol: 20.2, standardDrinks: 2 });
    const cocktail = COMMON_DRINKS.find((d) => d.key === "cocktail");
    expect(cocktail && estimateDrink(cocktail.volumeMl, cocktail.abvPercent).standardDrinks).toBe(2);
    expect(new Set(COMMON_DRINKS.map((d) => d.key)).size).toBe(COMMON_DRINKS.length);
  });

  it("sums the last 7 local days", () => {
    const drink = (ms: number, standardDrinks: number, gramsAlcohol: number): DrinkEntry => ({
      id: `d${ms}`,
      slipId: `s${ms}`,
      timestamp: iso(ms),
      beverage: "BEER",
      volumeMl: 330,
      abvPercent: 5,
      standardDrinks,
      gramsAlcohol,
    });
    const state = makeState({
      drinks: [drink(at(14, 23), 1.3, 13), drink(at(14, 1), 0.1, 1), drink(at(9, 0), 0.2, 2), drink(at(7, 23), 5, 50), drink(at(15), 9, 90)],
    });
    expect(drinkWeek(state, at(14, 23))).toEqual({ standardDrinks: 1.6, gramsAlcohol: 16, drinkingDays: 2 });
    expect(drinkWeek(makeState(), at(14))).toEqual({ standardDrinks: 0, gramsAlcohol: 0, drinkingDays: 0 });
  });
});

describe("medicationToday", () => {
  const plan: MedicationPlan = {
    id: "m1",
    aidId: "bup",
    source: "CLINICIAN",
    startDate: key(1),
    note: null,
    steps: [
      { id: "s1", fromDay: 1, dose: "8 mg", timesPerDay: 1 },
      { id: "s2", fromDay: 4, dose: "12 mg", timesPerDay: 1 },
      { id: "s3", fromDay: 8, dose: "16 mg", timesPerDay: 2 },
    ],
  };
  const use = (ms: number, aidId = "bup"): AidUse => ({ id: `u${ms}${aidId}`, aidId, timestamp: iso(ms), beforeDrinking: null, note: null });
  const takeHome = (id: string, day: number, doses: number, aidId = "bup"): TakeHome => ({ id, aidId, doses, pickedUpOn: key(day) });

  it("picks the active step by day", () => {
    const state = makeState({ medicationPlans: [plan] });
    expect(medicationToday(state, at(1, 0))[0]).toMatchObject({ day: 1, dose: "8 mg", timesPerDay: 1, takenToday: 0, takeHomeRemaining: null });
    expect(medicationToday(state, at(3, 23))[0].dose).toBe("8 mg");
    expect(medicationToday(state, at(4))[0].dose).toBe("12 mg");
    expect(medicationToday(state, at(20))[0]).toMatchObject({ day: 20, dose: "16 mg", timesPerDay: 2 });
  });

  it("skips plans that have not started", () => {
    expect(medicationToday(makeState({ medicationPlans: [{ ...plan, startDate: key(10) }] }), at(9))).toEqual([]);
    expect(medicationToday(makeState(), at(9))).toEqual([]);
  });

  it("counts today's doses and take-home doses left", () => {
    const state = makeState({
      medicationPlans: [plan],
      aidUses: [use(at(2, 9)), use(at(3, 9)), use(at(5, 8)), use(at(5, 20)), use(at(5, 9), "other"), use(at(1, 9))],
      takeHomes: [takeHome("t1", 2, 3), takeHome("t2", 4, 4), takeHome("tx", 1, 99, "other")],
    });
    const [today] = medicationToday(state, at(5, 21));
    expect(today.takenToday).toBe(2);
    // 7 picked up since day 2; 4 doses logged on/after day 2 (the day-1 dose is before the first pick-up).
    expect(today.takeHomeRemaining).toBe(3);
  });

  it("never reports negative take-homes", () => {
    const state = makeState({ medicationPlans: [plan], aidUses: [use(at(2)), use(at(3))], takeHomes: [takeHome("t1", 2, 1)] });
    expect(medicationToday(state, at(3))[0].takeHomeRemaining).toBe(0);
  });
});

describe("plansForTrigger", () => {
  const p = (id: string, trigger: IfThenPlan["trigger"], createdDay: number, reviewedDay: number | null = null): IfThenPlan => ({
    id,
    trigger,
    ifText: "if",
    thenText: "then",
    strategy: null,
    createdAt: iso(at(createdDay)),
    lastReviewedAt: reviewedDay === null ? null : iso(at(reviewedDay)),
  });
  const plans = [p("g-old", null, 1), p("s-old", "STRESS", 1, 9), p("s-new", "STRESS", 5), p("c", "COFFEE", 3), p("g-new", null, 4)];

  it("puts matching plans first, then general ones, freshest first", () => {
    expect(plansForTrigger(plans, "STRESS").map((x) => x.id)).toEqual(["s-old", "s-new", "g-new", "g-old"]);
    expect(plansForTrigger(plans, "BOREDOM").map((x) => x.id)).toEqual(["g-new", "g-old"]);
    expect(plansForTrigger(plans, null).map((x) => x.id)).toEqual(["g-new", "g-old", "s-old", "s-new", "c"]);
    expect(plansForTrigger([], "STRESS")).toEqual([]);
  });
});

describe("risky places", () => {
  it("computes haversine distances", () => {
    const berlin = { lat: 52.52, lng: 13.405 };
    const paris = { lat: 48.8566, lng: 2.3522 };
    expect(distanceMeters(berlin, berlin)).toBe(0);
    expect(distanceMeters(berlin, paris) / 1000).toBeCloseTo(878, -1);
    // 0.001° latitude ≈ 111 m.
    expect(distanceMeters({ lat: 0, lng: 0 }, { lat: 0.001, lng: 0 })).toBeCloseTo(111.2, 0);
  });

  it("returns places whose radius contains the position, nearest first", () => {
    const place = (id: string, lat: number, radiusM: number): RiskyPlace => ({ id, label: id, lat, lng: 0, radiusM, planId: null });
    const places = [place("far", 0.01, 500), place("near", 0.001, 200), place("edge", 0.002, 230), place("tiny", 0.0005, 10)];
    expect(placesNear(places, { lat: 0, lng: 0 }).map((x) => x.id)).toEqual(["near", "edge"]);
    expect(placesNear([], { lat: 0, lng: 0 })).toEqual([]);
  });
});
