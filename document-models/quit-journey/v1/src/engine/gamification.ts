import type { QuitJourneyState } from "document-models/quit-journey/v1";
import type { MoneyStats, Period } from "./money.js";
import { PREP_TASKS } from "./prep.js";
import { DAY, HOUR, localDateKey, shiftDateKey } from "./time.js";

export type BadgeCategory = "TIME" | "MONEY" | "AVOIDED" | "CRAVINGS" | "HABITS" | "SUPPORT";

export interface BadgeContext {
  currentElapsedMs: number;
  bestStreakMs: number;
  moneySaved: number;
  unitsAvoided: number;
  resisted: number;
  maxResistedIntensity: number;
  comebacks: number;
  strategiesThatWorked: number;
  checkInStreak: number;
  bestCheckInStreak: number;
  supportContacts: number;
  motivations: number;
  prepDone: number;
  rewardsClaimed: number;
  aidUses: number;
}

interface BadgeDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  target: number;
  metric: (c: BadgeContext) => number;
}

const time = (key: string, title: string, icon: string, ms: number, label: string): BadgeDef => ({
  key, title, icon, category: "TIME", target: ms, metric: (c) => c.currentElapsedMs,
  description: `${label} since your quit date`,
});
const count = (
  key: string, title: string, icon: string, category: BadgeCategory, target: number,
  description: string, metric: (c: BadgeContext) => number,
): BadgeDef => ({ key, title, icon, category, target, description, metric });

export const BADGES: BadgeDef[] = [
  time("first-day", "Day One", "🌅", DAY, "24 hours"),
  time("three-days", "Nicotine Free", "🧪", 3 * DAY, "3 days"),
  time("one-week", "Week Warrior", "🗓️", 7 * DAY, "1 week"),
  time("two-weeks", "Fortnight Force", "⚡", 14 * DAY, "2 weeks"),
  time("one-month", "Monthly Master", "🌙", 30 * DAY, "1 month"),
  time("three-months", "Quarter Champion", "🌳", 90 * DAY, "3 months"),
  time("six-months", "Half-Year Hero", "🦸", 182 * DAY, "6 months"),
  time("one-year", "Smoke-Free Legend", "👑", 365 * DAY, "1 year"),
  count("streak-72h", "Clean Streak", "🔥", "TIME", 72 * HOUR, "72 hours without a single slip", (c) => c.bestStreakMs),
  count("money-10", "First Tenner", "🪙", "MONEY", 10, "Save 10 in your currency", (c) => c.moneySaved),
  count("money-100", "Piggy Bank", "🐷", "MONEY", 100, "Save 100 in your currency", (c) => c.moneySaved),
  count("money-500", "Treasure Chest", "💰", "MONEY", 500, "Save 500 in your currency", (c) => c.moneySaved),
  count("money-1000", "Four Figures", "💎", "MONEY", 1000, "Save 1,000 in your currency", (c) => c.moneySaved),
  count("avoided-100", "Century", "💯", "AVOIDED", 100, "Don't smoke 100 cigarettes", (c) => c.unitsAvoided),
  count("avoided-500", "Half a Thousand", "🚭", "AVOIDED", 500, "Don't smoke 500 cigarettes", (c) => c.unitsAvoided),
  count("avoided-1000", "Thousand Breaths", "🌬️", "AVOIDED", 1000, "Don't smoke 1,000 cigarettes", (c) => c.unitsAvoided),
  count("avoided-5000", "Fresh Air Titan", "🏔️", "AVOIDED", 5000, "Don't smoke 5,000 cigarettes", (c) => c.unitsAvoided),
  count("resist-1", "First Victory", "🥊", "CRAVINGS", 1, "Resist your first craving", (c) => c.resisted),
  count("resist-10", "Craving Warrior", "⚔️", "CRAVINGS", 10, "Resist 10 cravings", (c) => c.resisted),
  count("resist-50", "Urge Surfer", "🏄", "CRAVINGS", 50, "Resist 50 cravings", (c) => c.resisted),
  count("resist-100", "Unbreakable", "🛡️", "CRAVINGS", 100, "Resist 100 cravings", (c) => c.resisted),
  count("iron-will", "Iron Will", "🦾", "CRAVINGS", 5, "Resist a maximum-intensity craving", (c) => c.maxResistedIntensity),
  count("comeback", "Comeback Kid", "🔄", "CRAVINGS", 1, "Resist a craving after a slip", (c) => c.comebacks),
  count("toolbox", "Full Toolbox", "🧰", "CRAVINGS", 5, "Beat cravings with 5 different strategies", (c) => c.strategiesThatWorked),
  count("checkin-7", "Self-Aware", "📓", "HABITS", 7, "Check in 7 days in a row", (c) => c.bestCheckInStreak),
  count("checkin-30", "Mindful Month", "🧘", "HABITS", 30, "Check in 30 days in a row", (c) => c.bestCheckInStreak),
  count("prepared", "Battle Ready", "🎯", "HABITS", PREP_TASKS.length, "Complete the whole prep checklist", (c) => c.prepDone),
  count("aid-user", "Science on My Side", "💊", "HABITS", 1, "Log a quit aid use", (c) => c.aidUses),
  count("my-why", "Know My Why", "💡", "SUPPORT", 3, "Write down 3 reasons to quit", (c) => c.motivations),
  count("not-alone", "Not Alone", "🤝", "SUPPORT", 1, "Add a support contact", (c) => c.supportContacts),
  count("treat-yourself", "Treat Yourself", "🎁", "SUPPORT", 1, "Claim a reward with your savings", (c) => c.rewardsClaimed),
];

