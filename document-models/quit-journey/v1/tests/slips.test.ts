import { generateMock } from "document-model/mock";
import {
  deleteSlip,
  DeleteSlipInputSchema,
  isQuitJourneyDocument,
  logSlip,
  LogSlipInputSchema,
  reducer,
  restartJourney,
  RestartJourneyInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("SlipsOperations", () => {
  it("should handle logSlip operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogSlipInputSchema(), {
      timestamp: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, logSlip(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("LOG_SLIP");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteSlip operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteSlipInputSchema());

    const updatedDocument = reducer(document, deleteSlip(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_SLIP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle restartJourney operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RestartJourneyInputSchema(), {
      endedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, restartJourney(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RESTART_JOURNEY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
