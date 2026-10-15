/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddExclusionInputSchema,
  AddNaloxoneKitInputSchema,
  AddRiskyPlaceInputSchema,
  DeleteDrugCheckInputSchema,
  DeleteExclusionInputSchema,
  DeleteRiskyPlaceInputSchema,
  EndSafetyCheckInputSchema,
  LogDrugCheckInputSchema,
  MarkNaloxoneUsedInputSchema,
  RemoveNaloxoneKitInputSchema,
  StartSafetyCheckInputSchema,
} from "../schema/zod.js";
import type {
  AddExclusionInput,
  AddNaloxoneKitInput,
  AddRiskyPlaceInput,
  DeleteDrugCheckInput,
  DeleteExclusionInput,
  DeleteRiskyPlaceInput,
  EndSafetyCheckInput,
  LogDrugCheckInput,
  MarkNaloxoneUsedInput,
  RemoveNaloxoneKitInput,
  StartSafetyCheckInput,
} from "../types.js";
import type {
  AddExclusionAction,
  AddNaloxoneKitAction,
  AddRiskyPlaceAction,
  DeleteDrugCheckAction,
  DeleteExclusionAction,
  DeleteRiskyPlaceAction,
  EndSafetyCheckAction,
  LogDrugCheckAction,
  MarkNaloxoneUsedAction,
  RemoveNaloxoneKitAction,
  StartSafetyCheckAction,
} from "./actions.js";

export const addNaloxoneKit = (input: AddNaloxoneKitInput) =>
  createAction<AddNaloxoneKitAction>(
    "ADD_NALOXONE_KIT",
    { ...input },
    undefined,
    AddNaloxoneKitInputSchema,
    "global",
  );

export const markNaloxoneUsed = (input: MarkNaloxoneUsedInput) =>
  createAction<MarkNaloxoneUsedAction>(
    "MARK_NALOXONE_USED",
    { ...input },
    undefined,
    MarkNaloxoneUsedInputSchema,
    "global",
  );

export const removeNaloxoneKit = (input: RemoveNaloxoneKitInput) =>
  createAction<RemoveNaloxoneKitAction>(
    "REMOVE_NALOXONE_KIT",
    { ...input },
    undefined,
    RemoveNaloxoneKitInputSchema,
    "global",
  );

export const logDrugCheck = (input: LogDrugCheckInput) =>
  createAction<LogDrugCheckAction>(
    "LOG_DRUG_CHECK",
    { ...input },
    undefined,
    LogDrugCheckInputSchema,
    "global",
  );

export const deleteDrugCheck = (input: DeleteDrugCheckInput) =>
  createAction<DeleteDrugCheckAction>(
    "DELETE_DRUG_CHECK",
    { ...input },
    undefined,
    DeleteDrugCheckInputSchema,
    "global",
  );

export const addExclusion = (input: AddExclusionInput) =>
  createAction<AddExclusionAction>(
    "ADD_EXCLUSION",
    { ...input },
    undefined,
    AddExclusionInputSchema,
    "global",
  );

export const deleteExclusion = (input: DeleteExclusionInput) =>
  createAction<DeleteExclusionAction>(
    "DELETE_EXCLUSION",
    { ...input },
    undefined,
    DeleteExclusionInputSchema,
    "global",
  );

export const startSafetyCheck = (input: StartSafetyCheckInput) =>
  createAction<StartSafetyCheckAction>(
    "START_SAFETY_CHECK",
    { ...input },
    undefined,
    StartSafetyCheckInputSchema,
    "local",
  );

export const endSafetyCheck = (input: EndSafetyCheckInput) =>
  createAction<EndSafetyCheckAction>(
    "END_SAFETY_CHECK",
    { ...input },
    undefined,
    EndSafetyCheckInputSchema,
    "local",
  );

export const addRiskyPlace = (input: AddRiskyPlaceInput) =>
  createAction<AddRiskyPlaceAction>(
    "ADD_RISKY_PLACE",
    { ...input },
    undefined,
    AddRiskyPlaceInputSchema,
    "local",
  );

export const deleteRiskyPlace = (input: DeleteRiskyPlaceInput) =>
  createAction<DeleteRiskyPlaceAction>(
    "DELETE_RISKY_PLACE",
    { ...input },
    undefined,
    DeleteRiskyPlaceInputSchema,
    "local",
  );