export interface BadgeStatus {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earned: boolean;
  progress: number;
}

export interface LevelDef {
  name: string;
  icon: string;
  minXp: number;
}

export const LEVELS: LevelDef[] = [
  { name: "Seed", icon: "🌰", minXp: 0 },
  { name: "Seedling", icon: "🌱", minXp: 200 },
  { name: "Sprout", icon: "🌿", minXp: 600 },
  { name: "Sapling", icon: "🪴", minXp: 1_500 },
  { name: "Young Tree", icon: "🌲", minXp: 3_500 },
  { name: "Oak", icon: "🌳", minXp: 7_000 },
  { name: "Grove", icon: "🏞️", minXp: 14_000 },
  { name: "Forest", icon: "🌲🌳", minXp: 25_000 },
  { name: "Ancient Forest", icon: "🌍", minXp: 45_000 },
];

export const XP = {
  perSmokeFreeDay: 100,
  perResistedCraving: 25,
  intenseCravingBonus: 15,
  perCheckIn: 15,
  perBadge: 50,
} as const;

export interface LevelStatus {
  xp: number;
  level: number;
  name: string;
  icon: string;
  currentLevelXp: number;
  nextLevelXp: number | null;
  progress: number;
}

export function levelFor(xp: number): LevelStatus {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) index = i;
  const current = LEVELS[index];
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null;
  return {
    xp,
    level: index + 1,
    name: current.name,
    icon: current.icon,
    currentLevelXp: current.minXp,
    nextLevelXp: next ? next.minXp : null,
    progress: next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1,
  };
}

export interface Streaks {
  /** Start of the current slip-free run (quit date or last slip), null before quitting. */
  recoveryStart: number | null;
  smokeFreeStreakMs: number;
  bestStreakMs: number;
  checkInStreak: number;
  bestCheckInStreak: number;
  checkedInToday: boolean;
}

