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
  deleteSlip,
  endQuitAid,
  logAidUse,
  logCraving,
  logSlip,
  removeMotivation,
  removeSupportContact,
  restartJourney,
  setDisplayName,
  setQuitline,
  setQuitPlan,
  togglePrepTask,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { addDays, errs, planInput, QUIT, run, storedPlan } from "./helpers.js";

describe("QuitJourney full journey scenario", () => {
  it("chains planning, cravings, slips, check-ins, rewards, aids, support and a restart", () => {
    const ids = {
      why1: generateId(),
      why2: generateId(),
      dinner: generateId(),
      book: generateId(),
      trip: generateId(),
      craving1: generateId(),
      craving2: generateId(),
      slip1: generateId(),
      slip2: generateId(),
      slipGap: generateId(),
      slip3: generateId(),
      check1: generateId(),
      check2: generateId(),
      patch: generateId(),
      gum: generateId(),
      use1: generateId(),
      use2: generateId(),
      mum: generateId(),
      friend: generateId(),
      attempt: generateId(),
    };
    const restartEnd = addDays(QUIT, 9); // Jan 10
    const secondQuit = addDays(QUIT, 11); // Jan 12

    const beforeTrip = run([
      setDisplayName({ displayName: "Alex" }), // 0
      setQuitPlan(planInput({ yearsSmoked: 12 })), // 1
      addMotivation({ id: ids.why1, text: "  For my kids  ", imageUrl: "https://example.com/kids.png" }), // 2
      addMotivation({ id: ids.why2, text: "Health" }), // 3
      togglePrepTask({ taskKey: "set-date", done: true }), // 4
      togglePrepTask({ taskKey: "add-why", done: true }), // 5
      togglePrepTask({ taskKey: "set-date", done: true }), // 6 no-op (already done)
      togglePrepTask({ taskKey: "add-why", done: false }), // 7 un-done
      togglePrepTask({ taskKey: "clean-sweep", done: false }), // 8 no-op (never done)
      removeMotivation({ id: ids.why2 }), // 9
      addRewardGoal({ id: ids.dinner, title: "  Dinner out ", cost: 25, emoji: "🍝" }), // 10
      addRewardGoal({ id: ids.book, title: "Book", cost: 15 }), // 11
      // one day in: 20 units * 0.5 = 10 saved < 25
      claimReward({ id: ids.dinner, claimedAt: addDays(QUIT, 1) }), // 12
      logCraving({
        id: ids.craving1,
        timestamp: addDays(QUIT, 1),
        intensity: 5,
        trigger: "COFFEE",
        strategy: "BREATHING",
        outcome: "RESISTED",
        durationMinutes: 7,
        note: "tough one",
      }), // 13
      logCraving({
        id: ids.craving2,
        timestamp: addDays(QUIT, 2),
        intensity: 3,
        trigger: "STRESS",
        outcome: "SMOKED",
        durationMinutes: 0,
      }), // 14
      logSlip({ id: ids.slip1, timestamp: addDays(QUIT, 2), units: 4, trigger: "STRESS", note: "party" }), // 15
      logSlip({ id: ids.slip2, timestamp: addDays(QUIT, 2.5), units: 1 }), // 16
      deleteSlip({ id: ids.slip2 }), // 17
      dailyCheckIn({
        id: ids.check1,
        date: "2026-01-03",
        mood: 4,
        cravingLevel: 2,
        energy: 3,
        sleepQuality: 5,
        weightKg: 80.5,
        symptoms: ["IRRITABILITY", "HUNGER"],
        note: "ok day",
      }), // 18
      dailyCheckIn({ id: ids.check2, date: "2026-01-04", mood: 1, cravingLevel: 5 }), // 19
      deleteCheckIn({ id: ids.check2 }), // 20
      // five days: 100 units - 4 slipped = 96 units = 48 saved
      claimReward({ id: ids.dinner, claimedAt: addDays(QUIT, 5) }), // 21
      claimReward({ id: ids.dinner, claimedAt: addDays(QUIT, 6) }), // 22
      claimReward({ id: ids.book, claimedAt: addDays(QUIT, 5) }), // 23 48 - 25 = 23 >= 15
      addQuitAid({ id: ids.patch, type: "PATCH", name: "NicoPatch", dosage: "21mg", startedAt: QUIT }), // 24
      addQuitAid({ id: ids.gum, type: "GUM", startedAt: QUIT }), // 25
      logAidUse({ id: ids.use1, aidId: ids.gum, timestamp: addDays(QUIT, 1), note: "after lunch", beforeDrinking: null }), // 26
      logAidUse({ id: ids.use2, aidId: ids.gum, timestamp: addDays(QUIT, 2) }), // 27
      endQuitAid({ id: ids.patch, endedAt: addDays(QUIT, 8) }), // 28
      addSupportContact({ id: ids.mum, name: "  Mum ", phone: "+49 123", relation: "Family" }), // 29
      addSupportContact({ id: ids.friend, name: "Sam" }), // 30
      removeSupportContact({ id: ids.friend }), // 31
      setQuitline({ phone: "0800 123" }), // 32
      restartJourney({
        attemptId: ids.attempt,
        endedAt: restartEnd,
        newQuitDateTime: secondQuit,
        reason: "Wedding",
      }), // 33
      // a slip in the gap between attempts must not count against any period
      logSlip({ id: ids.slipGap, timestamp: addDays(QUIT, 10), units: 30 }), // 34
      logSlip({ id: ids.slip3, timestamp: addDays(secondQuit, 3), units: 2 }), // 35
      deleteCraving({ id: ids.craving2 }), // 36
      addRewardGoal({ id: ids.trip, title: "Trip", cost: 100 }), // 37
    ]);

    expect(errs(beforeTrip)).toEqual([
      ...Array<null>(12).fill(null),
      "Not enough savings yet: 10.00 available, 25.00 needed",
      ...Array<null>(9).fill(null),
      "Reward was already claimed",
      ...Array<null>(15).fill(null),
    ]);

    const s = beforeTrip.state.global;
    expect(s.displayName).toBe("Alex");
    expect(s.plan).toEqual(storedPlan({ yearsSmoked: 12, quitDateTime: secondQuit }));
    expect(s.motivations).toEqual([
      { id: ids.why1, text: "For my kids", imageUrl: "https://example.com/kids.png" },
    ]);
    expect(s.prepTasksDone).toEqual(["set-date"]);
    expect(s.cravings).toEqual([
      {
        id: ids.craving1,
        timestamp: addDays(QUIT, 1),
        intensity: 5,
        trigger: "COFFEE",
        strategy: "BREATHING",
        outcome: "RESISTED",
        durationMinutes: 7,
        note: "tough one",
        intensityAfter: null,
      },
    ]);
    expect(s.slips.map((x) => x.id)).toEqual([ids.slip1, ids.slipGap, ids.slip3]);
    expect(s.slips[0]).toEqual({ id: ids.slip1, timestamp: addDays(QUIT, 2), units: 4, trigger: "STRESS", note: "party" });
    expect(s.slips[1]).toMatchObject({ trigger: null, note: null });
    expect(s.checkIns).toEqual([
      {
        id: ids.check1,
        date: "2026-01-03",
        mood: 4,
        cravingLevel: 2,
        energy: 3,
        sleepQuality: 5,
        weightKg: 80.5,
        symptoms: ["IRRITABILITY", "HUNGER"],
        note: "ok day",
      },
    ]);
    expect(s.rewards).toEqual([
      { id: ids.dinner, title: "Dinner out", cost: 25, emoji: "🍝", claimedAt: addDays(QUIT, 5) },
      { id: ids.book, title: "Book", cost: 15, emoji: null, claimedAt: addDays(QUIT, 5) },
      { id: ids.trip, title: "Trip", cost: 100, emoji: null, claimedAt: null },
    ]);
    expect(s.aids).toEqual([
      { id: ids.patch, type: "PATCH", name: "NicoPatch", dosage: "21mg", startedAt: QUIT, endedAt: addDays(QUIT, 8) },
      { id: ids.gum, type: "GUM", name: null, dosage: null, startedAt: QUIT, endedAt: null },
    ]);
    expect(s.aidUses).toEqual([
      { id: ids.use1, aidId: ids.gum, timestamp: addDays(QUIT, 1), note: "after lunch", beforeDrinking: null },
      { id: ids.use2, aidId: ids.gum, timestamp: addDays(QUIT, 2), note: null, beforeDrinking: null },
    ]);
    expect(s.supportContacts).toEqual([{ id: ids.mum, name: "Mum", phone: "+49 123", relation: "Family" }]);
    expect(s.quitlinePhone).toBe("0800 123");
    expect(s.pastAttempts).toEqual([{ id: ids.attempt, quitDateTime: QUIT, endedAt: restartEnd, reason: "Wedding" }]);

    // Jan 20: attempt 1 (9 days, 180 - 4) + attempt 2 (8 days, 160 - 2) = 334 units = 167, minus 40 spent
    const claimAt = addDays(secondQuit, 8);
    const money = computeMoney(s, Date.parse(claimAt));
    expect(money?.unitsAvoided).toBeCloseTo(334);
    expect(money?.unitsAvoidedCurrent).toBeCloseTo(158);
    expect(money?.moneyAvailable).toBeCloseTo(127);

    const after = run(
      [
        claimReward({ id: ids.trip, claimedAt: claimAt }), // 38
        setDisplayName({ displayName: "" }), // 39
        setQuitline({ phone: null }), // 40
      ],
      beforeTrip,
    );
    expect(errs(after).slice(38)).toEqual([null, null, null]);
    expect(after.state.global.rewards[2].claimedAt).toBe(claimAt);
    expect(after.state.global.displayName).toBeNull();
    expect(after.state.global.quitlinePhone).toBeNull();
    expect(computeMoney(after.state.global, Date.parse(claimAt))?.moneyAvailable).toBeCloseTo(27);
  });
});
