/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  DeleteDrinkInput,
  DeleteGamblingLossInput,
  LogDrinkInput,
  LogGamblingLossInput,
  LogScreenTimeInput,
} from "../types.js";

export type LogDrinkAction = Action & {
  type: "LOG_DRINK";
  input: LogDrinkInput;
};
export type DeleteDrinkAction = Action & {
  type: "DELETE_DRINK";
  input: DeleteDrinkInput;
};
export type LogScreenTimeAction = Action & {
  type: "LOG_SCREEN_TIME";
  input: LogScreenTimeInput;
};
export type LogGamblingLossAction = Action & {
  type: "LOG_GAMBLING_LOSS";
  input: LogGamblingLossInput;
};
export type DeleteGamblingLossAction = Action & {
  type: "DELETE_GAMBLING_LOSS";
  input: DeleteGamblingLossInput;
};

export type QuitJourneyTrackingAction =
  | LogDrinkAction
  | DeleteDrinkAction
  | LogScreenTimeAction
  | LogGamblingLossAction
  | DeleteGamblingLossAction;
