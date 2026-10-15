import type {
  CheckIn,
  Craving,
  CravingOutcome,
  CopingStrategy,
  CravingTrigger,
  QuitPlan,
  WithdrawalSymptom,
} from "document-models/quit-journey/v1";
import {
  BADGES,
  computeHealth,
  computeInsights,
  computeJourney,
  computeMoney,
  computePrep,
  HEALTH_MILESTONES,
  LEVELS,
  levelFor,
  localDateKey,
  PREP_TASKS,
  shiftDateKey,
  splitDuration,
  unitsAvoidedIn,
  XP,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState } from "./helpers.js";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Fixed local-time clock so date keys and heatmap buckets are timezone-safe. */
const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime();
const iso = (ms: number) => new Date(ms).toISOString();

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

let n = 0;
function craving(
  at: number,
  outcome: CravingOutcome,
  opts: { intensity?: number; trigger?: CravingTrigger; strategy?: CopingStrategy | null; duration?: number | null } = {},
): Craving {
  n += 1;
  return {
    id: `c${n}`,
    timestamp: iso(at),
    intensity: opts.intensity ?? 3,
    trigger: opts.trigger ?? "OTHER",
    strategy: opts.strategy ?? null,
    outcome,
    durationMinutes: opts.duration ?? null,
    note: null,
  };
}

function checkIn(date: string, opts: { weightKg?: number | null; symptoms?: WithdrawalSymptom[] } = {}): CheckIn {
  n += 1;
  return {
    id: `k${n}`,
    date,
    mood: 3,
    cravingLevel: 3,
    energy: null,
    sleepQuality: null,
    weightKg: opts.weightKg ?? null,
    symptoms: opts.symptoms ?? [],
    note: null,
  };
}

const slip = (at: number, units = 1) => ({ id: `s${at}`, timestamp: iso(at), units, trigger: null, note: null });
const today = localDateKey(NOW);

