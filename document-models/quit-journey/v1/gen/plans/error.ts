export type ErrorCode =
  | "InvalidIfThenPlanError"
  | "IfThenPlanNotFoundError"
  | "InvalidIfThenPlanUpdateError"
  | "IfThenPlanToReviewNotFoundError"
  | "IfThenPlanToDeleteNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidIfThenPlanError extends Error implements ReducerError {
  errorCode = "InvalidIfThenPlanError" as ErrorCode;
  constructor(message = "InvalidIfThenPlanError") {
    super(message);
  }
}

export class IfThenPlanNotFoundError extends Error implements ReducerError {
  errorCode = "IfThenPlanNotFoundError" as ErrorCode;
  constructor(message = "IfThenPlanNotFoundError") {
    super(message);
  }
}

export class InvalidIfThenPlanUpdateError
  extends Error
  implements ReducerError
{
  errorCode = "InvalidIfThenPlanUpdateError" as ErrorCode;
  constructor(message = "InvalidIfThenPlanUpdateError") {
    super(message);
  }
}

export class IfThenPlanToReviewNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "IfThenPlanToReviewNotFoundError" as ErrorCode;
  constructor(message = "IfThenPlanToReviewNotFoundError") {
    super(message);
  }
}

export class IfThenPlanToDeleteNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "IfThenPlanToDeleteNotFoundError" as ErrorCode;
  constructor(message = "IfThenPlanToDeleteNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddIfThenPlan: { InvalidIfThenPlanError },

  UpdateIfThenPlan: { IfThenPlanNotFoundError, InvalidIfThenPlanUpdateError },

  ReviewIfThenPlan: { IfThenPlanToReviewNotFoundError },

  DeleteIfThenPlan: { IfThenPlanToDeleteNotFoundError },
};
