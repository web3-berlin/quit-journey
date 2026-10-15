/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddIfThenPlanInput,
  DeleteIfThenPlanInput,
  ReviewIfThenPlanInput,
  UpdateIfThenPlanInput,
} from "../types.js";

export type AddIfThenPlanAction = Action & {
  type: "ADD_IF_THEN_PLAN";
  input: AddIfThenPlanInput;
};
export type UpdateIfThenPlanAction = Action & {
  type: "UPDATE_IF_THEN_PLAN";
  input: UpdateIfThenPlanInput;
};
export type ReviewIfThenPlanAction = Action & {
  type: "REVIEW_IF_THEN_PLAN";
  input: ReviewIfThenPlanInput;
};
export type DeleteIfThenPlanAction = Action & {
  type: "DELETE_IF_THEN_PLAN";
  input: DeleteIfThenPlanInput;
};

export type QuitJourneyPlansAction =
  | AddIfThenPlanAction
  | UpdateIfThenPlanAction
  | ReviewIfThenPlanAction
  | DeleteIfThenPlanAction;
