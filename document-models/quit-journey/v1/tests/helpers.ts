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

/** The plan the reducer stores for an input without the optional addiction fields. */
export function storedPlan(overrides: Partial<SetQuitPlanInput> = {}) {
  return {
    yearsSmoked: null,
    customName: null,
    unitLabel: null,
    goal: null,
    dailyLimit: null,
    standardDrinkGrams: null,
    ...planInput(overrides),
  };
}

export const withPlan = (overrides: Partial<SetQuitPlanInput> = {}) =>
  run([setQuitPlan(planInput(overrides))]);

/** A plain state object for engine tests (bypasses action validation). */
export function makeState(overrides: Partial<QuitJourneyState> = {}): QuitJourneyState {
  return { ...utils.createDocument().state.global, ...overrides };
}

/** The error of every local operation, null for successful ones. */
export function localErrs(doc: QuitJourneyDocument): (string | null)[] {
  return doc.operations.local.map((o) => o.error ?? null);
}

/** Global collections added with the harm-reduction / toolkit modules. */
export const TOOLKIT_COLLECTIONS = [
  "naloxoneKits",
  "drugChecks",
  "exclusions",
  "ifThenPlans",
  "drinks",
  "screenTime",
  "gamblingLosses",
  "assessments",
  "medicationPlans",
  "takeHomes",
  "programs",
] as const;

/**
 * A document as stored before the toolkit modules existed: loaded from JSON with
 * none of the new global collections and an empty local state.
 */
export function legacyToolkitDocument(): QuitJourneyDocument {
  const json = JSON.parse(JSON.stringify(utils.createDocument())) as {
    state: { global: Record<string, unknown>; local: Record<string, unknown> };
  };
  for (const key of TOOLKIT_COLLECTIONS) delete json.state.global[key];
  json.state.local = {};
  return json as unknown as QuitJourneyDocument;
}
