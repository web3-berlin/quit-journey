/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  AddQuitAidAction,
  EndQuitAidAction,
  LogAidUseAction,
} from "./actions.js";

export interface QuitJourneyAidsOperations {
  addQuitAidOperation: (
    state: QuitJourneyGlobalState,
    action: AddQuitAidAction,
    dispatch?: SignalDispatch,
  ) => void;
  endQuitAidOperation: (
    state: QuitJourneyGlobalState,
    action: EndQuitAidAction,
    dispatch?: SignalDispatch,
  ) => void;
  logAidUseOperation: (
    state: QuitJourneyGlobalState,
    action: LogAidUseAction,
    dispatch?: SignalDispatch,
  ) => void;
}