export function computeStreaks(state: QuitJourneyState, periods: Period[], now: number): Streaks {
  let best = 0;
  let recoveryStart: number | null = null;
  const quit = state.plan ? Date.parse(state.plan.quitDateTime) : null;
  for (const p of periods) {
    const slips = state.slips
      .map((s) => Date.parse(s.timestamp))
      .filter((t) => t >= p.start && t <= p.end)
      .sort((a, b) => a - b);
    let cursor = p.start;
    for (const t of slips) {
      best = Math.max(best, t - cursor);
      cursor = t;
    }
    best = Math.max(best, p.end - cursor);
    if (p.start === quit && p.end === now) recoveryStart = cursor;
  }

  const dates = new Set(state.checkIns.map((c) => c.date));
  const today = localDateKey(now);
  let cursorKey = dates.has(today) ? today : shiftDateKey(today, -1);
  let checkInStreak = 0;
  while (dates.has(cursorKey)) {
    checkInStreak += 1;
    cursorKey = shiftDateKey(cursorKey, -1);
  }
  let bestCheckInStreak = 0;
  for (const d of dates) {
    if (dates.has(shiftDateKey(d, -1))) continue;
    let run = 0;
    let k = d;
    while (dates.has(k)) {
      run += 1;
      k = shiftDateKey(k, 1);
    }
    bestCheckInStreak = Math.max(bestCheckInStreak, run);
  }

  return {
    recoveryStart,
    smokeFreeStreakMs: recoveryStart === null ? 0 : now - recoveryStart,
    bestStreakMs: best,
    checkInStreak,
    bestCheckInStreak,
    checkedInToday: dates.has(today),
  };
}

export interface Gamification {
  level: LevelStatus;
  badges: BadgeStatus[];
  earnedBadges: number;
  nextBadge: BadgeStatus | null;
}

export function computeGamification(
  state: QuitJourneyState,
  periods: Period[],
  streaks: Streaks,
  money: MoneyStats | null,
  now: number,
): Gamification {
  const quit = state.plan ? Date.parse(state.plan.quitDateTime) : null;
  const resistedCravings = state.cravings.filter((c) => c.outcome === "RESISTED");
  const firstSlip = state.slips.reduce<number | null>((min, s) => {
    const t = Date.parse(s.timestamp);
    return min === null || t < min ? t : min;
  }, null);

  const ctx: BadgeContext = {
    currentElapsedMs: quit === null ? 0 : Math.max(0, now - quit),
    bestStreakMs: streaks.bestStreakMs,
    moneySaved: money?.moneySaved ?? 0,
    unitsAvoided: money?.unitsAvoided ?? 0,
    resisted: resistedCravings.length,
    maxResistedIntensity: resistedCravings.reduce((m, c) => Math.max(m, c.intensity), 0),
    comebacks: firstSlip === null ? 0 : resistedCravings.filter((c) => Date.parse(c.timestamp) > firstSlip).length,
    strategiesThatWorked: new Set(resistedCravings.map((c) => c.strategy).filter(Boolean)).size,
    checkInStreak: streaks.checkInStreak,
    bestCheckInStreak: streaks.bestCheckInStreak,
    supportContacts: state.supportContacts.length,
    motivations: state.motivations.length,
    prepDone: PREP_TASKS.filter((t) => state.prepTasksDone.includes(t.key)).length,
    rewardsClaimed: state.rewards.filter((r) => r.claimedAt).length,
    aidUses: state.aidUses.length,
  };

  const badges: BadgeStatus[] = BADGES.map((b) => {
    const value = b.metric(ctx);
    return {
      key: b.key,
      title: b.title,
      description: b.description,
      icon: b.icon,
      category: b.category,
      earned: value >= b.target,
      progress: Math.min(1, value / b.target),
    };
  });
  const earned = badges.filter((b) => b.earned);
  const nextBadge = badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)[0] ?? null;

  const smokeFreeDays = Math.floor(periods.reduce((s, p) => s + (p.end - p.start), 0) / DAY);
  const xp =
    smokeFreeDays * XP.perSmokeFreeDay +
    resistedCravings.reduce((s, c) => s + XP.perResistedCraving + (c.intensity >= 4 ? XP.intenseCravingBonus : 0), 0) +
    state.checkIns.length * XP.perCheckIn +
    earned.length * XP.perBadge;

  return { level: levelFor(xp), badges, earnedBadges: earned.length, nextBadge };
}
