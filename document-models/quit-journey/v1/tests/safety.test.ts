import { generateMock } from "document-model/mock";
import {
  addExclusion,
  AddExclusionInputSchema,
  addNaloxoneKit,
  AddNaloxoneKitInputSchema,
  addRiskyPlace,
  AddRiskyPlaceInputSchema,
  deleteDrugCheck,
  DeleteDrugCheckInputSchema,
  deleteExclusion,
  DeleteExclusionInputSchema,
  deleteRiskyPlace,
  DeleteRiskyPlaceInputSchema,
  endSafetyCheck,
  EndSafetyCheckInputSchema,
  isQuitJourneyDocument,
  logDrugCheck,
  LogDrugCheckInputSchema,
  markNaloxoneUsed,
  MarkNaloxoneUsedInputSchema,
  reducer,
  removeNaloxoneKit,
  RemoveNaloxoneKitInputSchema,
  startSafetyCheck,
  StartSafetyCheckInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("SafetyOperations", () => {
  it("should handle addNaloxoneKit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddNaloxoneKitInputSchema(), {
      addedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, addNaloxoneKit(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_NALOXONE_KIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markNaloxoneUsed operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkNaloxoneUsedInputSchema(), {
      usedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, markNaloxoneUsed(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_NALOXONE_USED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeNaloxoneKit operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveNaloxoneKitInputSchema());

    const updatedDocument = reducer(document, removeNaloxoneKit(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_NALOXONE_KIT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle logDrugCheck operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogDrugCheckInputSchema(), {
      checkedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, logDrugCheck(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_DRUG_CHECK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteDrugCheck operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteDrugCheckInputSchema());

    const updatedDocument = reducer(document, deleteDrugCheck(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_DRUG_CHECK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addExclusion operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddExclusionInputSchema());

    const updatedDocument = reducer(document, addExclusion(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_EXCLUSION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteExclusion operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteExclusionInputSchema());

    const updatedDocument = reducer(document, deleteExclusion(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_EXCLUSION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle startSafetyCheck operation", () => {
    const document = utils.createDocument();
    const input = generateMock(StartSafetyCheckInputSchema(), {
      startedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, startSafetyCheck(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.local).toHaveLength(1);
    expect(updatedDocument.operations.local[0].action.type).toBe(
      "START_SAFETY_CHECK",
    );
    expect(updatedDocument.operations.local[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.local[0].index).toEqual(0);
  });

  it("should handle endSafetyCheck operation", () => {
    const document = utils.createDocument();
    const input = generateMock(EndSafetyCheckInputSchema(), {
      endedAt: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, endSafetyCheck(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.local).toHaveLength(1);
    expect(updatedDocument.operations.local[0].action.type).toBe(
      "END_SAFETY_CHECK",
    );
    expect(updatedDocument.operations.local[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.local[0].index).toEqual(0);
  });

  it("should handle addRiskyPlace operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRiskyPlaceInputSchema());

    const updatedDocument = reducer(document, addRiskyPlace(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.local).toHaveLength(1);
    expect(updatedDocument.operations.local[0].action.type).toBe(
      "ADD_RISKY_PLACE",
    );
    expect(updatedDocument.operations.local[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.local[0].index).toEqual(0);
  });

  it("should handle deleteRiskyPlace operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteRiskyPlaceInputSchema());

    const updatedDocument = reducer(document, deleteRiskyPlace(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.local).toHaveLength(1);
    expect(updatedDocument.operations.local[0].action.type).toBe(
      "DELETE_RISKY_PLACE",
    );
    expect(updatedDocument.operations.local[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.local[0].index).toEqual(0);
  });
});
