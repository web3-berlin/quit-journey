/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  DeleteDrinkAction,
  DeleteGamblingLossAction,
  LogDrinkAction,
  LogGamblingLossAction,
  LogScreenTimeAction,
} from "./actions.js";

export interface QuitJourneyTrackingOperations {
  logDrinkOperation: (
    state: QuitJourneyGlobalState,
    action: LogDrinkAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteDrinkOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteDrinkAction,
    dispatch?: SignalDispatch,
  ) => void;
  logScreenTimeOperation: (
    state: QuitJourneyGlobalState,
    action: LogScreenTimeAction,
    dispatch?: SignalDispatch,
  ) => void;
  logGamblingLossOperation: (
    state: QuitJourneyGlobalState,
    action: LogGamblingLossAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteGamblingLossOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteGamblingLossAction,
    dispatch?: SignalDispatch,
  ) => void;
}
