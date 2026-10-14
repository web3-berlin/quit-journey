import type {
  CopingStrategy,
  CravingTrigger,
  QuitJourneyState,
  WithdrawalSymptom,
} from "document-models/quit-journey/v1";
import { DAY } from "./time.js";

export interface StrategyStat {
  strategy: CopingStrategy;
  uses: number;
  resisted: number;
  /** Raw resist rate 0-1. */
  rate: number;
  /** Laplace-smoothed rate used for ranking so one lucky use does not dominate. */
  score: number;
}

export interface TriggerStat {
  trigger: CravingTrigger;
  count: number;
  smoked: number;
  avgIntensity: number;
}

export interface RiskWindow {
  weekday: number;
  startHour: number;
  count: number;
}

export interface WeekBucket {
  weekStart: number;
  cravings: number;
  avgIntensity: number;
}

export interface Insights {
  totalCravings: number;
  resistedCravings: number;
  resistRate: number;
  strategies: StrategyStat[];
  bestStrategy: CopingStrategy | null;
  triggers: TriggerStat[];
  topTrigger: CravingTrigger | null;
  /** 7 (Sun..Sat) x 24 hour craving counts. */
  heatmap: number[][];
  riskWindow: RiskWindow | null;
  weeklyTrend: WeekBucket[];
  typicalCravingMinutes: number;
  weightChangeKg: number | null;
  latestWeightKg: number | null;
  frequentSymptoms: { symptom: WithdrawalSymptom; count: number }[];
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeInsights(state: QuitJourneyState, now: number, weeks = 8): Insights {
  const cravings = state.cravings;
  const resisted = cravings.filter((c) => c.outcome === "RESISTED").length;

  const byStrategy = new Map<CopingStrategy, { uses: number; resisted: number }>();
  for (const c of cravings) {
    if (!c.strategy) continue;
    const s = byStrategy.get(c.strategy) ?? { uses: 0, resisted: 0 };
    s.uses += 1;
    if (c.outcome === "RESISTED") s.resisted += 1;
    byStrategy.set(c.strategy, s);
  }
  const strategies = [...byStrategy.entries()]
    .map(([strategy, s]) => ({
      strategy,
      uses: s.uses,
      resisted: s.resisted,
      rate: s.resisted / s.uses,
      score: (s.resisted + 1) / (s.uses + 2),
    }))
    .sort((a, b) => b.score - a.score || b.uses - a.uses);

  const byTrigger = new Map<CravingTrigger, { count: number; smoked: number; intensity: number }>();
  for (const c of cravings) {
    const t = byTrigger.get(c.trigger) ?? { count: 0, smoked: 0, intensity: 0 };
    t.count += 1;
    t.intensity += c.intensity;
    if (c.outcome === "SMOKED") t.smoked += 1;
    byTrigger.set(c.trigger, t);
  }
  const triggers = [...byTrigger.entries()]
    .map(([trigger, t]) => ({ trigger, count: t.count, smoked: t.smoked, avgIntensity: t.intensity / t.count }))
    .sort((a, b) => b.count - a.count || b.avgIntensity - a.avgIntensity);

  const heatmap = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const c of cravings) {
    const d = new Date(Date.parse(c.timestamp));
    heatmap[d.getDay()][d.getHours()] += 1;
  }
  let riskWindow: RiskWindow | null = null;
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let startHour = 0; startHour < 23; startHour++) {
      const count = heatmap[weekday][startHour] + heatmap[weekday][startHour + 1];
      if (count >= 2 && (!riskWindow || count > riskWindow.count)) {
        riskWindow = { weekday, startHour, count };
      }
    }
  }

  const weeklyTrend: WeekBucket[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = now - w * 7 * DAY;
    const start = end - 7 * DAY;
    const inWeek = cravings.filter((c) => {
      const t = Date.parse(c.timestamp);
      return t > start && t <= end;
    });
    weeklyTrend.push({
      weekStart: start,
      cravings: inWeek.length,
      avgIntensity: inWeek.length ? inWeek.reduce((s, c) => s + c.intensity, 0) / inWeek.length : 0,
    });
  }

  const durations = cravings.map((c) => c.durationMinutes).filter((d): d is number => d != null);

  const weighed = [...state.checkIns]
    .filter((c) => c.weightKg != null)
    .sort((a, b) => a.date.localeCompare(b.date));
  const firstWeight = weighed.length ? weighed[0].weightKg : null;
  const latestWeight = weighed.length ? weighed[weighed.length - 1].weightKg : null;

  const recent = [...state.checkIns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const symptomCounts = new Map<WithdrawalSymptom, number>();
  for (const c of recent) {
    for (const s of c.symptoms) symptomCounts.set(s, (symptomCounts.get(s) ?? 0) + 1);
  }

  return {
    totalCravings: cravings.length,
    resistedCravings: resisted,
    resistRate: cravings.length ? resisted / cravings.length : 0,
    strategies,
    bestStrategy: strategies.length ? strategies[0].strategy : null,
    triggers,
    topTrigger: triggers.length ? triggers[0].trigger : null,
    heatmap,
    riskWindow,
    weeklyTrend,
    typicalCravingMinutes: Math.round(median(durations) ?? 5),
    weightChangeKg: firstWeight != null && latestWeight != null && weighed.length > 1 ? latestWeight - firstWeight : null,
    latestWeightKg: latestWeight ?? null,
    frequentSymptoms: [...symptomCounts.entries()]
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count),
  };
}
