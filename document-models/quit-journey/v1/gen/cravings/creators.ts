/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  DeleteCravingInputSchema,
  LogCravingInputSchema,
} from "../schema/zod.js";
import type { DeleteCravingInput, LogCravingInput } from "../types.js";
import type { DeleteCravingAction, LogCravingAction } from "./actions.js";

export const logCraving = (input: LogCravingInput) =>
  createAction<LogCravingAction>(
    "LOG_CRAVING",
    { ...input },
    undefined,
    LogCravingInputSchema,
    "global",
  );

export const deleteCraving = (input: DeleteCravingInput) =>
  createAction<DeleteCravingAction>(
    "DELETE_CRAVING",
    { ...input },
    undefined,
    DeleteCravingInputSchema,
    "global",
  );
