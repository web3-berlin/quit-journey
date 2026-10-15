export type ErrorCode =
  | "InvalidDrinkError"
  | "DrinkNotFoundError"
  | "InvalidScreenTimeError"
  | "InvalidGamblingLossError"
  | "GamblingLossNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidDrinkError extends Error implements ReducerError {
  errorCode = "InvalidDrinkError" as ErrorCode;
  constructor(message = "InvalidDrinkError") {
    super(message);
  }
}

export class DrinkNotFoundError extends Error implements ReducerError {
  errorCode = "DrinkNotFoundError" as ErrorCode;
  constructor(message = "DrinkNotFoundError") {
    super(message);
  }
}

export class InvalidScreenTimeError extends Error implements ReducerError {
  errorCode = "InvalidScreenTimeError" as ErrorCode;
  constructor(message = "InvalidScreenTimeError") {
    super(message);
  }
}

export class InvalidGamblingLossError extends Error implements ReducerError {
  errorCode = "InvalidGamblingLossError" as ErrorCode;
  constructor(message = "InvalidGamblingLossError") {
    super(message);
  }
}

export class GamblingLossNotFoundError extends Error implements ReducerError {
  errorCode = "GamblingLossNotFoundError" as ErrorCode;
  constructor(message = "GamblingLossNotFoundError") {
    super(message);
  }
}

export const errors = {
  LogDrink: { InvalidDrinkError },

  DeleteDrink: { DrinkNotFoundError },

  LogScreenTime: { InvalidScreenTimeError },

  LogGamblingLoss: { InvalidGamblingLossError },

  DeleteGamblingLoss: { GamblingLossNotFoundError },
};
