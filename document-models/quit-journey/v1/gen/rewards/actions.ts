/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddRewardGoalInput,
  ClaimRewardInput,
  DeleteRewardGoalInput,
} from "../types.js";

export type AddRewardGoalAction = Action & {
  type: "ADD_REWARD_GOAL";
  input: AddRewardGoalInput;
};
export type ClaimRewardAction = Action & {
  type: "CLAIM_REWARD";
  input: ClaimRewardInput;
};
export type DeleteRewardGoalAction = Action & {
  type: "DELETE_REWARD_GOAL";
  input: DeleteRewardGoalInput;
};

export type QuitJourneyRewardsAction =
  | AddRewardGoalAction
  | ClaimRewardAction
  | DeleteRewardGoalAction;
