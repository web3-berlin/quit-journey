/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddSupportContactInputSchema,
  RemoveSupportContactInputSchema,
  SetQuitlineInputSchema,
} from "../schema/zod.js";
import type {
  AddSupportContactInput,
  RemoveSupportContactInput,
  SetQuitlineInput,
} from "../types.js";
import type {
  AddSupportContactAction,
  RemoveSupportContactAction,
  SetQuitlineAction,
} from "./actions.js";

export const addSupportContact = (input: AddSupportContactInput) =>
  createAction<AddSupportContactAction>(
    "ADD_SUPPORT_CONTACT",
    { ...input },
    undefined,
    AddSupportContactInputSchema,
    "global",
  );

export const removeSupportContact = (input: RemoveSupportContactInput) =>
  createAction<RemoveSupportContactAction>(
    "REMOVE_SUPPORT_CONTACT",
    { ...input },
    undefined,
    RemoveSupportContactInputSchema,
    "global",
  );

export const setQuitline = (input: SetQuitlineInput) =>
  createAction<SetQuitlineAction>(
    "SET_QUITLINE",
    { ...input },
    undefined,
    SetQuitlineInputSchema,
    "global",
  );
