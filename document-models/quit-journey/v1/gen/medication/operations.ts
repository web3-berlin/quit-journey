/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  ClearMedicationPlanAction,
  RecordTakeHomeAction,
  SetMedicationPlanAction,
} from "./actions.js";

export interface QuitJourneyMedicationOperations {
  setMedicationPlanOperation: (
    state: QuitJourneyGlobalState,
    action: SetMedicationPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearMedicationPlanOperation: (
    state: QuitJourneyGlobalState,
    action: ClearMedicationPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordTakeHomeOperation: (
    state: QuitJourneyGlobalState,
    action: RecordTakeHomeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
