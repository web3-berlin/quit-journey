export type ErrorCode =
  | "InvalidAssessmentAnswersError"
  | "AssessmentNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidAssessmentAnswersError
  extends Error
  implements ReducerError
{
  errorCode = "InvalidAssessmentAnswersError" as ErrorCode;
  constructor(message = "InvalidAssessmentAnswersError") {
    super(message);
  }
}

export class AssessmentNotFoundError extends Error implements ReducerError {
  errorCode = "AssessmentNotFoundError" as ErrorCode;
  constructor(message = "AssessmentNotFoundError") {
    super(message);
  }
}

export const errors = {
  RecordAssessment: { InvalidAssessmentAnswersError },

  DeleteAssessment: { AssessmentNotFoundError },
};
