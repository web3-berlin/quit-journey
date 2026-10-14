export type ErrorCode = "EmptyContactNameError" | "SupportContactNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class EmptyContactNameError extends Error implements ReducerError {
  errorCode = "EmptyContactNameError" as ErrorCode;
  constructor(message = "EmptyContactNameError") {
    super(message);
  }
}

export class SupportContactNotFoundError extends Error implements ReducerError {
  errorCode = "SupportContactNotFoundError" as ErrorCode;
  constructor(message = "SupportContactNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddSupportContact: { EmptyContactNameError },

  RemoveSupportContact: { SupportContactNotFoundError },
};
