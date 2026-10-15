/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type {
  QuitJourneyGlobalState,
  QuitJourneyLocalState,
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

export interface QuitJourneySafetyOperations {
  addNaloxoneKitOperation: (
    state: QuitJourneyGlobalState,
    action: AddNaloxoneKitAction,
    dispatch?: SignalDispatch,
  ) => void;
  markNaloxoneUsedOperation: (
    state: QuitJourneyGlobalState,
    action: MarkNaloxoneUsedAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeNaloxoneKitOperation: (
    state: QuitJourneyGlobalState,
    action: RemoveNaloxoneKitAction,
    dispatch?: SignalDispatch,
  ) => void;
  logDrugCheckOperation: (
    state: QuitJourneyGlobalState,
    action: LogDrugCheckAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteDrugCheckOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteDrugCheckAction,
    dispatch?: SignalDispatch,
  ) => void;
  addExclusionOperation: (
    state: QuitJourneyGlobalState,
    action: AddExclusionAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteExclusionOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteExclusionAction,
    dispatch?: SignalDispatch,
  ) => void;
  startSafetyCheckOperation: (
    state: QuitJourneyLocalState,
    action: StartSafetyCheckAction,
    dispatch?: SignalDispatch,
  ) => void;
  endSafetyCheckOperation: (
    state: QuitJourneyLocalState,
    action: EndSafetyCheckAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRiskyPlaceOperation: (
    state: QuitJourneyLocalState,
    action: AddRiskyPlaceAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteRiskyPlaceOperation: (
    state: QuitJourneyLocalState,
    action: DeleteRiskyPlaceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
