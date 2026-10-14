/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddQuitAidInputSchema,
  EndQuitAidInputSchema,
  LogAidUseInputSchema,
} from "../schema/zod.js";
import type {
  AddQuitAidInput,
  EndQuitAidInput,
  LogAidUseInput,
} from "../types.js";
import type {
  AddQuitAidAction,
  EndQuitAidAction,
  LogAidUseAction,
} from "./actions.js";

export const addQuitAid = (input: AddQuitAidInput) =>
  createAction<AddQuitAidAction>(
    "ADD_QUIT_AID",
    { ...input },
    undefined,
    AddQuitAidInputSchema,
    "global",
  );

export const endQuitAid = (input: EndQuitAidInput) =>
  createAction<EndQuitAidAction>(
    "END_QUIT_AID",
    { ...input },
    undefined,
    EndQuitAidInputSchema,
    "global",
  );

export const logAidUse = (input: LogAidUseInput) =>
  createAction<LogAidUseAction>(
    "LOG_AID_USE",
    { ...input },
    undefined,
    LogAidUseInputSchema,
    "global",
  );
