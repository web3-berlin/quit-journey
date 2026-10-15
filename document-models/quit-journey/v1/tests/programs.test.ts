import { generateMock } from "document-model/mock";
import {
  completeMission,
  CompleteMissionInputSchema,
  endProgram,
  EndProgramInputSchema,
  isQuitJourneyDocument,
  reducer,
  startProgram,
  StartProgramInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("ProgramsOperations", () => {
  it("should handle startProgram operation", () => {
    const document = utils.createDocument();
    const input = generateMock(StartProgramInputSchema(), {
      startedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, startProgram(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "START_PROGRAM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle completeMission operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CompleteMissionInputSchema());

    const updatedDocument = reducer(document, completeMission(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "COMPLETE_MISSION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle endProgram operation", () => {
    const document = utils.createDocument();
    const input = generateMock(EndProgramInputSchema(), {
      endedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, endProgram(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "END_PROGRAM",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
