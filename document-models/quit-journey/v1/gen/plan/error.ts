export type ErrorCode =
  | "InvalidQuitPlanError"
  | "InvalidReductionGoalError"
  | "EmptyMotivationError"
  | "MotivationNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidQuitPlanError extends Error implements ReducerError {
  errorCode = "InvalidQuitPlanError" as ErrorCode;
  constructor(message = "InvalidQuitPlanError") {
    super(message);
  }
}

export class InvalidReductionGoalError extends Error implements ReducerError {
  errorCode = "InvalidReductionGoalError" as ErrorCode;
  constructor(message = "InvalidReductionGoalError") {
    super(message);
  }
}

export class EmptyMotivationError extends Error implements ReducerError {
  errorCode = "EmptyMotivationError" as ErrorCode;
  constructor(message = "EmptyMotivationError") {
    super(message);
  }
}

export class MotivationNotFoundError extends Error implements ReducerError {
  errorCode = "MotivationNotFoundError" as ErrorCode;
  constructor(message = "MotivationNotFoundError") {
    super(message);
  }
}

export const errors = {
  SetQuitPlan: { InvalidQuitPlanError, InvalidReductionGoalError },

  AddMotivation: { EmptyMotivationError },

  RemoveMotivation: { MotivationNotFoundError },
};
