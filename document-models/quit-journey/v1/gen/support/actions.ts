/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddSupportContactInput,
  RemoveSupportContactInput,
  SetQuitlineInput,
} from "../types.js";

export type AddSupportContactAction = Action & {
  type: "ADD_SUPPORT_CONTACT";
  input: AddSupportContactInput;
};
export type RemoveSupportContactAction = Action & {
  type: "REMOVE_SUPPORT_CONTACT";
  input: RemoveSupportContactInput;
};
export type SetQuitlineAction = Action & {
  type: "SET_QUITLINE";
  input: SetQuitlineInput;
};

export type QuitJourneySupportAction =
  | AddSupportContactAction
  | RemoveSupportContactAction
  | SetQuitlineAction;
