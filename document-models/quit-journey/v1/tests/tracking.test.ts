import { generateMock } from "document-model/mock";
import {
  deleteDrink,
  DeleteDrinkInputSchema,
  deleteGamblingLoss,
  DeleteGamblingLossInputSchema,
  isQuitJourneyDocument,
  logDrink,
  LogDrinkInputSchema,
  logGamblingLoss,
  LogGamblingLossInputSchema,
  logScreenTime,
  LogScreenTimeInputSchema,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("TrackingOperations", () => {
  it("should handle logDrink operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogDrinkInputSchema(), {
      timestamp: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, logDrink(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("LOG_DRINK");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteDrink operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteDrinkInputSchema());

    const updatedDocument = reducer(document, deleteDrink(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_DRINK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle logScreenTime operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogScreenTimeInputSchema());

    const updatedDocument = reducer(document, logScreenTime(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_SCREEN_TIME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle logGamblingLoss operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogGamblingLossInputSchema());

    const updatedDocument = reducer(document, logGamblingLoss(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_GAMBLING_LOSS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteGamblingLoss operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteGamblingLossInputSchema());

    const updatedDocument = reducer(document, deleteGamblingLoss(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_GAMBLING_LOSS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
