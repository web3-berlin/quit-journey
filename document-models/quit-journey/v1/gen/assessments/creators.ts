/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  DeleteAssessmentInputSchema,
  RecordAssessmentInputSchema,
} from "../schema/zod.js";
import type { DeleteAssessmentInput, RecordAssessmentInput } from "../types.js";
import type {
  DeleteAssessmentAction,
  RecordAssessmentAction,
} from "./actions.js";

export const recordAssessment = (input: RecordAssessmentInput) =>
  createAction<RecordAssessmentAction>(
    "RECORD_ASSESSMENT",
    { ...input },
    undefined,
    RecordAssessmentInputSchema,
    "global",
  );

export const deleteAssessment = (input: DeleteAssessmentInput) =>
  createAction<DeleteAssessmentAction>(
    "DELETE_ASSESSMENT",
    { ...input },
    undefined,
    DeleteAssessmentInputSchema,
    "global",
  );
