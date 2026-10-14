/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  AddMotivationAction,
  RemoveMotivationAction,
  SetDisplayNameAction,
  SetQuitPlanAction,
  TogglePrepTaskAction,
} from "./actions.js";

export interface QuitJourneyPlanOperations {
  setQuitPlanOperation: (
    state: QuitJourneyGlobalState,
    action: SetQuitPlanAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDisplayNameOperation: (
    state: QuitJourneyGlobalState,
    action: SetDisplayNameAction,
    dispatch?: SignalDispatch,
  ) => void;
  addMotivationOperation: (
    state: QuitJourneyGlobalState,
    action: AddMotivationAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeMotivationOperation: (
    state: QuitJourneyGlobalState,
    action: RemoveMotivationAction,
    dispatch?: SignalDispatch,
  ) => void;
  togglePrepTaskOperation: (
    state: QuitJourneyGlobalState,
    action: TogglePrepTaskAction,
    dispatch?: SignalDispatch,
  ) => void;
}
