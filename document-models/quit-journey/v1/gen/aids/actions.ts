/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddQuitAidInput,
  EndQuitAidInput,
  LogAidUseInput,
} from "../types.js";

export type AddQuitAidAction = Action & {
  type: "ADD_QUIT_AID";
  input: AddQuitAidInput;
};
export type EndQuitAidAction = Action & {
  type: "END_QUIT_AID";
  input: EndQuitAidInput;
};
export type LogAidUseAction = Action & {
  type: "LOG_AID_USE";
  input: LogAidUseInput;
};

export type QuitJourneyAidsAction =
  | AddQuitAidAction
  | EndQuitAidAction
  | LogAidUseAction;
