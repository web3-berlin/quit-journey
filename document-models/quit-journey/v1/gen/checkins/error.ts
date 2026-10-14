export type ErrorCode =
  | "DuplicateCheckinDateError"
  | "InvalidCheckinRatingError"
  | "InvalidWeightError"
  | "InvalidCheckinDateError"
  | "CheckinNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateCheckinDateError extends Error implements ReducerError {
  errorCode = "DuplicateCheckinDateError" as ErrorCode;
  constructor(message = "DuplicateCheckinDateError") {
    super(message);
  }
}

export class InvalidCheckinRatingError extends Error implements ReducerError {
  errorCode = "InvalidCheckinRatingError" as ErrorCode;
  constructor(message = "InvalidCheckinRatingError") {
    super(message);
  }
}

export class InvalidWeightError extends Error implements ReducerError {
  errorCode = "InvalidWeightError" as ErrorCode;
  constructor(message = "InvalidWeightError") {
    super(message);
  }
}

export class InvalidCheckinDateError extends Error implements ReducerError {
  errorCode = "InvalidCheckinDateError" as ErrorCode;
  constructor(message = "InvalidCheckinDateError") {
    super(message);
  }
}

export class CheckinNotFoundError extends Error implements ReducerError {
  errorCode = "CheckinNotFoundError" as ErrorCode;
  constructor(message = "CheckinNotFoundError") {
    super(message);
  }
}

export const errors = {
  DailyCheckIn: {
    DuplicateCheckinDateError,
    InvalidCheckinRatingError,
    InvalidWeightError,
    InvalidCheckinDateError,
  },

  DeleteCheckIn: { CheckinNotFoundError },
};
