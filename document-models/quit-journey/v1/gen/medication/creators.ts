/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ClearMedicationPlanInputSchema,
  RecordTakeHomeInputSchema,
  SetMedicationPlanInputSchema,
} from "../schema/zod.js";
import type {
  ClearMedicationPlanInput,
  RecordTakeHomeInput,
  SetMedicationPlanInput,
} from "../types.js";
import type {
  ClearMedicationPlanAction,
  RecordTakeHomeAction,
  SetMedicationPlanAction,
} from "./actions.js";

export const setMedicationPlan = (input: SetMedicationPlanInput) =>
  createAction<SetMedicationPlanAction>(
    "SET_MEDICATION_PLAN",
    { ...input },
    undefined,
    SetMedicationPlanInputSchema,
    "global",
  );

export const clearMedicationPlan = (input: ClearMedicationPlanInput) =>
  createAction<ClearMedicationPlanAction>(
    "CLEAR_MEDICATION_PLAN",
    { ...input },
    undefined,
    ClearMedicationPlanInputSchema,
    "global",
  );

export const recordTakeHome = (input: RecordTakeHomeInput) =>
  createAction<RecordTakeHomeAction>(
    "RECORD_TAKE_HOME",
    { ...input },
    undefined,
    RecordTakeHomeInputSchema,
    "global",
  );
