/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating QuitJourneyDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  QuitJourneyDocument,
  QuitJourneyGlobalState,
  QuitJourneyLocalState,
  QuitJourneyPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): QuitJourneyGlobalState {
  return {
    displayName: null,
    plan: null,
    motivations: [],
    prepTasksDone: [],
    cravings: [],
    slips: [],
    pastAttempts: [],
    checkIns: [],
    rewards: [],
    aids: [],
    aidUses: [],
    supportContacts: [],
    quitlinePhone: null,
    naloxoneKits: [],
    drugChecks: [],
    exclusions: [],
    ifThenPlans: [],
    drinks: [],
    screenTime: [],
    gamblingLosses: [],
    assessments: [],
    medicationPlans: [],
    takeHomes: [],
    programs: [],
  };
}

export function defaultLocalState(): QuitJourneyLocalState {
  return {
    safetyChecks: [],
    riskyPlaces: [],
  };
}

export function defaultPHState(): QuitJourneyPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<QuitJourneyGlobalState>,
): QuitJourneyGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<QuitJourneyLocalState>,
): QuitJourneyLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as QuitJourneyLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<QuitJourneyGlobalState>,
  localState?: Partial<QuitJourneyLocalState>,
): QuitJourneyPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a QuitJourneyDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createQuitJourneyDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<QuitJourneyGlobalState>;
    local?: Partial<QuitJourneyLocalState>;
  }>,
): QuitJourneyDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