describe("time helpers", () => {
  it("formats and shifts local date keys", () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59).getTime())).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 0, 5, 0, 1).getTime())).toBe("2026-01-05");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDateKey("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftDateKey("2025-12-31", 1)).toBe("2026-01-01");
  });

  it("splits durations and clamps negatives", () => {
    expect(splitDuration(DAY + HOUR + MIN + 1_500)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitDuration(-5_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("computeJourney phases", () => {
  it("NOT_STARTED without a plan", () => {
    const j = computeJourney(makeState(), NOW);
    expect(j.phase).toBe("NOT_STARTED");
    expect(j.quitAt).toBeNull();
    expect(j.elapsedMs).toBe(0);
    expect(j.money).toBeNull();
    expect(j.streaks).toEqual({
      recoveryStart: null,
      smokeFreeStreakMs: 0,
      bestStreakMs: 0,
      checkInStreak: 0,
      bestCheckInStreak: 0,
      checkedInToday: false,
    });
    expect(j.health.every((h) => !h.reached && h.progress === 0 && h.reachedAt === 0)).toBe(true);
    expect(j.health[0].remainingMs).toBe(HEALTH_MILESTONES[0].afterMs);
    expect(j.nextHealthMilestone?.key).toBe("heart-rate");
    expect(j.prep).toMatchObject({ isPrepPhase: true, msUntilQuit: 0, tasksDone: 0, taperTargetToday: null });
    expect(j.gamification.level).toMatchObject({ xp: 0, level: 1, name: "Seed" });
    expect(j.gamification.earnedBadges).toBe(0);
    expect(j.insights).toMatchObject({
      totalCravings: 0,
      resistRate: 0,
      bestStrategy: null,
      topTrigger: null,
      riskWindow: null,
      typicalCravingMinutes: 5,
      weightChangeKg: null,
      latestWeightKg: null,
      frequentSymptoms: [],
    });
    expect(j.insights.weeklyTrend).toHaveLength(8);
    expect(j.insights.weeklyTrend.every((w) => w.cravings === 0 && w.avgIntensity === 0)).toBe(true);
  });

  it("PREP before the quit date with a 14-day taper target", () => {
    const soon = computeJourney(
      makeState({ plan: plan(NOW + 3.5 * DAY), prepTasksDone: [...PREP_TASKS.map((t) => t.key), "unknown-task"] }),
      NOW,
    );
    expect(soon.phase).toBe("PREP");
    expect(soon.elapsedMs).toBe(0);
    // 4 days left: ceil(20 * 4 / 14) = 6
    expect(soon.prep).toEqual({
      isPrepPhase: true,
      msUntilQuit: 3.5 * DAY,
      tasksDone: PREP_TASKS.length,
      tasksTotal: PREP_TASKS.length,
      readiness: 1,
      taperTargetToday: 6,
    });
    expect(soon.money).toMatchObject({ unitsAvoided: 0, unitsAvoidedCurrent: 0, moneySaved: 0 });
    expect(soon.streaks.recoveryStart).toBeNull();
    expect(soon.gamification.badges.find((b) => b.key === "prepared")?.earned).toBe(true);

    // far away: the taper is capped at the full baseline
    expect(computePrep(makeState({ plan: plan(NOW + 30 * DAY) }), NOW).taperTargetToday).toBe(20);
  });

  it("QUIT: health is measured from the last slip, elapsed from the quit date", () => {
    const quit = NOW - 10 * DAY;
    const lastSlip = quit + 4 * DAY;
    const j = computeJourney(
      makeState({ plan: plan(quit), slips: [slip(lastSlip, 3), slip(quit + DAY, 1)] }),
      NOW,
    );
    expect(j.phase).toBe("QUIT");
    expect(j.quitAt).toBe(quit);
    expect(j.elapsedMs).toBe(10 * DAY);
    expect(j.streaks.recoveryStart).toBe(lastSlip);
    expect(j.streaks.smokeFreeStreakMs).toBe(6 * DAY);
    expect(j.streaks.bestStreakMs).toBe(6 * DAY);
    const withdrawal = j.health.find((h) => h.key === "withdrawal-fades");
    expect(withdrawal).toMatchObject({ reached: false, reachedAt: lastSlip + 21 * DAY, remainingMs: 15 * DAY });
    expect(withdrawal?.progress).toBeCloseTo(6 / 21);
    expect(j.health.find((h) => h.key === "breathing")).toMatchObject({ reached: true, progress: 1, remainingMs: 0 });
    expect(j.nextHealthMilestone?.key).toBe("withdrawal-fades");
    // 200 - 4 slipped units at 0.50
    expect(j.money).toMatchObject({
      currency: "EUR",
      pricePerUnit: 0.5,
      costPerDay: 10,
      unitsAvoided: 196,
      unitsAvoidedCurrent: 196,
      moneySaved: 98,
      moneyAvailable: 98,
      projectedYearlySavings: 3650,
      lifeRegainedMinutes: 196 * 20,
    });
  });

  it("all health milestones reached long after quitting", () => {
    const h = computeHealth(NOW - 16 * 365 * DAY, NOW);
    expect(h.every((m) => m.reached)).toBe(true);
    expect(computeJourney(makeState({ plan: plan(NOW - 16 * 365 * DAY) }), NOW).nextHealthMilestone).toBeNull();
  });
});

describe("money", () => {
  it("unitsAvoidedIn is zero without a plan", () => {
    expect(unitsAvoidedIn(makeState(), { start: NOW - DAY, end: NOW })).toBe(0);
  });

  it("lifeRegainedMinutes only applies to cigarettes and roll-your-own", () => {
    const quit = NOW - 2 * DAY;
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "VAPE" }) }), NOW)?.lifeRegainedMinutes).toBeNull();
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "CIGARS" }) }), NOW)?.lifeRegainedMinutes).toBeNull();
    expect(computeMoney(makeState({ plan: plan(quit, { productType: "ROLL_YOUR_OWN" }) }), NOW)?.lifeRegainedMinutes).toBe(800);
  });

  it("adds past attempts, ignores zero-length ones and subtracts claimed rewards", () => {
    const quit = NOW - 2 * DAY;
    const state = makeState({
      plan: plan(quit),
      pastAttempts: [
        { id: "a1", quitDateTime: iso(NOW - 20 * DAY), endedAt: iso(NOW - 15 * DAY), reason: null },
        { id: "a2", quitDateTime: iso(NOW - 10 * DAY), endedAt: iso(NOW - 10 * DAY), reason: null },
      ],
      rewards: [
        { id: "r1", title: "A", cost: 30, emoji: null, claimedAt: iso(NOW - DAY) },
        { id: "r2", title: "B", cost: 99, emoji: null, claimedAt: null },
      ],
    });
    const m = computeMoney(state, NOW);
    expect(m?.unitsAvoided).toBe(140);
    expect(m?.unitsAvoidedCurrent).toBe(40);
    expect(m?.moneySpentOnRewards).toBe(30);
    expect(m?.moneyAvailable).toBe(40);
  });
});

