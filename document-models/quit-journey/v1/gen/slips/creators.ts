/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  DeleteSlipInputSchema,
  LogSlipInputSchema,
  RestartJourneyInputSchema,
} from "../schema/zod.js";
import type {
  DeleteSlipInput,
  LogSlipInput,
  RestartJourneyInput,
} from "../types.js";
import type {
  DeleteSlipAction,
  LogSlipAction,
  RestartJourneyAction,
} from "./actions.js";

export const logSlip = (input: LogSlipInput) =>
  createAction<LogSlipAction>(
    "LOG_SLIP",
    { ...input },
    undefined,
    LogSlipInputSchema,
    "global",
  );

export const deleteSlip = (input: DeleteSlipInput) =>
  createAction<DeleteSlipAction>(
    "DELETE_SLIP",
    { ...input },
    undefined,
    DeleteSlipInputSchema,
    "global",
  );

export const restartJourney = (input: RestartJourneyInput) =>
  createAction<RestartJourneyAction>(
    "RESTART_JOURNEY",
    { ...input },
    undefined,
    RestartJourneyInputSchema,
    "global",
  );
