/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  AddSupportContactAction,
  RemoveSupportContactAction,
  SetQuitlineAction,
} from "./actions.js";

export interface QuitJourneySupportOperations {
  addSupportContactOperation: (
    state: QuitJourneyGlobalState,
    action: AddSupportContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSupportContactOperation: (
    state: QuitJourneyGlobalState,
    action: RemoveSupportContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  setQuitlineOperation: (
    state: QuitJourneyGlobalState,
    action: SetQuitlineAction,
    dispatch?: SignalDispatch,
  ) => void;
}
