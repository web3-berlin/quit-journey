/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  AddIfThenPlanAction,
  DeleteIfThenPlanAction,
  ReviewIfThenPlanAction,
  UpdateIfThenPlanAction,
} from "./actions.js";

export interface QuitJourneyPlansOperations {
  addIfThenPlanOperation: (
    state: QuitJourneyGlobalState,
    action: AddIfThenPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateIfThenPlanOperation: (
    state: QuitJourneyGlobalState,
    action: UpdateIfThenPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  reviewIfThenPlanOperation: (
    state: QuitJourneyGlobalState,
    action: ReviewIfThenPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteIfThenPlanOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteIfThenPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
}
