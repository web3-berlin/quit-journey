import { generateMock } from "document-model/mock";
import {
  addIfThenPlan,
  AddIfThenPlanInputSchema,
  deleteIfThenPlan,
  DeleteIfThenPlanInputSchema,
  isQuitJourneyDocument,
  reducer,
  reviewIfThenPlan,
  ReviewIfThenPlanInputSchema,
  updateIfThenPlan,
  UpdateIfThenPlanInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("PlansOperations", () => {
  it("should handle addIfThenPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddIfThenPlanInputSchema(), {
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, addIfThenPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_IF_THEN_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateIfThenPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateIfThenPlanInputSchema());

    const updatedDocument = reducer(document, updateIfThenPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_IF_THEN_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reviewIfThenPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReviewIfThenPlanInputSchema());

    const updatedDocument = reducer(document, reviewIfThenPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REVIEW_IF_THEN_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteIfThenPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteIfThenPlanInputSchema());

    const updatedDocument = reducer(document, deleteIfThenPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_IF_THEN_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
