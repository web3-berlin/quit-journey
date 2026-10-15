/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  CompleteMissionInput,
  EndProgramInput,
  StartProgramInput,
} from "../types.js";

export type StartProgramAction = Action & {
  type: "START_PROGRAM";
  input: StartProgramInput;
};
export type CompleteMissionAction = Action & {
  type: "COMPLETE_MISSION";
  input: CompleteMissionInput;
};
export type EndProgramAction = Action & {
  type: "END_PROGRAM";
  input: EndProgramInput;
};

export type QuitJourneyProgramsAction =
  | StartProgramAction
  | CompleteMissionAction
  | EndProgramAction;
