export type ErrorCode =
  | "InvalidSlipUnitsError"
  | "SlipNotFoundError"
  | "NoActiveQuitPlanError"
  | "InvalidRestartDatesError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidSlipUnitsError extends Error implements ReducerError {
  errorCode = "InvalidSlipUnitsError" as ErrorCode;
  constructor(message = "InvalidSlipUnitsError") {
    super(message);
  }
}

export class SlipNotFoundError extends Error implements ReducerError {
  errorCode = "SlipNotFoundError" as ErrorCode;
  constructor(message = "SlipNotFoundError") {
    super(message);
  }
}

export class NoActiveQuitPlanError extends Error implements ReducerError {
  errorCode = "NoActiveQuitPlanError" as ErrorCode;
  constructor(message = "NoActiveQuitPlanError") {
    super(message);
  }
}

export class InvalidRestartDatesError extends Error implements ReducerError {
  errorCode = "InvalidRestartDatesError" as ErrorCode;
  constructor(message = "InvalidRestartDatesError") {
    super(message);
  }
}

export const errors = {
  LogSlip: { InvalidSlipUnitsError },

  DeleteSlip: { SlipNotFoundError },

  RestartJourney: { NoActiveQuitPlanError, InvalidRestartDatesError },
};
