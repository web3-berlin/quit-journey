export type ErrorCode =
  | "ProgramAlreadyActiveError"
  | "ProgramNotFoundError"
  | "ProgramNotActiveError"
  | "ProgramToEndNotFoundError"
  | "ProgramAlreadyEndedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProgramAlreadyActiveError extends Error implements ReducerError {
  errorCode = "ProgramAlreadyActiveError" as ErrorCode;
  constructor(message = "ProgramAlreadyActiveError") {
    super(message);
  }
}

export class ProgramNotFoundError extends Error implements ReducerError {
  errorCode = "ProgramNotFoundError" as ErrorCode;
  constructor(message = "ProgramNotFoundError") {
    super(message);
  }
}

export class ProgramNotActiveError extends Error implements ReducerError {
  errorCode = "ProgramNotActiveError" as ErrorCode;
  constructor(message = "ProgramNotActiveError") {
    super(message);
  }
}

export class ProgramToEndNotFoundError extends Error implements ReducerError {
  errorCode = "ProgramToEndNotFoundError" as ErrorCode;
  constructor(message = "ProgramToEndNotFoundError") {
    super(message);
  }
}

export class ProgramAlreadyEndedError extends Error implements ReducerError {
  errorCode = "ProgramAlreadyEndedError" as ErrorCode;
  constructor(message = "ProgramAlreadyEndedError") {
    super(message);
  }
}

export const errors = {
  StartProgram: { ProgramAlreadyActiveError },

  CompleteMission: { ProgramNotFoundError, ProgramNotActiveError },

  EndProgram: { ProgramToEndNotFoundError, ProgramAlreadyEndedError },
};
