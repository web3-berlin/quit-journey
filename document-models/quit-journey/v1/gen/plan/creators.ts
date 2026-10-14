/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddMotivationInputSchema,
  RemoveMotivationInputSchema,
  SetDisplayNameInputSchema,
  SetQuitPlanInputSchema,
  TogglePrepTaskInputSchema,
} from "../schema/zod.js";
import type {
  AddMotivationInput,
  RemoveMotivationInput,
  SetDisplayNameInput,
  SetQuitPlanInput,
  TogglePrepTaskInput,
} from "../types.js";
import type {
  AddMotivationAction,
  RemoveMotivationAction,
  SetDisplayNameAction,
  SetQuitPlanAction,
  TogglePrepTaskAction,
} from "./actions.js";

export const setQuitPlan = (input: SetQuitPlanInput) =>
  createAction<SetQuitPlanAction>(
    "SET_QUIT_PLAN",
    { ...input },
    undefined,
    SetQuitPlanInputSchema,
    "global",
  );

export const setDisplayName = (input: SetDisplayNameInput) =>
  createAction<SetDisplayNameAction>(
    "SET_DISPLAY_NAME",
    { ...input },
    undefined,
    SetDisplayNameInputSchema,
    "global",
  );

export const addMotivation = (input: AddMotivationInput) =>
  createAction<AddMotivationAction>(
    "ADD_MOTIVATION",
    { ...input },
    undefined,
    AddMotivationInputSchema,
    "global",
  );

export const removeMotivation = (input: RemoveMotivationInput) =>
  createAction<RemoveMotivationAction>(
    "REMOVE_MOTIVATION",
    { ...input },
    undefined,
    RemoveMotivationInputSchema,
    "global",
  );

export const togglePrepTask = (input: TogglePrepTaskInput) =>
  createAction<TogglePrepTaskAction>(
    "TOGGLE_PREP_TASK",
    { ...input },
    undefined,
    TogglePrepTaskInputSchema,
    "global",
  );
