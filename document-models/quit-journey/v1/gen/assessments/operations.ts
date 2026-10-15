/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { QuitJourneyGlobalState } from "../types.js";
import type {
  DeleteAssessmentAction,
  RecordAssessmentAction,
} from "./actions.js";

export interface QuitJourneyAssessmentsOperations {
  recordAssessmentOperation: (
    state: QuitJourneyGlobalState,
    action: RecordAssessmentAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteAssessmentOperation: (
    state: QuitJourneyGlobalState,
    action: DeleteAssessmentAction,
    dispatch?: SignalDispatch,
  ) => void;
}
