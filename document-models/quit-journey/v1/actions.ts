/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  quitJourneyAidsActions,
  quitJourneyCheckinsActions,
  quitJourneyCravingsActions,
  quitJourneyPlanActions,
  quitJourneyRewardsActions,
  quitJourneySlipsActions,
  quitJourneySupportActions,
} from "./gen/creators.js";

/** Actions for the QuitJourney document model */

export const actions = {
  ...baseActions,
  ...quitJourneyPlanActions,
  ...quitJourneyCravingsActions,
  ...quitJourneySlipsActions,
  ...quitJourneyCheckinsActions,
  ...quitJourneyRewardsActions,
  ...quitJourneyAidsActions,
  ...quitJourneySupportActions,
};
