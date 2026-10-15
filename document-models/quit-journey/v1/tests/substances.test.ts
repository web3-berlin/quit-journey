import type { ProductType, QuitJourneyState, QuitPlan, Slip } from "document-models/quit-journey/v1";
import {
  computeGamification,
  computeHealth,
  computeJourney,
  computeMoney,
  computeReduction,
  computeStreaks,
  HEALTH_MILESTONES,
  journeyPeriods,
  ProductTypeSchema,
  profileForPlan,
  substanceProfile,
  SUBSTANCE_GROUPS,
  XP,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState } from "./helpers.js";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const iso = (ms: number) => new Date(ms).toISOString();
/** Local-time clock: 15 June 2026, 12:00. */
const NOW = new Date(2026, 5, 15, 12).getTime();
const at = (day: number, hour: number) => new Date(2026, 5, day, hour).getTime();
const ALL_TYPES: ProductType[] = ProductTypeSchema.options;

function plan(quitAt: number, overrides: Partial<QuitPlan> = {}): QuitPlan {
  return {
    quitDateTime: iso(quitAt),
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
    ...overrides,
  };
}

const slip = (t: number, units = 1): Slip => ({ id: `s${t}`, timestamp: iso(t), units, trigger: null, note: null });

describe("substance profiles", () => {
  it("every product type has a grouped profile with a unit and milestones", () => {
    const grouped = SUBSTANCE_GROUPS.flatMap((g) => g.keys);
    expect([...grouped].sort()).toEqual([...ALL_TYPES].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
    for (const key of ALL_TYPES) {
      const p = substanceProfile(key);
      expect(p.key, key).toBe(key);
      expect(p.name.length, key).toBeGreaterThan(0);
      expect(p.unit.trim().length, key).toBeGreaterThan(0);
      expect(p.purchase.length, key).toBeGreaterThan(0);
      expect(p.freeWord.length, key).toBeGreaterThan(0);
      expect(p.milestones.length, key).toBeGreaterThanOrEqual(1);
      expect(new Set(p.milestones.map((m) => m.key)).size, key).toBe(p.milestones.length);
      for (const m of p.milestones) expect(m.afterMs, `${key}/${m.key}`).toBeGreaterThan(0);
    }
  });

  it("flags overdose risk and dangerous withdrawal with critical safety notes", () => {
    const overdose = ALL_TYPES.filter((k) => substanceProfile(k).overdoseRiskAfterBreak).sort();
    expect(overdose).toEqual(["BENZODIAZEPINES", "OPIOIDS"]);
    const withdrawal = ALL_TYPES.filter((k) => substanceProfile(k).dangerousWithdrawal).sort();
    expect(withdrawal).toEqual(["ALCOHOL", "BENZODIAZEPINES"]);
    for (const k of [...overdose, ...withdrawal]) {
      expect(substanceProfile(k).safety.some((s) => s.level === "critical"), k).toBe(true);
    }
    expect(substanceProfile("OPIOIDS").safety[0].body).toMatch(/naloxone/i);
    expect(substanceProfile("ALCOHOL").safety[0].body).toMatch(/seizure/i);
    expect(substanceProfile("BENZODIAZEPINES").safety[0].body).toMatch(/seizure/i);
  });

  it("non-combustible nicotine skips carbon-monoxide and smoke milestones", () => {
    for (const k of ["VAPE", "HEATED_TOBACCO"] as const) {
      const keys = substanceProfile(k).milestones.map((m) => m.key);
      expect(keys).toEqual(["heart-rate", "taste-smell", "nicotine-free", "withdrawal-fades"]);
      expect(keys).not.toContain("carbon-monoxide");
      expect(keys).not.toContain("oxygen");
    }
    expect(substanceProfile("CIGARETTES").milestones).toBe(HEALTH_MILESTONES);
  });

  it("profileForPlan applies custom name and unit, falling back to defaults", () => {
    expect(profileForPlan(null)).toMatchObject({ key: "CIGARETTES", name: "Cigarettes", unit: "cigarettes" });
    expect(profileForPlan(undefined).key).toBe("CIGARETTES");

    const custom = profileForPlan(plan(NOW, { productType: "ALCOHOL", customName: " Wine ", unitLabel: " glasses " }));
    expect(custom).toMatchObject({ key: "ALCOHOL", name: "Wine", unit: "glasses", freeWord: "alcohol-free", dangerousWithdrawal: true });

    const blank = profileForPlan(plan(NOW, { productType: "GAMBLING", customName: "  ", unitLabel: "" }));
    expect(blank).toMatchObject({ name: "Gambling", unit: "sessions", freeWord: "gambling-free" });

    expect(profileForPlan(plan(NOW, { productType: "OTHER", customName: "Energy Drinks" }))).toMatchObject({
      name: "Energy Drinks",
      unit: "times",
      freeWord: "energy drinks-free",
    });
    expect(profileForPlan(plan(NOW, { productType: "OTHER" })).freeWord).toBe("free");
  });
});

describe("health milestones per substance", () => {
  it("computeJourney uses the profile's milestones", () => {
    const j = computeJourney(makeState({ plan: plan(NOW - 5 * DAY, { productType: "OPIOIDS" }) }), NOW);
    expect(j.health.map((h) => h.key)).toEqual(substanceProfile("OPIOIDS").milestones.map((m) => m.key));
    expect(j.health.find((h) => h.key === "op-peak")?.reached).toBe(true);
    expect(j.nextHealthMilestone?.key).toBe("op-acute-over");
  });

  it("computeHealth accepts custom milestones and defaults to nicotine", () => {
    const ms = substanceProfile("CAFFEINE").milestones;
    expect(computeHealth(NOW - 3 * DAY, NOW, ms).filter((h) => h.reached).map((h) => h.key)).toEqual(["caf-peak"]);
    expect(computeHealth(null, NOW).map((h) => h.key)).toEqual(HEALTH_MILESTONES.map((h) => h.key));
  });
});

describe("money per substance", () => {
  it("timeRegainedMinutes for behavioural profiles only", () => {
    const quit = NOW - 2 * DAY;
    // 4 hours a day for 2 days = 8 units of 60 minutes
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "GAMING", unitsPerDay: 4 }) }), NOW)?.timeRegainedMinutes).toBe(480);
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "PORNOGRAPHY", unitsPerDay: 1 }) }), NOW)?.timeRegainedMinutes).toBe(60);
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "ALCOHOL" }) }), NOW)?.timeRegainedMinutes).toBeNull();
    expect(computeMoney(makeState({ plan: plan(quit) }), NOW)?.timeRegainedMinutes).toBeNull();
  });

  it("lifeRegainedMinutes only for cigarettes and roll-your-own", () => {
    const quit = NOW - 2 * DAY;
    for (const productType of ALL_TYPES) {
      const life = computeMoney(makeState({ plan: plan(quit, { productType }) }), NOW)?.lifeRegainedMinutes;
      if (productType === "CIGARETTES" || productType === "ROLL_YOUR_OWN") {
        expect(life, productType).toBe(800);
      } else {
        expect(life, productType).toBeNull();
      }
    }
  });
});

