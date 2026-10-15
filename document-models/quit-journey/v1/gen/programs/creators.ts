/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  CompleteMissionInputSchema,
  EndProgramInputSchema,
  StartProgramInputSchema,
} from "../schema/zod.js";
import type {
  CompleteMissionInput,
  EndProgramInput,
  StartProgramInput,
} from "../types.js";
import type {
  CompleteMissionAction,
  EndProgramAction,
  StartProgramAction,
} from "./actions.js";

export const startProgram = (input: StartProgramInput) =>
  createAction<StartProgramAction>(
    "START_PROGRAM",
    { ...input },
    undefined,
    StartProgramInputSchema,
    "global",
  );

export const completeMission = (input: CompleteMissionInput) =>
  createAction<CompleteMissionAction>(
    "COMPLETE_MISSION",
    { ...input },
    undefined,
    CompleteMissionInputSchema,
    "global",
  );

export const endProgram = (input: EndProgramInput) =>
  createAction<EndProgramAction>(
    "END_PROGRAM",
    { ...input },
    undefined,
    EndProgramInputSchema,
    "global",
  );
