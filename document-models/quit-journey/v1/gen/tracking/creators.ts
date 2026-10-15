/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  DeleteDrinkInputSchema,
  DeleteGamblingLossInputSchema,
  LogDrinkInputSchema,
  LogGamblingLossInputSchema,
  LogScreenTimeInputSchema,
} from "../schema/zod.js";
import type {
  DeleteDrinkInput,
  DeleteGamblingLossInput,
  LogDrinkInput,
  LogGamblingLossInput,
  LogScreenTimeInput,
} from "../types.js";
import type {
  DeleteDrinkAction,
  DeleteGamblingLossAction,
  LogDrinkAction,
  LogGamblingLossAction,
  LogScreenTimeAction,
} from "./actions.js";

export const logDrink = (input: LogDrinkInput) =>
  createAction<LogDrinkAction>(
    "LOG_DRINK",
    { ...input },
    undefined,
    LogDrinkInputSchema,
    "global",
  );

export const deleteDrink = (input: DeleteDrinkInput) =>
  createAction<DeleteDrinkAction>(
    "DELETE_DRINK",
    { ...input },
    undefined,
    DeleteDrinkInputSchema,
    "global",
  );

export const logScreenTime = (input: LogScreenTimeInput) =>
  createAction<LogScreenTimeAction>(
    "LOG_SCREEN_TIME",
    { ...input },
    undefined,
    LogScreenTimeInputSchema,
    "global",
  );

export const logGamblingLoss = (input: LogGamblingLossInput) =>
  createAction<LogGamblingLossAction>(
    "LOG_GAMBLING_LOSS",
    { ...input },
    undefined,
    LogGamblingLossInputSchema,
    "global",
  );

export const deleteGamblingLoss = (input: DeleteGamblingLossInput) =>
  createAction<DeleteGamblingLossAction>(
    "DELETE_GAMBLING_LOSS",
    { ...input },
    undefined,
    DeleteGamblingLossInputSchema,
    "global",
  );
