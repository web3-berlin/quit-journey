import { generateMock } from "document-model/mock";
import {
  clearMedicationPlan,
  ClearMedicationPlanInputSchema,
  isQuitJourneyDocument,
  recordTakeHome,
  RecordTakeHomeInputSchema,
  reducer,
  setMedicationPlan,
  SetMedicationPlanInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("MedicationOperations", () => {
  it("should handle setMedicationPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetMedicationPlanInputSchema());

    const updatedDocument = reducer(document, setMedicationPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_MEDICATION_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle clearMedicationPlan operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ClearMedicationPlanInputSchema());

    const updatedDocument = reducer(document, clearMedicationPlan(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CLEAR_MEDICATION_PLAN",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle recordTakeHome operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordTakeHomeInputSchema());

    const updatedDocument = reducer(document, recordTakeHome(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_TAKE_HOME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
