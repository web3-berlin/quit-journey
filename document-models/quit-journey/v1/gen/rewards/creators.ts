/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddRewardGoalInputSchema,
  ClaimRewardInputSchema,
  DeleteRewardGoalInputSchema,
} from "../schema/zod.js";
import type {
  AddRewardGoalInput,
  ClaimRewardInput,
  DeleteRewardGoalInput,
} from "../types.js";
import type {
  AddRewardGoalAction,
  ClaimRewardAction,
  DeleteRewardGoalAction,
} from "./actions.js";

export const addRewardGoal = (input: AddRewardGoalInput) =>
  createAction<AddRewardGoalAction>(
    "ADD_REWARD_GOAL",
    { ...input },
    undefined,
    AddRewardGoalInputSchema,
    "global",
  );

export const claimReward = (input: ClaimRewardInput) =>
  createAction<ClaimRewardAction>(
    "CLAIM_REWARD",
    { ...input },
    undefined,
    ClaimRewardInputSchema,
    "global",
  );

export const deleteRewardGoal = (input: DeleteRewardGoalInput) =>
  createAction<DeleteRewardGoalAction>(
    "DELETE_REWARD_GOAL",
    { ...input },
    undefined,
    DeleteRewardGoalInputSchema,
    "global",
  );
