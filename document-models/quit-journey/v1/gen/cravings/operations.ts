/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type { DeleteCravingAction, LogCravingAction } from "./actions.js";

export interface QuitJourneyCravingsOperations {
  logCravingOperation: (
    state: QuitJourneyGlobalState,
    action: LogCravingAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteCravingOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteCravingAction,
    dispatch?: SignalDispatch,
  ) => void;
}
