/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  DeleteSlipInput,
  LogSlipInput,
  RestartJourneyInput,
} from "../types.js";

export type LogSlipAction = Action & { type: "LOG_SLIP"; input: LogSlipInput };
export type DeleteSlipAction = Action & {
  type: "DELETE_SLIP";
  input: DeleteSlipInput;
};
export type RestartJourneyAction = Action & {
  type: "RESTART_JOURNEY";
  input: RestartJourneyInput;
};

export type QuitJourneySlipsAction =
  | LogSlipAction
  | DeleteSlipAction
  | RestartJourneyAction;
