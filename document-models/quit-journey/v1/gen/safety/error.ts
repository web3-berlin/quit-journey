export type ErrorCode =
  | "InvalidNaloxoneExpiryError"
  | "NaloxoneKitNotFoundError"
  | "NaloxoneKitToRemoveNotFoundError"
  | "DrugCheckNotFoundError"
  | "InvalidExclusionError"
  | "ExclusionNotFoundError"
  | "InvalidSafetyDurationError"
  | "SafetyCheckAlreadyActiveError"
  | "SafetyCheckNotFoundError"
  | "InvalidSafetyCheckEndError"
  | "InvalidRiskyPlaceError"
  | "RiskyPlaceNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidNaloxoneExpiryError extends Error implements ReducerError {
  errorCode = "InvalidNaloxoneExpiryError" as ErrorCode;
  constructor(message = "InvalidNaloxoneExpiryError") {
    super(message);
  }
}

export class NaloxoneKitNotFoundError extends Error implements ReducerError {
  errorCode = "NaloxoneKitNotFoundError" as ErrorCode;
  constructor(message = "NaloxoneKitNotFoundError") {
    super(message);
  }
}

export class NaloxoneKitToRemoveNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "NaloxoneKitToRemoveNotFoundError" as ErrorCode;
  constructor(message = "NaloxoneKitToRemoveNotFoundError") {
    super(message);
  }
}

export class DrugCheckNotFoundError extends Error implements ReducerError {
  errorCode = "DrugCheckNotFoundError" as ErrorCode;
  constructor(message = "DrugCheckNotFoundError") {
    super(message);
  }
}

export class InvalidExclusionError extends Error implements ReducerError {
  errorCode = "InvalidExclusionError" as ErrorCode;
  constructor(message = "InvalidExclusionError") {
    super(message);
  }
}

export class ExclusionNotFoundError extends Error implements ReducerError {
  errorCode = "ExclusionNotFoundError" as ErrorCode;
  constructor(message = "ExclusionNotFoundError") {
    super(message);
  }
}

export class InvalidSafetyDurationError extends Error implements ReducerError {
  errorCode = "InvalidSafetyDurationError" as ErrorCode;
  constructor(message = "InvalidSafetyDurationError") {
    super(message);
  }
}

export class SafetyCheckAlreadyActiveError
  extends Error
  implements ReducerError
{
  errorCode = "SafetyCheckAlreadyActiveError" as ErrorCode;
  constructor(message = "SafetyCheckAlreadyActiveError") {
    super(message);
  }
}

export class SafetyCheckNotFoundError extends Error implements ReducerError {
  errorCode = "SafetyCheckNotFoundError" as ErrorCode;
  constructor(message = "SafetyCheckNotFoundError") {
    super(message);
  }
}

export class InvalidSafetyCheckEndError extends Error implements ReducerError {
  errorCode = "InvalidSafetyCheckEndError" as ErrorCode;
  constructor(message = "InvalidSafetyCheckEndError") {
    super(message);
  }
}

export class InvalidRiskyPlaceError extends Error implements ReducerError {
  errorCode = "InvalidRiskyPlaceError" as ErrorCode;
  constructor(message = "InvalidRiskyPlaceError") {
    super(message);
  }
}

export class RiskyPlaceNotFoundError extends Error implements ReducerError {
  errorCode = "RiskyPlaceNotFoundError" as ErrorCode;
  constructor(message = "RiskyPlaceNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddNaloxoneKit: { InvalidNaloxoneExpiryError },

  MarkNaloxoneUsed: { NaloxoneKitNotFoundError },

  RemoveNaloxoneKit: { NaloxoneKitToRemoveNotFoundError },

  DeleteDrugCheck: { DrugCheckNotFoundError },

  AddExclusion: { InvalidExclusionError },

  DeleteExclusion: { ExclusionNotFoundError },

  StartSafetyCheck: {
    InvalidSafetyDurationError,
    SafetyCheckAlreadyActiveError,
  },

  EndSafetyCheck: { SafetyCheckNotFoundError, InvalidSafetyCheckEndError },

  AddRiskyPlace: { InvalidRiskyPlaceError },

  DeleteRiskyPlace: { RiskyPlaceNotFoundError },
};
