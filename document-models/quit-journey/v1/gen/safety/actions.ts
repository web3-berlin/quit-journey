/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
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

export type AddNaloxoneKitAction = Action & {
  type: "ADD_NALOXONE_KIT";
  input: AddNaloxoneKitInput;
};
export type MarkNaloxoneUsedAction = Action & {
  type: "MARK_NALOXONE_USED";
  input: MarkNaloxoneUsedInput;
};
export type RemoveNaloxoneKitAction = Action & {
  type: "REMOVE_NALOXONE_KIT";
  input: RemoveNaloxoneKitInput;
};
export type LogDrugCheckAction = Action & {
  type: "LOG_DRUG_CHECK";
  input: LogDrugCheckInput;
};
export type DeleteDrugCheckAction = Action & {
  type: "DELETE_DRUG_CHECK";
  input: DeleteDrugCheckInput;
};
export type AddExclusionAction = Action & {
  type: "ADD_EXCLUSION";
  input: AddExclusionInput;
};
export type DeleteExclusionAction = Action & {
  type: "DELETE_EXCLUSION";
  input: DeleteExclusionInput;
};
export type StartSafetyCheckAction = Action & {
  type: "START_SAFETY_CHECK";
  input: StartSafetyCheckInput;
};
export type EndSafetyCheckAction = Action & {
  type: "END_SAFETY_CHECK";
  input: EndSafetyCheckInput;
};
export type AddRiskyPlaceAction = Action & {
  type: "ADD_RISKY_PLACE";
  input: AddRiskyPlaceInput;
};
export type DeleteRiskyPlaceAction = Action & {
  type: "DELETE_RISKY_PLACE";
  input: DeleteRiskyPlaceInput;
};

export type QuitJourneySafetyAction =
  | AddNaloxoneKitAction
  | MarkNaloxoneUsedAction
  | RemoveNaloxoneKitAction
  | LogDrugCheckAction
  | DeleteDrugCheckAction
  | AddExclusionAction
  | DeleteExclusionAction
  | StartSafetyCheckAction
  | EndSafetyCheckAction
  | AddRiskyPlaceAction
  | DeleteRiskyPlaceAction;
