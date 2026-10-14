/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  DeleteSlipAction,
  LogSlipAction,
  RestartJourneyAction,
} from "./actions.js";

export interface QuitJourneySlipsOperations {
  logSlipOperation: (
    state: QuitJourneyGlobalState,
    action: LogSlipAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteSlipOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteSlipAction,
    dispatch?: SignalDispatch,
  ) => void;
  restartJourneyOperation: (
    state: QuitJourneyGlobalState,
    action: RestartJourneyAction,
    dispatch?: SignalDispatch,
  ) => void;
}
