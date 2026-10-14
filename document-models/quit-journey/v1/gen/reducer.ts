/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { QuitJourneyPHState } from "document-models/quit-journey/v1";

import { quitJourneyAidsOperations } from "../src/reducers/aids.js";
import { quitJourneyCheckinsOperations } from "../src/reducers/checkins.js";
import { quitJourneyCravingsOperations } from "../src/reducers/cravings.js";
import { quitJourneyPlanOperations } from "../src/reducers/plan.js";
import { quitJourneyRewardsOperations } from "../src/reducers/rewards.js";
import { quitJourneySlipsOperations } from "../src/reducers/slips.js";
import { quitJourneySupportOperations } from "../src/reducers/support.js";

import {
  AddMotivationInputSchema,
  AddQuitAidInputSchema,
  AddRewardGoalInputSchema,
  AddSupportContactInputSchema,
  ClaimRewardInputSchema,
  DailyCheckInInputSchema,
  DeleteCheckInInputSchema,
  DeleteCravingInputSchema,
  DeleteRewardGoalInputSchema,
  DeleteSlipInputSchema,
  EndQuitAidInputSchema,
  LogAidUseInputSchema,
  LogCravingInputSchema,
  LogSlipInputSchema,
  RemoveMotivationInputSchema,
  RemoveSupportContactInputSchema,
  RestartJourneyInputSchema,
  SetDisplayNameInputSchema,
  SetQuitlineInputSchema,
  SetQuitPlanInputSchema,
  TogglePrepTaskInputSchema,
} from "./schema/zod.js";

const schemaMemo = new Map<() => unknown, unknown>();

function memoizedSchema<T>(makeSchema: () => T): T {
  let schema = schemaMemo.get(makeSchema) as T | undefined;
  if (schema === undefined) {
    schema = makeSchema();
    schemaMemo.set(makeSchema, schema);
  }
  return schema;
}

const stateReducer: StateReducer<QuitJourneyPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_QUIT_PLAN": {
      memoizedSchema(SetQuitPlanInputSchema).parse(action.input);

      quitJourneyPlanOperations.setQuitPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_DISPLAY_NAME": {
      memoizedSchema(SetDisplayNameInputSchema).parse(action.input);

      quitJourneyPlanOperations.setDisplayNameOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_MOTIVATION": {
      memoizedSchema(AddMotivationInputSchema).parse(action.input);

      quitJourneyPlanOperations.addMotivationOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_MOTIVATION": {
      memoizedSchema(RemoveMotivationInputSchema).parse(action.input);

      quitJourneyPlanOperations.removeMotivationOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "TOGGLE_PREP_TASK": {
      memoizedSchema(TogglePrepTaskInputSchema).parse(action.input);

      quitJourneyPlanOperations.togglePrepTaskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_CRAVING": {
      memoizedSchema(LogCravingInputSchema).parse(action.input);

      quitJourneyCravingsOperations.logCravingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_CRAVING": {
      memoizedSchema(DeleteCravingInputSchema).parse(action.input);

      quitJourneyCravingsOperations.deleteCravingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_SLIP": {
      memoizedSchema(LogSlipInputSchema).parse(action.input);

      quitJourneySlipsOperations.logSlipOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_SLIP": {
      memoizedSchema(DeleteSlipInputSchema).parse(action.input);

      quitJourneySlipsOperations.deleteSlipOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RESTART_JOURNEY": {
      memoizedSchema(RestartJourneyInputSchema).parse(action.input);

      quitJourneySlipsOperations.restartJourneyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DAILY_CHECK_IN": {
      memoizedSchema(DailyCheckInInputSchema).parse(action.input);

      quitJourneyCheckinsOperations.dailyCheckInOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_CHECK_IN": {
      memoizedSchema(DeleteCheckInInputSchema).parse(action.input);

      quitJourneyCheckinsOperations.deleteCheckInOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_REWARD_GOAL": {
      memoizedSchema(AddRewardGoalInputSchema).parse(action.input);

      quitJourneyRewardsOperations.addRewardGoalOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CLAIM_REWARD": {
      memoizedSchema(ClaimRewardInputSchema).parse(action.input);

      quitJourneyRewardsOperations.claimRewardOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_REWARD_GOAL": {
      memoizedSchema(DeleteRewardGoalInputSchema).parse(action.input);

      quitJourneyRewardsOperations.deleteRewardGoalOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_QUIT_AID": {
      memoizedSchema(AddQuitAidInputSchema).parse(action.input);

      quitJourneyAidsOperations.addQuitAidOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "END_QUIT_AID": {
      memoizedSchema(EndQuitAidInputSchema).parse(action.input);

      quitJourneyAidsOperations.endQuitAidOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_AID_USE": {
      memoizedSchema(LogAidUseInputSchema).parse(action.input);

      quitJourneyAidsOperations.logAidUseOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SUPPORT_CONTACT": {
      memoizedSchema(AddSupportContactInputSchema).parse(action.input);

      quitJourneySupportOperations.addSupportContactOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SUPPORT_CONTACT": {
      memoizedSchema(RemoveSupportContactInputSchema).parse(action.input);

      quitJourneySupportOperations.removeSupportContactOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_QUITLINE": {
      memoizedSchema(SetQuitlineInputSchema).parse(action.input);

      quitJourneySupportOperations.setQuitlineOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<QuitJourneyPHState> = createReducer(stateReducer);
