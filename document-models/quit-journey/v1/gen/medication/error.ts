export type ErrorCode =
  | "MedicationAidNotFoundError"
  | "InvalidMedicationPlanError"
  | "MedicationPlanNotFoundError"
  | "TakeHomeAidNotFoundError"
  | "InvalidTakeHomeError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class MedicationAidNotFoundError extends Error implements ReducerError {
  errorCode = "MedicationAidNotFoundError" as ErrorCode;
  constructor(message = "MedicationAidNotFoundError") {
    super(message);
  }
}

export class InvalidMedicationPlanError extends Error implements ReducerError {
  errorCode = "InvalidMedicationPlanError" as ErrorCode;
  constructor(message = "InvalidMedicationPlanError") {
    super(message);
  }
}

export class MedicationPlanNotFoundError extends Error implements ReducerError {
  errorCode = "MedicationPlanNotFoundError" as ErrorCode;
  constructor(message = "MedicationPlanNotFoundError") {
    super(message);
  }
}

export class TakeHomeAidNotFoundError extends Error implements ReducerError {
  errorCode = "TakeHomeAidNotFoundError" as ErrorCode;
  constructor(message = "TakeHomeAidNotFoundError") {
    super(message);
  }
}

export class InvalidTakeHomeError extends Error implements ReducerError {
  errorCode = "InvalidTakeHomeError" as ErrorCode;
  constructor(message = "InvalidTakeHomeError") {
    super(message);
  }
}

export const errors = {
  SetMedicationPlan: { MedicationAidNotFoundError, InvalidMedicationPlanError },

  ClearMedicationPlan: { MedicationPlanNotFoundError },

  RecordTakeHome: { TakeHomeAidNotFoundError, InvalidTakeHomeError },
};
