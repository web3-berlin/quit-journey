import type {
  QuitJourneyAction,
  QuitJourneyDocument,
  QuitJourneyState,
  SetQuitPlanInput,
} from "document-models/quit-journey/v1";
import { reducer, setQuitPlan, utils } from "document-models/quit-journey/v1";

export const DAY_MS = 86_400_000;

/** Applies actions in order, starting from a fresh document unless one is given. */
export function run(
  actions: QuitJourneyAction[],
  doc: QuitJourneyDocument = utils.createDocument(),
): QuitJourneyDocument {
  return actions.reduce((d, a) => reducer(d, a), doc);
}

/** The error of every global operation, null for successful ones. */
export function errs(doc: QuitJourneyDocument): (string | null)[] {
  return doc.operations.global.map((o) => o.error ?? null);
}

/** Shifts an ISO timestamp by a number of days. */
export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString();
}

export const QUIT = "2026-01-01T08:00:00.000Z";

/** 20 cigarettes a day, 20 per pack at 10 EUR: 0.50 per unit, 10 per day. */
export function planInput(overrides: Partial<SetQuitPlanInput> = {}): SetQuitPlanInput {
  return {
    quitDateTime: QUIT,
    productType: "CIGARETTES",
    unitsPerDay: 20,
    unitsPerPack: 20,
    packPrice: 10,
    currency: "EUR",
    ...overrides,
  };
}

export const withPlan = (overrides: Partial<SetQuitPlanInput> = {}) =>
  run([setQuitPlan(planInput(overrides))]);

/** A plain state object for engine tests (bypasses action validation). */
export function makeState(overrides: Partial<QuitJourneyState> = {}): QuitJourneyState {
  return { ...utils.createDocument().state.global, ...overrides };
}
