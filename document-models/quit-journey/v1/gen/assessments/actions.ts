/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { DeleteAssessmentInput, RecordAssessmentInput } from "../types.js";

export type RecordAssessmentAction = Action & {
  type: "RECORD_ASSESSMENT";
  input: RecordAssessmentInput;
};
export type DeleteAssessmentAction = Action & {
  type: "DELETE_ASSESSMENT";
  input: DeleteAssessmentInput;
};

export type QuitJourneyAssessmentsAction =
  | RecordAssessmentAction
  | DeleteAssessmentAction;
