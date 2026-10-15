import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { DAY } from "./time.js";

export interface PrepTaskDef {
  key: string;
  title: string;
  hint: string;
}

/** Pre-quit readiness checklist (adapted from NHS / CDC quit-preparation advice). */
export const PREP_TASKS: PrepTaskDef[] = [
  { key: "set-date", title: "Set your quit date", hint: "Pick a day within the next two weeks — not a high-stress one." },
  { key: "add-why", title: "Write down your why", hint: "Add at least three reasons. You'll see them in every craving." },
  { key: "tell-people", title: "Tell friends & family", hint: "Ask for support and add one person to call in an emergency." },
  { key: "know-triggers", title: "Know your triggers", hint: "Coffee, alcohol, after meals, stress? Plan a swap for each." },
  { key: "get-aid", title: "Line up medication or support", hint: "Nicotine replacement, addiction medication, therapy and support groups each substantially improve your odds. Ask a doctor or pharmacist." },
  { key: "clean-sweep", title: "Clear it out", hint: "Remove whatever you use, and the things you use it with, from home, car, bags and phone." },
  { key: "plan-reward", title: "Plan your first reward", hint: "Pick something your first week of savings will buy." },
  { key: "save-quitline", title: "Save a helpline number", hint: "Free expert support, one tap away in the SOS screen." },
];

export interface PrepStatus {
  isPrepPhase: boolean;
  msUntilQuit: number;
  tasksDone: number;
  tasksTotal: number;
  readiness: number;
  /** Suggested maximum units for today during a 14-day taper towards zero. */
  taperTargetToday: number | null;
}

export function computePrep(state: QuitJourneyState, now: number): PrepStatus {
  const quit = state.plan ? Date.parse(state.plan.quitDateTime) : null;
  const msUntilQuit = quit === null ? 0 : Math.max(0, quit - now);
  const isPrepPhase = quit === null || quit > now;
  const done = PREP_TASKS.filter((t) => state.prepTasksDone.includes(t.key)).length;
  let taperTargetToday: number | null = null;
  if (state.plan && msUntilQuit > 0) {
    const daysLeft = Math.ceil(msUntilQuit / DAY);
    taperTargetToday = Math.ceil((state.plan.unitsPerDay * Math.min(daysLeft, 14)) / 14);
  }
  return {
    isPrepPhase,
    msUntilQuit,
    tasksDone: done,
    tasksTotal: PREP_TASKS.length,
    readiness: done / PREP_TASKS.length,
    taperTargetToday,
  };
}
