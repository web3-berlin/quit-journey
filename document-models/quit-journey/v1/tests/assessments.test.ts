import { generateMock } from "document-model/mock";
import {
  deleteAssessment,
  DeleteAssessmentInputSchema,
  isQuitJourneyDocument,
  recordAssessment,
  RecordAssessmentInputSchema,
  reducer,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("AssessmentsOperations", () => {
  it("should handle recordAssessment operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordAssessmentInputSchema(), {
      takenAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, recordAssessment(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_ASSESSMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteAssessment operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteAssessmentInputSchema());

    const updatedDocument = reducer(document, deleteAssessment(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_ASSESSMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
