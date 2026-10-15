/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { QuitJourneyPHState } from "document-models/quit-journey/v1";

import { quitJourneyAidsOperations } from "../src/reducers/aids.js";
import { quitJourneyAssessmentsOperations } from "../src/reducers/assessments.js";
import { quitJourneyCheckinsOperations } from "../src/reducers/checkins.js";
import { quitJourneyCravingsOperations } from "../src/reducers/cravings.js";
import { quitJourneyMedicationOperations } from "../src/reducers/medication.js";
import { quitJourneyPlanOperations } from "../src/reducers/plan.js";
import { quitJourneyPlansOperations } from "../src/reducers/plans.js";
import { quitJourneyProgramsOperations } from "../src/reducers/programs.js";
import { quitJourneyRewardsOperations } from "../src/reducers/rewards.js";
import { quitJourneySafetyOperations } from "../src/reducers/safety.js";
import { quitJourneySlipsOperations } from "../src/reducers/slips.js";
import { quitJourneySupportOperations } from "../src/reducers/support.js";
import { quitJourneyTrackingOperations } from "../src/reducers/tracking.js";

import {
  AddExclusionInputSchema,
  AddIfThenPlanInputSchema,
  AddMotivationInputSchema,
  AddNaloxoneKitInputSchema,
  AddQuitAidInputSchema,
  AddRewardGoalInputSchema,
  AddRiskyPlaceInputSchema,
  AddSupportContactInputSchema,
  ClaimRewardInputSchema,
  ClearMedicationPlanInputSchema,
  CompleteMissionInputSchema,
  DailyCheckInInputSchema,
  DeleteAssessmentInputSchema,
  DeleteCheckInInputSchema,
  DeleteCravingInputSchema,
  DeleteDrinkInputSchema,
  DeleteDrugCheckInputSchema,
  DeleteExclusionInputSchema,
  DeleteGamblingLossInputSchema,
  DeleteIfThenPlanInputSchema,
  DeleteRewardGoalInputSchema,
  DeleteRiskyPlaceInputSchema,
  DeleteSlipInputSchema,
  EndProgramInputSchema,
  EndQuitAidInputSchema,
  EndSafetyCheckInputSchema,
  LogAidUseInputSchema,
  LogCravingInputSchema,
  LogDrinkInputSchema,
  LogDrugCheckInputSchema,
  LogGamblingLossInputSchema,
  LogScreenTimeInputSchema,
  LogSlipInputSchema,
  MarkNaloxoneUsedInputSchema,
  RecordAssessmentInputSchema,
  RecordTakeHomeInputSchema,
  RemoveMotivationInputSchema,
  RemoveNaloxoneKitInputSchema,
  RemoveSupportContactInputSchema,
  RestartJourneyInputSchema,
  ReviewIfThenPlanInputSchema,
  SetDisplayNameInputSchema,
  SetMedicationPlanInputSchema,
  SetQuitlineInputSchema,
  SetQuitPlanInputSchema,
  StartProgramInputSchema,
  StartSafetyCheckInputSchema,
  TogglePrepTaskInputSchema,
  UpdateIfThenPlanInputSchema,
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

    case "ADD_NALOXONE_KIT": {
      memoizedSchema(AddNaloxoneKitInputSchema).parse(action.input);

      quitJourneySafetyOperations.addNaloxoneKitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_NALOXONE_USED": {
      memoizedSchema(MarkNaloxoneUsedInputSchema).parse(action.input);

      quitJourneySafetyOperations.markNaloxoneUsedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_NALOXONE_KIT": {
      memoizedSchema(RemoveNaloxoneKitInputSchema).parse(action.input);

      quitJourneySafetyOperations.removeNaloxoneKitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_DRUG_CHECK": {
      memoizedSchema(LogDrugCheckInputSchema).parse(action.input);

      quitJourneySafetyOperations.logDrugCheckOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_DRUG_CHECK": {
      memoizedSchema(DeleteDrugCheckInputSchema).parse(action.input);

      quitJourneySafetyOperations.deleteDrugCheckOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_EXCLUSION": {
      memoizedSchema(AddExclusionInputSchema).parse(action.input);

      quitJourneySafetyOperations.addExclusionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_EXCLUSION": {
      memoizedSchema(DeleteExclusionInputSchema).parse(action.input);

      quitJourneySafetyOperations.deleteExclusionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "START_SAFETY_CHECK": {
      memoizedSchema(StartSafetyCheckInputSchema).parse(action.input);

      quitJourneySafetyOperations.startSafetyCheckOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "END_SAFETY_CHECK": {
      memoizedSchema(EndSafetyCheckInputSchema).parse(action.input);

      quitJourneySafetyOperations.endSafetyCheckOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_RISKY_PLACE": {
      memoizedSchema(AddRiskyPlaceInputSchema).parse(action.input);

      quitJourneySafetyOperations.addRiskyPlaceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_RISKY_PLACE": {
      memoizedSchema(DeleteRiskyPlaceInputSchema).parse(action.input);

      quitJourneySafetyOperations.deleteRiskyPlaceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_IF_THEN_PLAN": {
      memoizedSchema(AddIfThenPlanInputSchema).parse(action.input);

      quitJourneyPlansOperations.addIfThenPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_IF_THEN_PLAN": {
      memoizedSchema(UpdateIfThenPlanInputSchema).parse(action.input);

      quitJourneyPlansOperations.updateIfThenPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REVIEW_IF_THEN_PLAN": {
      memoizedSchema(ReviewIfThenPlanInputSchema).parse(action.input);

      quitJourneyPlansOperations.reviewIfThenPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_IF_THEN_PLAN": {
      memoizedSchema(DeleteIfThenPlanInputSchema).parse(action.input);

      quitJourneyPlansOperations.deleteIfThenPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_DRINK": {
      memoizedSchema(LogDrinkInputSchema).parse(action.input);

      quitJourneyTrackingOperations.logDrinkOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_DRINK": {
      memoizedSchema(DeleteDrinkInputSchema).parse(action.input);

      quitJourneyTrackingOperations.deleteDrinkOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_SCREEN_TIME": {
      memoizedSchema(LogScreenTimeInputSchema).parse(action.input);

      quitJourneyTrackingOperations.logScreenTimeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_GAMBLING_LOSS": {
      memoizedSchema(LogGamblingLossInputSchema).parse(action.input);

      quitJourneyTrackingOperations.logGamblingLossOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_GAMBLING_LOSS": {
      memoizedSchema(DeleteGamblingLossInputSchema).parse(action.input);

      quitJourneyTrackingOperations.deleteGamblingLossOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RECORD_ASSESSMENT": {
      memoizedSchema(RecordAssessmentInputSchema).parse(action.input);

      quitJourneyAssessmentsOperations.recordAssessmentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_ASSESSMENT": {
      memoizedSchema(DeleteAssessmentInputSchema).parse(action.input);

      quitJourneyAssessmentsOperations.deleteAssessmentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_MEDICATION_PLAN": {
      memoizedSchema(SetMedicationPlanInputSchema).parse(action.input);

      quitJourneyMedicationOperations.setMedicationPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CLEAR_MEDICATION_PLAN": {
      memoizedSchema(ClearMedicationPlanInputSchema).parse(action.input);

      quitJourneyMedicationOperations.clearMedicationPlanOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RECORD_TAKE_HOME": {
      memoizedSchema(RecordTakeHomeInputSchema).parse(action.input);

      quitJourneyMedicationOperations.recordTakeHomeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "START_PROGRAM": {
      memoizedSchema(StartProgramInputSchema).parse(action.input);

      quitJourneyProgramsOperations.startProgramOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "COMPLETE_MISSION": {
      memoizedSchema(CompleteMissionInputSchema).parse(action.input);

      quitJourneyProgramsOperations.completeMissionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "END_PROGRAM": {
      memoizedSchema(EndProgramInputSchema).parse(action.input);

      quitJourneyProgramsOperations.endProgramOperation(
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
