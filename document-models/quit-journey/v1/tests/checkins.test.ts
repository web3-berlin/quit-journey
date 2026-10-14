import { generateMock } from "document-model/mock";
import {
  dailyCheckIn,
  DailyCheckInInputSchema,
  deleteCheckIn,
  DeleteCheckInInputSchema,
  isQuitJourneyDocument,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("CheckinsOperations", () => {
  it("should handle dailyCheckIn operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DailyCheckInInputSchema(), {
      date: "2024-01-01",
    });

    const updatedDocument = reducer(document, dailyCheckIn(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DAILY_CHECK_IN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteCheckIn operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteCheckInInputSchema());

    const updatedDocument = reducer(document, deleteCheckIn(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_CHECK_IN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