describe("computeReduction", () => {
  const quit = at(10, 8);
  const reductionPlan = (overrides: Partial<QuitPlan> = {}) =>
    plan(quit, { productType: "ALCOHOL", unitsPerDay: 10, goal: "REDUCTION", dailyLimit: 5, ...overrides });
  // 10th: 0, 11th: 3, 12th: 6 (over), 13th: 0, 14th: 5 (at limit), 15th: 2 so far
  const slips = [
    slip(at(9, 20), 9), // before the quit date: ignored
    slip(at(11, 19), 3),
    slip(at(12, 9), 4),
    slip(at(12, 21), 2),
    slip(at(14, 18), 5),
    slip(at(15, 9), 2),
    slip(at(15, 18), 7), // after now: ignored
  ];

  it("is null without a reduction goal or limit", () => {
    expect(computeReduction(makeState(), NOW)).toBeNull();
    expect(computeReduction(makeState({ plan: plan(quit) }), NOW)).toBeNull();
    expect(computeReduction(makeState({ plan: plan(quit, { goal: "ABSTINENCE", dailyLimit: 3 }) }), NOW)).toBeNull();
    expect(computeReduction(makeState({ plan: reductionPlan({ dailyLimit: null }) }), NOW)).toBeNull();
  });

  it("is empty before the quit date", () => {
    expect(computeReduction(makeState({ plan: plan(NOW + DAY, { goal: "REDUCTION", dailyLimit: 5 }), slips }), NOW)).toEqual({
      dailyLimit: 5,
      usedToday: 0,
      remainingToday: 5,
      streakDays: 0,
      bestStreakDays: 0,
      daysWithinLimit: 0,
      daysTracked: 0,
    });
  });

  it("counts days within the limit and resets the streak on an over-limit day", () => {
    const r = computeReduction(makeState({ plan: reductionPlan(), slips }), NOW);
    expect(r).toEqual({
      dailyLimit: 5,
      usedToday: 2,
      remainingToday: 3,
      streakDays: 3,
      bestStreakDays: 3,
      daysWithinLimit: 5,
      daysTracked: 6,
    });
  });

  it("an over-limit today zeroes the streak and clamps remaining, keeping the best run", () => {
    const r = computeReduction(makeState({ plan: reductionPlan(), slips: [...slips, slip(at(15, 11), 4)] }), NOW);
    expect(r).toMatchObject({ usedToday: 6, remainingToday: 0, streakDays: 0, bestStreakDays: 2, daysWithinLimit: 4, daysTracked: 6 });
  });

  it("tracks the quit day itself when quitting today", () => {
    const r = computeReduction(makeState({ plan: plan(at(15, 8), { goal: "REDUCTION", dailyLimit: 5 }) }), NOW);
    expect(r).toMatchObject({ usedToday: 0, remainingToday: 5, streakDays: 1, bestStreakDays: 1, daysTracked: 1 });
  });

  it("drives the journey goal, gamification streak badge and XP", () => {
    const state = makeState({ plan: reductionPlan(), slips });
    const j = computeJourney(state, NOW);
    expect(j.goal).toBe("REDUCTION");
    expect(j.reduction?.streakDays).toBe(3);
    expect(j.profile.unit).toBe("drinks");
    // 3 days within the limit counts as a 72h streak even with daily slips
    expect(j.streaks.bestStreakMs).toBeLessThan(72 * HOUR);
    expect(j.gamification.badges.find((b) => b.key === "streak-72h")?.earned).toBe(true);
    expect(j.gamification.level.xp).toBe(5 * XP.perSmokeFreeDay + j.gamification.earnedBadges * XP.perBadge);
  });
});

