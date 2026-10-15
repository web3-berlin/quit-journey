/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  CompleteMissionAction,
  EndProgramAction,
  StartProgramAction,
} from "./actions.js";

export interface QuitJourneyProgramsOperations {
  startProgramOperation: (
    state: QuitJourneyGlobalState,
    action: StartProgramAction,
    dispatch?: SignalDispatch,
  ) => void;
  completeMissionOperation: (
    state: QuitJourneyGlobalState,
    action: CompleteMissionAction,
    dispatch?: SignalDispatch,
  ) => void;
  endProgramOperation: (
    state: QuitJourneyGlobalState,
    action: EndProgramAction,
    dispatch?: SignalDispatch,
  ) => void;
}
