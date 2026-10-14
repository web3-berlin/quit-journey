/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { DeleteCravingInput, LogCravingInput } from "../types.js";

export type LogCravingAction = Action & {
  type: "LOG_CRAVING";
  input: LogCravingInput;
};
export type DeleteCravingAction = Action & {
  type: "DELETE_CRAVING";
  input: DeleteCravingInput;
};

export type QuitJourneyCravingsAction = LogCravingAction | DeleteCravingAction;
