export type ErrorCode =
  | "InvalidRewardGoalError"
  | "RewardNotFoundError"
  | "RewardAlreadyClaimedError"
  | "InsufficientSavingsError"
  | "RewardGoalToDeleteNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidRewardGoalError extends Error implements ReducerError {
  errorCode = "InvalidRewardGoalError" as ErrorCode;
  constructor(message = "InvalidRewardGoalError") {
    super(message);
  }
}

export class RewardNotFoundError extends Error implements ReducerError {
  errorCode = "RewardNotFoundError" as ErrorCode;
  constructor(message = "RewardNotFoundError") {
    super(message);
  }
}

export class RewardAlreadyClaimedError extends Error implements ReducerError {
  errorCode = "RewardAlreadyClaimedError" as ErrorCode;
  constructor(message = "RewardAlreadyClaimedError") {
    super(message);
  }
}

export class InsufficientSavingsError extends Error implements ReducerError {
  errorCode = "InsufficientSavingsError" as ErrorCode;
  constructor(message = "InsufficientSavingsError") {
    super(message);
  }
}

export class RewardGoalToDeleteNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RewardGoalToDeleteNotFoundError" as ErrorCode;
  constructor(message = "RewardGoalToDeleteNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddRewardGoal: { InvalidRewardGoalError },

  ClaimReward: {
    RewardNotFoundError,
    RewardAlreadyClaimedError,
    InsufficientSavingsError,
  },

  DeleteRewardGoal: { RewardGoalToDeleteNotFoundError },
};
