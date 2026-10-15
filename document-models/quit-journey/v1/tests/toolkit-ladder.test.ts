import type { QuitPlan, Slip } from "document-models/quit-journey/v1";
import { computeRewardLadder, LADDER } from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { makeState } from "./helpers.js";

/** Local-time clock: day 1 is 2026-03-01 (local), times at local noon/morning. */
const at = (day: number, hour = 12) => new Date(2026, 2, day, hour).getTime();
const iso = (ms: number) => new Date(ms).toISOString();

function plan(quitAt: number): QuitPlan {
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
    standardDrinkGrams: null,
  };
}
const slip = (ms: number): Slip => ({ id: `s${ms}`, timestamp: iso(ms), units: 1, trigger: null, note: null });
const ladder = (now: number, slipDays: number[] = []) =>
  computeRewardLadder(makeState({ plan: plan(at(1, 8)), slips: slipDays.map((d) => slip(at(d, 15))) }), now);

/** Expected points for an uninterrupted streak of n days. */
const expectedRun = (n: number) => {
  const out: number[] = [];
  for (let d = 1; d <= n; d++) out.push(Math.min(100, 10 + 5 * (d - 1)) + (d % 3 === 0 ? 25 : 0));
  return out;
};

describe("computeRewardLadder", () => {
  it("is empty without a plan or before the quit date", () => {
    const empty = computeRewardLadder(makeState(), at(5));
    expect(empty).toEqual({ streakDays: 0, todayPoints: 0, totalPoints: 0, nextPoints: 10, recovering: false, restoreInDays: 0 });
    expect(computeRewardLadder(makeState({ plan: plan(at(10)) }), at(5)).totalPoints).toBe(0);
  });

  it("escalates by 5 a day with a 25-point bonus every third day", () => {
    expect(ladder(at(1, 9))).toMatchObject({ streakDays: 1, todayPoints: 10, totalPoints: 10, nextPoints: 15 });
    expect(ladder(at(2))).toMatchObject({ streakDays: 2, todayPoints: 15, totalPoints: 25, nextPoints: 45 });
    expect(ladder(at(3))).toMatchObject({ streakDays: 3, todayPoints: 45, totalPoints: 70, nextPoints: 25 });
    const day6 = ladder(at(6));
    expect(day6.todayPoints).toBe(35 + 25);
    expect(day6.totalPoints).toBe(expectedRun(6).reduce((a, b) => a + b, 0));
  });

  it("caps the daily value at 100 (plus bonus)", () => {
    const run = expectedRun(25);
    const day25 = ladder(at(25));
    expect(day25.streakDays).toBe(25);
    expect(day25.totalPoints).toBe(run.reduce((a, b) => a + b, 0));
    expect(ladder(at(19)).todayPoints).toBe(100);
    expect(ladder(at(20)).todayPoints).toBe(100);
    expect(ladder(at(21)).todayPoints).toBe(100 + LADDER.bonus);
    expect(day25.nextPoints).toBe(100);
  });

  it("earns nothing on a slip day and resets the value to 10", () => {
    const slipDay = ladder(at(7, 18), [7]);
    expect(slipDay.todayPoints).toBe(0);
    expect(slipDay.streakDays).toBe(0);
    expect(slipDay.totalPoints).toBe(expectedRun(6).reduce((a, b) => a + b, 0));
    expect(slipDay.nextPoints).toBe(10);
    expect(slipDay.recovering).toBe(true);
    expect(slipDay.restoreInDays).toBe(3);
    expect(ladder(at(8), [7]).todayPoints).toBe(10);
  });

  it("restores the pre-reset level after 3 clean days (rapid reset)", () => {
    const d9 = ladder(at(9), [7]);
    expect(d9).toMatchObject({ todayPoints: 15, recovering: true, restoreInDays: 1 });
    // Day 10 restores rung 6 (35) and is the third streak day (+25).
    expect(d9.nextPoints).toBe(60);
    const d10 = ladder(at(10), [7]);
    expect(d10).toMatchObject({ streakDays: 3, todayPoints: 60, recovering: false, restoreInDays: 0 });
    expect(ladder(at(11), [7]).todayPoints).toBe(40);
    const total = expectedRun(6).reduce((a, b) => a + b, 0) + 0 + 10 + 15 + 60 + 40;
    expect(ladder(at(11), [7]).totalPoints).toBe(total);
  });

  it("keeps the higher saved level when slipping again while recovering", () => {
    // Rung 6 saved on day 7, slip again on day 9, then 3 clean days restore rung 6 on day 12.
    const d12 = ladder(at(12), [7, 9]);
    expect(d12.todayPoints).toBe(35 + 25);
    expect(d12.recovering).toBe(false);
  });

  it("does not bother recovering when the lost level was low", () => {
    const d3 = ladder(at(3), [3]);
    expect(d3.recovering).toBe(false);
    expect(d3.restoreInDays).toBe(0);
  });

  it("counts several slips on one day once and ignores slips before the quit date", () => {
    const state = makeState({
      plan: plan(at(1, 8)),
      slips: [slip(at(1, 6)), slip(at(4, 9)), slip(at(4, 20))],
    });
    const r = computeRewardLadder(state, at(4, 21));
    expect(r.todayPoints).toBe(0);
    expect(r.totalPoints).toBe(10 + 15 + 45);
  });
});
