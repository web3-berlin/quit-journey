/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  AddRewardGoalAction,
  ClaimRewardAction,
  DeleteRewardGoalAction,
} from "./actions.js";

export interface QuitJourneyRewardsOperations {
  addRewardGoalOperation: (
    state: QuitJourneyGlobalState,
    action: AddRewardGoalAction,
    dispatch?: SignalDispatch,
  ) => void;
  claimRewardOperation: (
    state: QuitJourneyGlobalState,
    action: ClaimRewardAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteRewardGoalOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteRewardGoalAction,
    dispatch?: SignalDispatch,
  ) => void;
}
