export type ErrorCode =
  | "InvalidCravingIntensityError"
  | "InvalidCravingDurationError"
  | "CravingNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidCravingIntensityError
  extends Error
  implements ReducerError
{
  errorCode = "InvalidCravingIntensityError" as ErrorCode;
  constructor(message = "InvalidCravingIntensityError") {
    super(message);
  }
}

export class InvalidCravingDurationError extends Error implements ReducerError {
  errorCode = "InvalidCravingDurationError" as ErrorCode;
  constructor(message = "InvalidCravingDurationError") {
    super(message);
  }
}

export class CravingNotFoundError extends Error implements ReducerError {
  errorCode = "CravingNotFoundError" as ErrorCode;
  constructor(message = "CravingNotFoundError") {
    super(message);
  }
}

export const errors = {
  LogCraving: { InvalidCravingIntensityError, InvalidCravingDurationError },

  DeleteCraving: { CravingNotFoundError },
};
