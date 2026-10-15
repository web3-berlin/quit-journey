/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils, PHBaseState, Reducer } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInputVersioned,
  baseSaveToFileHandle,
  createBaseState,
} from "document-model";
import { quitJourneyUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsQuitJourneyDocument,
  assertIsQuitJourneyState,
  isQuitJourneyDocument,
  isQuitJourneyState,
} from "./document-schema.js";
import { quitJourneyDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  QuitJourneyGlobalState,
  QuitJourneyLocalState,
  QuitJourneyPHState,
} from "./types.js";

export const initialGlobalState: QuitJourneyGlobalState = {
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
export const initialLocalState: QuitJourneyLocalState = {
  safetyChecks: [],
  riskyPlaces: [],
};

export const utils: DocumentModelUtils<QuitJourneyPHState> = {
  fileExtension: ".quit",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      quitJourneyDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: quitJourneyUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isQuitJourneyState(state);
  },
  assertIsStateOfType(state) {
    return assertIsQuitJourneyState(state);
  },
  isDocumentOfType(document) {
    return isQuitJourneyDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsQuitJourneyDocument(document);
  },
};
