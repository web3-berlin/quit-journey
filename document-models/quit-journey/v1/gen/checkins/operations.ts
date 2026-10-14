/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type { DailyCheckInAction, DeleteCheckInAction } from "./actions.js";

export interface QuitJourneyCheckinsOperations {
  dailyCheckInOperation: (
    state: QuitJourneyGlobalState,
    action: DailyCheckInAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteCheckInOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteCheckInAction,
    dispatch?: SignalDispatch,
  ) => void;
}
