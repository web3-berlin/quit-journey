import { generateMock } from "document-model/mock";
import {
  addRewardGoal,
  AddRewardGoalInputSchema,
  claimReward,
  ClaimRewardInputSchema,
  deleteRewardGoal,
  DeleteRewardGoalInputSchema,
  isQuitJourneyDocument,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("RewardsOperations", () => {
  it("should handle addRewardGoal operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRewardGoalInputSchema());

    const updatedDocument = reducer(document, addRewardGoal(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_REWARD_GOAL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle claimReward operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ClaimRewardInputSchema(), {
      claimedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, claimReward(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CLAIM_REWARD",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteRewardGoal operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteRewardGoalInputSchema());

    const updatedDocument = reducer(document, deleteRewardGoal(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_REWARD_GOAL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
