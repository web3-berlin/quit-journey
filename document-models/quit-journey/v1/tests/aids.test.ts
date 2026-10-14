import { generateMock } from "document-model/mock";
import {
  addQuitAid,
  AddQuitAidInputSchema,
  endQuitAid,
  EndQuitAidInputSchema,
  isQuitJourneyDocument,
  logAidUse,
  LogAidUseInputSchema,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("AidsOperations", () => {
  it("should handle addQuitAid operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddQuitAidInputSchema(), {
      startedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, addQuitAid(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_QUIT_AID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle endQuitAid operation", () => {
    const document = utils.createDocument();
    const input = generateMock(EndQuitAidInputSchema(), {
      endedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, endQuitAid(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "END_QUIT_AID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle logAidUse operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogAidUseInputSchema(), {
      timestamp: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, logAidUse(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_AID_USE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
