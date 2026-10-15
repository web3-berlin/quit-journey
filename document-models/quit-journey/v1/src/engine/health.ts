import { DAY, HOUR, MINUTE } from "./time.js";

export interface HealthMilestoneDef {
  key: string;
  afterMs: number;
  title: string;
  description: string;
  icon: string;
}

/**
 * Nicotine (smoking) recovery timeline after the last cigarette, summarised from WHO, CDC,
 * American Cancer Society and NHS guidance. Times are typical, not guaranteed.
 */
export const HEALTH_MILESTONES: HealthMilestoneDef[] = [
  { key: "heart-rate", afterMs: 20 * MINUTE, icon: "❤️", title: "Heart rate settles", description: "Heart rate and blood pressure start dropping back towards normal." },
  { key: "oxygen", afterMs: 8 * HOUR, icon: "🫁", title: "Oxygen recovers", description: "Carbon monoxide in your blood halves and oxygen levels climb back to normal." },
  { key: "carbon-monoxide", afterMs: 12 * HOUR, icon: "🩸", title: "Carbon monoxide cleared", description: "Carbon monoxide in your blood drops to a normal level." },
  { key: "taste-smell", afterMs: 2 * DAY, icon: "👃", title: "Taste & smell wake up", description: "Damaged nerve endings start to regrow; food tastes and smells better." },
  { key: "nicotine-free", afterMs: 3 * DAY, icon: "🧪", title: "Nicotine-free body", description: "Nicotine has left your body. Withdrawal usually peaks now — it gets easier from here." },
  { key: "breathing", afterMs: 3 * DAY + 12 * HOUR, icon: "🌬️", title: "Easier breathing", description: "Bronchial tubes relax and energy levels rise." },
  { key: "withdrawal-fades", afterMs: 21 * DAY, icon: "🧘", title: "Withdrawal fading", description: "Most physical withdrawal symptoms have faded; brain nicotine receptors are normalising." },
  { key: "circulation", afterMs: 90 * DAY, icon: "🏃", title: "Circulation & lungs up", description: "Circulation has improved and lung function has increased by up to 10%." },
  { key: "cilia", afterMs: 270 * DAY, icon: "🌿", title: "Lungs self-cleaning", description: "Coughing and shortness of breath decrease; lung cilia work normally again." },
  { key: "heart-disease-half", afterMs: 365 * DAY, icon: "💪", title: "Heart risk halved", description: "Excess risk of coronary heart disease is about half that of a smoker." },
  { key: "stroke", afterMs: 5 * 365 * DAY, icon: "🧠", title: "Stroke risk lowered", description: "Stroke risk can fall to that of a non-smoker; mouth, throat and bladder cancer risk halves." },
  { key: "lung-cancer-half", afterMs: 10 * 365 * DAY, icon: "🎗️", title: "Lung cancer risk halved", description: "Risk of dying from lung cancer is about half that of a person who still smokes." },
  { key: "heart-like-nonsmoker", afterMs: 15 * 365 * DAY, icon: "🏆", title: "Heart like a non-smoker", description: "Risk of coronary heart disease is the same as someone who never smoked." },
];

export interface HealthMilestoneStatus extends HealthMilestoneDef {
  reachedAt: number;
  progress: number;
  reached: boolean;
  remainingMs: number;
}

/** Milestones are measured from the latest of quit date and last slip. */
export function computeHealth(
  recoveryStart: number | null,
  now: number,
  milestones: HealthMilestoneDef[] = HEALTH_MILESTONES,
): HealthMilestoneStatus[] {
  return milestones.map((m) => {
    const elapsed = recoveryStart === null ? 0 : Math.max(0, now - recoveryStart);
    const reachedAt = recoveryStart === null ? 0 : recoveryStart + m.afterMs;
    return {
      ...m,
      reachedAt,
      progress: Math.min(1, elapsed / m.afterMs),
      reached: recoveryStart !== null && elapsed >= m.afterMs,
      remainingMs: Math.max(0, m.afterMs - elapsed),
    };
  });
}
