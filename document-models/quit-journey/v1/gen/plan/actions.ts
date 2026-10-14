/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddMotivationInput,
  RemoveMotivationInput,
  SetDisplayNameInput,
  SetQuitPlanInput,
  TogglePrepTaskInput,
} from "../types.js";

export type SetQuitPlanAction = Action & {
  type: "SET_QUIT_PLAN";
  input: SetQuitPlanInput;
};
export type SetDisplayNameAction = Action & {
  type: "SET_DISPLAY_NAME";
  input: SetDisplayNameInput;
};
export type AddMotivationAction = Action & {
  type: "ADD_MOTIVATION";
  input: AddMotivationInput;
};
export type RemoveMotivationAction = Action & {
  type: "REMOVE_MOTIVATION";
  input: RemoveMotivationInput;
};
export type TogglePrepTaskAction = Action & {
  type: "TOGGLE_PREP_TASK";
  input: TogglePrepTaskInput;
};

export type QuitJourneyPlanAction =
  | SetQuitPlanAction
  | SetDisplayNameAction
  | AddMotivationAction
  | RemoveMotivationAction
  | TogglePrepTaskAction;
