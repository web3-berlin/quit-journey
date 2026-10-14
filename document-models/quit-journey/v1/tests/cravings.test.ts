import { generateMock } from "document-model/mock";
import {
  deleteCraving,
  DeleteCravingInputSchema,
  isQuitJourneyDocument,
  logCraving,
  LogCravingInputSchema,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("CravingsOperations", () => {
  it("should handle logCraving operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogCravingInputSchema(), {
      timestamp: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, logCraving(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_CRAVING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteCraving operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteCravingInputSchema());

    const updatedDocument = reducer(document, deleteCraving(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_CRAVING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
