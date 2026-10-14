/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { DailyCheckInInput, DeleteCheckInInput } from "../types.js";

export type DailyCheckInAction = Action & {
  type: "DAILY_CHECK_IN";
  input: DailyCheckInInput;
};
export type DeleteCheckInAction = Action & {
  type: "DELETE_CHECK_IN";
  input: DeleteCheckInInput;
};

export type QuitJourneyCheckinsAction =
  | DailyCheckInAction
  | DeleteCheckInAction;