describe("gamification options", () => {
  const state: QuitJourneyState = makeState({
    plan: plan(at(10, 8), { productType: "GAMING", unitsPerDay: 4 }),
    slips: [slip(at(11, 20)), slip(at(13, 20))],
  });
  const periods = journeyPeriods(state, NOW);
  const streaks = computeStreaks(state, periods, NOW);
  const money = computeMoney(state, NOW);

  it("replaces {unit} in badge descriptions and defaults to cigarettes", () => {
    const withUnit = computeGamification(state, periods, streaks, money, NOW, { unit: "hours" });
    expect(withUnit.badges.find((b) => b.key === "avoided-100")?.description).toBe("Skip 100 hours");
    expect(withUnit.badges.find((b) => b.key === "avoided-5000")?.description).toBe("Skip 5,000 hours");
    const fallback = computeGamification(state, periods, streaks, money, NOW);
    expect(fallback.badges.find((b) => b.key === "avoided-1000")?.description).toBe("Skip 1,000 cigarettes");
    expect(fallback.badges.every((b) => !b.description.includes("{unit}"))).toBe(true);
  });

  it("with a reduction, best streak and XP days come from the reduction status", () => {
    const base = computeGamification(state, periods, streaks, money, NOW);
    expect(base.badges.find((b) => b.key === "streak-72h")?.earned).toBe(false);
    const reduction = {
      dailyLimit: 2,
      usedToday: 0,
      remainingToday: 2,
      streakDays: 4,
      bestStreakDays: 4,
      daysWithinLimit: 2,
      daysTracked: 6,
    };
    const g = computeGamification(state, periods, streaks, money, NOW, { reduction });
    expect(g.badges.find((b) => b.key === "streak-72h")).toMatchObject({ earned: true, progress: 1 });
    expect(g.level.xp).toBe(2 * XP.perSmokeFreeDay + g.earnedBadges * XP.perBadge);
    expect(base.level.xp).toBe(5 * XP.perSmokeFreeDay + base.earnedBadges * XP.perBadge);
  });
});
