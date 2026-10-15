/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddIfThenPlanInputSchema,
  DeleteIfThenPlanInputSchema,
  ReviewIfThenPlanInputSchema,
  UpdateIfThenPlanInputSchema,
} from "../schema/zod.js";
import type {
  AddIfThenPlanInput,
  DeleteIfThenPlanInput,
  ReviewIfThenPlanInput,
  UpdateIfThenPlanInput,
} from "../types.js";
import type {
  AddIfThenPlanAction,
  DeleteIfThenPlanAction,
  ReviewIfThenPlanAction,
  UpdateIfThenPlanAction,
} from "./actions.js";

export const addIfThenPlan = (input: AddIfThenPlanInput) =>
  createAction<AddIfThenPlanAction>(
    "ADD_IF_THEN_PLAN",
    { ...input },
    undefined,
    AddIfThenPlanInputSchema,
    "global",
  );

export const updateIfThenPlan = (input: UpdateIfThenPlanInput) =>
  createAction<UpdateIfThenPlanAction>(
    "UPDATE_IF_THEN_PLAN",
    { ...input },
    undefined,
    UpdateIfThenPlanInputSchema,
    "global",
  );

export const reviewIfThenPlan = (input: ReviewIfThenPlanInput) =>
  createAction<ReviewIfThenPlanAction>(
    "REVIEW_IF_THEN_PLAN",
    { ...input },
    undefined,
    ReviewIfThenPlanInputSchema,
    "global",
  );

export const deleteIfThenPlan = (input: DeleteIfThenPlanInput) =>
  createAction<DeleteIfThenPlanAction>(
    "DELETE_IF_THEN_PLAN",
    { ...input },
    undefined,
    DeleteIfThenPlanInputSchema,
    "global",
  );
