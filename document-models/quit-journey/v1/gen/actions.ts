/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { QuitJourneyAidsAction } from "./aids/actions.js";
import type { QuitJourneyCheckinsAction } from "./checkins/actions.js";
import type { QuitJourneyCravingsAction } from "./cravings/actions.js";
import type { QuitJourneyPlanAction } from "./plan/actions.js";
import type { QuitJourneyRewardsAction } from "./rewards/actions.js";
import type { QuitJourneySlipsAction } from "./slips/actions.js";
import type { QuitJourneySupportAction } from "./support/actions.js";

export * from "./aids/actions.js";
export * from "./checkins/actions.js";
export * from "./cravings/actions.js";
export * from "./plan/actions.js";
export * from "./rewards/actions.js";
export * from "./slips/actions.js";
export * from "./support/actions.js";

export type QuitJourneyAction =
  | QuitJourneyPlanAction
  | QuitJourneyCravingsAction
  | QuitJourneySlipsAction
  | QuitJourneyCheckinsAction
  | QuitJourneyRewardsAction
  | QuitJourneyAidsAction
  | QuitJourneySupportAction;