describe("streaks", () => {
  it("a slip splits the smoke-free streak; best streak spans past attempts", () => {
    const quit = NOW - 5 * DAY;
    const j = computeJourney(
      makeState({
        plan: plan(quit),
        pastAttempts: [{ id: "a", quitDateTime: iso(NOW - 30 * DAY), endedAt: iso(NOW - 10 * DAY), reason: null }],
        slips: [slip(NOW - 25 * DAY), slip(NOW - DAY)],
      }),
      NOW,
    );
    expect(j.streaks.bestStreakMs).toBe(15 * DAY);
    expect(j.streaks.smokeFreeStreakMs).toBe(DAY);
    expect(j.gamification.badges.find((b) => b.key === "streak-72h")?.earned).toBe(true);
  });

  it("check-in streak counts from today", () => {
    const dates = [today, shiftDateKey(today, -1), shiftDateKey(today, -2)];
    const s = computeJourney(makeState({ checkIns: dates.map((d) => checkIn(d)) }), NOW).streaks;
    expect(s).toMatchObject({ checkInStreak: 3, bestCheckInStreak: 3, checkedInToday: true });
  });

  it("check-in streak still counts from yesterday when today is missing", () => {
    const dates = [shiftDateKey(today, -1), shiftDateKey(today, -2)];
    const s = computeJourney(makeState({ checkIns: dates.map((d) => checkIn(d)) }), NOW).streaks;
    expect(s).toMatchObject({ checkInStreak: 2, bestCheckInStreak: 2, checkedInToday: false });
  });

  it("a gap breaks the current check-in streak but keeps the best run", () => {
    const old = [-10, -9, -8, -7].map((d) => shiftDateKey(today, d));
    const recent = [-3, -2].map((d) => shiftDateKey(today, d));
    const s = computeJourney(makeState({ checkIns: [...recent, ...old].map((d) => checkIn(d)) }), NOW).streaks;
    expect(s).toMatchObject({ checkInStreak: 0, bestCheckInStreak: 4, checkedInToday: false });
  });
});

describe("gamification", () => {
  it("levelFor thresholds", () => {
    expect(levelFor(0)).toEqual({ xp: 0, level: 1, name: "Seed", icon: "🌰", currentLevelXp: 0, nextLevelXp: 200, progress: 0 });
    expect(levelFor(199).level).toBe(1);
    expect(levelFor(200)).toMatchObject({ level: 2, name: "Seedling", progress: 0 });
    expect(levelFor(400).progress).toBe(0.5);
    for (const [i, l] of LEVELS.entries()) expect(levelFor(l.minXp).level).toBe(i + 1);
    expect(levelFor(45_000)).toMatchObject({ level: LEVELS.length, name: "Ancient Forest", nextLevelXp: null, progress: 1 });
    expect(levelFor(1_000_000).progress).toBe(1);
  });

  it("badge definitions have unique keys", () => {
    expect(new Set(BADGES.map((b) => b.key)).size).toBe(BADGES.length);
  });

  it("earns badges from a rich journey and computes XP", () => {
    const quit = NOW - 10 * DAY;
    const state = makeState({
      plan: plan(quit),
      motivations: ["a", "b", "c"].map((id) => ({ id, text: id, imageUrl: null })),
      slips: [slip(quit + DAY)],
      cravings: [
        craving(quit + 0.5 * DAY, "RESISTED", { intensity: 5, strategy: "WALK" }),
        craving(quit + 2 * DAY, "RESISTED", { intensity: 3, strategy: "GUM" }),
        craving(quit + 3 * DAY, "SMOKED", { intensity: 4 }),
      ],
      checkIns: [checkIn(today), checkIn(shiftDateKey(today, -1))],
      rewards: [{ id: "r", title: "R", cost: 5, emoji: null, claimedAt: iso(NOW - DAY) }],
      aidUses: [{ id: "u", aidId: "x", timestamp: iso(quit), note: null }],
      supportContacts: [{ id: "p", name: "P", phone: null, relation: null }],
    });
    const g = computeJourney(state, NOW).gamification;
    const earned = new Set(g.badges.filter((b) => b.earned).map((b) => b.key));
    for (const k of [
      "first-day", "three-days", "one-week", "streak-72h", "money-10", "resist-1", "iron-will",
      "comeback", "aid-user", "my-why", "not-alone", "treat-yourself", "avoided-100",
    ]) {
      expect(earned.has(k), k).toBe(true);
    }
    for (const k of ["two-weeks", "one-year", "toolbox", "checkin-7", "prepared", "money-1000"]) {
      expect(earned.has(k), k).toBe(false);
    }
    expect(g.earnedBadges).toBe(earned.size);
    expect(g.badges.find((b) => b.key === "toolbox")?.progress).toBeCloseTo(2 / 5);
    const resistedXp = 2 * XP.perResistedCraving + XP.intenseCravingBonus;
    expect(g.level.xp).toBe(10 * XP.perSmokeFreeDay + resistedXp + 2 * XP.perCheckIn + earned.size * XP.perBadge);
    // 99.50 of 100 saved: "money-100" is the closest unearned badge
    expect(g.nextBadge?.key).toBe("money-100");
  });

  it("no comeback badge without a slip", () => {
    const g = computeJourney(
      makeState({ plan: plan(NOW - DAY), cravings: [craving(NOW - HOUR, "RESISTED")] }),
      NOW,
    ).gamification;
    expect(g.badges.find((b) => b.key === "comeback")?.earned).toBe(false);
    expect(g.nextBadge).not.toBeNull();
  });
});

