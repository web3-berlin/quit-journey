/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  DailyCheckInInputSchema,
  DeleteCheckInInputSchema,
} from "../schema/zod.js";
import type { DailyCheckInInput, DeleteCheckInInput } from "../types.js";
import type { DailyCheckInAction, DeleteCheckInAction } from "./actions.js";

export const dailyCheckIn = (input: DailyCheckInInput) =>
  createAction<DailyCheckInAction>(
    "DAILY_CHECK_IN",
    { ...input },
    undefined,
    DailyCheckInInputSchema,
    "global",
  );

export const deleteCheckIn = (input: DeleteCheckInInput) =>
  createAction<DeleteCheckInAction>(
    "DELETE_CHECK_IN",
    { ...input },
    undefined,
    DeleteCheckInInputSchema,
    "global",
  );
