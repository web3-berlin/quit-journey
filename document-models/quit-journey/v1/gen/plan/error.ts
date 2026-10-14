export type ErrorCode =
  | "InvalidQuitPlanError"
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
  SetQuitPlan: { InvalidQuitPlanError },

  AddMotivation: { EmptyMotivationError },

  RemoveMotivation: { MotivationNotFoundError },
};
