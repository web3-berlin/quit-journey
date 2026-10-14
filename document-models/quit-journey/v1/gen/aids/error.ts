export type ErrorCode = "QuitAidNotFoundError" | "AidForUseNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class QuitAidNotFoundError extends Error implements ReducerError {
  errorCode = "QuitAidNotFoundError" as ErrorCode;
  constructor(message = "QuitAidNotFoundError") {
    super(message);
  }
}

export class AidForUseNotFoundError extends Error implements ReducerError {
  errorCode = "AidForUseNotFoundError" as ErrorCode;
  constructor(message = "AidForUseNotFoundError") {
    super(message);
  }
}

export const errors = {
  EndQuitAid: { QuitAidNotFoundError },

  LogAidUse: { AidForUseNotFoundError },
};
