/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ClearMedicationPlanInput,
  RecordTakeHomeInput,
  SetMedicationPlanInput,
} from "../types.js";

export type SetMedicationPlanAction = Action & {
  type: "SET_MEDICATION_PLAN";
  input: SetMedicationPlanInput;
};
export type ClearMedicationPlanAction = Action & {
  type: "CLEAR_MEDICATION_PLAN";
  input: ClearMedicationPlanInput;
};
export type RecordTakeHomeAction = Action & {
  type: "RECORD_TAKE_HOME";
  input: RecordTakeHomeInput;
};

export type QuitJourneyMedicationAction =
  | SetMedicationPlanAction
  | ClearMedicationPlanAction
  | RecordTakeHomeAction;