describe("insights", () => {
  it("ranks strategies by smoothed score and triggers by count then intensity", () => {
    const t = NOW - 3 * DAY;
    const cravings = [
      craving(t, "RESISTED", { strategy: "BREATHING", trigger: "COFFEE", intensity: 2 }),
      ...[1, 2, 3, 4].map((i) => craving(t + i * 3 * HOUR, "RESISTED", { strategy: "WALK", trigger: "STRESS", intensity: 4 })),
      craving(t + 15 * HOUR, "SMOKED", { strategy: "WALK", trigger: "COFFEE", intensity: 4 }),
      craving(t + 18 * HOUR, "SMOKED", { strategy: "GUM", trigger: "COFFEE", intensity: 1, duration: 3 }),
      craving(t + 21 * HOUR, "SMOKED", { trigger: "STRESS", intensity: 5, duration: 10 }),
    ];
    const ins = computeInsights(makeState({ cravings }), NOW);
    expect(ins.totalCravings).toBe(8);
    expect(ins.resistedCravings).toBe(5);
    expect(ins.resistRate).toBeCloseTo(5 / 8);
    // BREATHING has a perfect raw rate but only one use; WALK (4/5) wins on the smoothed score
    expect(ins.strategies.map((s) => s.strategy)).toEqual(["WALK", "BREATHING", "GUM"]);
    expect(ins.strategies[0]).toMatchObject({ uses: 5, resisted: 4, rate: 0.8 });
    expect(ins.strategies[0].score).toBeCloseTo(5 / 7);
    expect(ins.strategies[1]).toMatchObject({ rate: 1 });
    expect(ins.bestStrategy).toBe("WALK");
    // STRESS has 5, COFFEE 3
    expect(ins.topTrigger).toBe("STRESS");
    expect(ins.triggers[1]).toMatchObject({ trigger: "COFFEE", count: 3, smoked: 2 });
    expect(ins.triggers[1].avgIntensity).toBeCloseTo(7 / 3);
    // median of [3, 10] = 6.5
    expect(ins.typicalCravingMinutes).toBe(7);
  });

  it("breaks strategy ties by uses and trigger ties by intensity", () => {
    const t = NOW - DAY;
    const ins = computeInsights(
      makeState({
        cravings: [
          craving(t, "SMOKED", { strategy: "GUM", trigger: "BOREDOM", intensity: 1, duration: 2 }),
          craving(t + HOUR * 2, "RESISTED", { strategy: "WATER", trigger: "OTHER", intensity: 1, duration: 4 }),
          craving(t + HOUR * 4, "SMOKED", { strategy: "WATER", trigger: "OTHER", intensity: 1, duration: 9 }),
          craving(t + HOUR * 6, "SMOKED", { strategy: "WATER", trigger: "OTHER", intensity: 1 }),
          craving(t + HOUR * 8, "SMOKED", { strategy: "WATER", trigger: "OTHER", intensity: 1 }),
          craving(t + HOUR * 10, "SMOKED", { trigger: "PHONE", intensity: 5 }),
          craving(t + HOUR * 12, "RESISTED", { strategy: "MEDITATION", trigger: "OTHER", intensity: 1 }),
          craving(t + HOUR * 14, "RESISTED", { strategy: "MEDITATION", trigger: "OTHER", intensity: 1 }),
        ],
      }),
      NOW,
    );
    // MEDITATION 3/4 is best; GUM (1/3) and WATER (2/6) tie, WATER has more uses
    expect(ins.strategies.map((s) => s.strategy)).toEqual(["MEDITATION", "WATER", "GUM"]);
    // PHONE and BOREDOM both 1 craving, PHONE is more intense
    expect(ins.triggers.map((x) => x.trigger)).toEqual(["OTHER", "PHONE", "BOREDOM"]);
    // odd count median of [2, 4, 9]
    expect(ins.typicalCravingMinutes).toBe(4);
  });

  it("builds a local-time heatmap and finds the 2-hour risk window", () => {
    const tue = new Date(2026, 5, 9, 8, 15).getTime();
    const cravings = [
      craving(tue, "SMOKED"),
      craving(tue + HOUR, "SMOKED"),
      craving(tue + HOUR + 10 * MIN, "RESISTED"),
      craving(tue + 2 * HOUR, "SMOKED"),
      // a weaker pair on another day
      craving(new Date(2026, 5, 11, 20, 0).getTime(), "SMOKED"),
      craving(new Date(2026, 5, 11, 21, 0).getTime(), "SMOKED"),
      // late night does not wrap into the next day
      craving(new Date(2026, 5, 12, 23, 30).getTime(), "SMOKED"),
    ];
    const ins = computeInsights(makeState({ cravings }), NOW);
    const day = new Date(tue).getDay();
    expect(ins.heatmap).toHaveLength(7);
    expect(ins.heatmap[day][8]).toBe(1);
    expect(ins.heatmap[day][9]).toBe(2);
    expect(ins.heatmap[day][10]).toBe(1);
    expect(ins.heatmap.flat().reduce((a, b) => a + b, 0)).toBe(7);
    expect(ins.riskWindow).toEqual({ weekday: day, startHour: 8, count: 3 });
  });

  it("no risk window for scattered single cravings", () => {
    const cravings = [0, 5, 10].map((h) => craving(new Date(2026, 5, 10, h).getTime(), "RESISTED"));
    expect(computeInsights(makeState({ cravings }), NOW).riskWindow).toBeNull();
  });

  it("weekly trend buckets end at now", () => {
    const cravings = [
      craving(NOW, "RESISTED", { intensity: 4 }),
      craving(NOW - 6 * DAY, "RESISTED", { intensity: 2 }),
      craving(NOW - 7 * DAY, "SMOKED", { intensity: 5 }), // boundary belongs to the previous week
      craving(NOW - 20 * DAY, "SMOKED", { intensity: 1 }), // outside two weeks
    ];
    const trend = computeInsights(makeState({ cravings }), NOW, 2).weeklyTrend;
    expect(trend).toEqual([
      { weekStart: NOW - 14 * DAY, cravings: 1, avgIntensity: 5 },
      { weekStart: NOW - 7 * DAY, cravings: 2, avgIntensity: 3 },
    ]);
  });

  it("weight change and frequent symptoms from recent check-ins", () => {
    const k = (d: number) => shiftDateKey(today, d);
    const checkIns = [
      checkIn(k(0), { weightKg: 78, symptoms: ["HUNGER", "INSOMNIA"] }),
      checkIn(k(-20), { weightKg: 80, symptoms: ["COUGH"] }),
      checkIn(k(-1), { symptoms: ["HUNGER"] }),
      checkIn(k(-2), { symptoms: ["HUNGER", "INSOMNIA"] }),
      checkIn(k(-3)),
      checkIn(k(-4)),
      checkIn(k(-5)),
      checkIn(k(-6), { symptoms: ["ANXIETY"] }),
    ];
    const ins = computeInsights(makeState({ checkIns }), NOW);
    expect(ins.weightChangeKg).toBe(-2);
    expect(ins.latestWeightKg).toBe(78);
    // the -20 day check-in is not among the 7 most recent
    expect(ins.frequentSymptoms).toEqual([
      { symptom: "HUNGER", count: 3 },
      { symptom: "INSOMNIA", count: 2 },
      { symptom: "ANXIETY", count: 1 },
    ]);
  });

  it("a single weigh-in has no change", () => {
    const ins = computeInsights(makeState({ checkIns: [checkIn(today, { weightKg: 70 })] }), NOW);
    expect(ins.weightChangeKg).toBeNull();
    expect(ins.latestWeightKg).toBe(70);
  });
});
