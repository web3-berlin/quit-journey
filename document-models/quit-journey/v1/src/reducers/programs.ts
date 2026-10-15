import type { QuitJourneyProgramsOperations } from "document-models/quit-journey/v1";
import {
  ProgramAlreadyActiveError,
  ProgramAlreadyEndedError,
  ProgramNotActiveError,
  ProgramNotFoundError,
  ProgramToEndNotFoundError,
} from "../../gen/programs/error.js";

export const quitJourneyProgramsOperations: QuitJourneyProgramsOperations = {
  startProgramOperation(state, action) {
    const i = action.input;
    if (
      (state.programs ?? []).some((p) => p.program === i.program && !p.endedAt)
    ) {
      throw new ProgramAlreadyActiveError(`${i.program} is already running`);
    }
    (state.programs ??= []).push({
      id: i.id,
      program: i.program,
      startedAt: i.startedAt,
      completedMissions: [],
      endedAt: null,
    });
  },
  completeMissionOperation(state, action) {
    const program = (state.programs ?? []).find(
      (p) => p.id === action.input.programId,
    );
    if (!program) {
      throw new ProgramNotFoundError(
        `Program ${action.input.programId} not found`,
      );
    }
    if (program.endedAt) {
      throw new ProgramNotActiveError("The program has ended");
    }
    if (!program.completedMissions.includes(action.input.missionKey)) {
      program.completedMissions.push(action.input.missionKey);
    }
  },
  endProgramOperation(state, action) {
    const program = (state.programs ?? []).find(
      (p) => p.id === action.input.programId,
    );
    if (!program) {
      throw new ProgramToEndNotFoundError(
        `Program ${action.input.programId} not found`,
      );
    }
    if (program.endedAt) {
      throw new ProgramAlreadyEndedError("The program has already ended");
    }
    program.endedAt = action.input.endedAt;
  },
};
