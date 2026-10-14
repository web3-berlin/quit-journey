import { generateMock } from "document-model/mock";
import {
  addSupportContact,
  AddSupportContactInputSchema,
  isQuitJourneyDocument,
  reducer,
  removeSupportContact,
  RemoveSupportContactInputSchema,
  setQuitline,
  SetQuitlineInputSchema,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";

describe("SupportOperations", () => {
  it("should handle addSupportContact operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddSupportContactInputSchema());

    const updatedDocument = reducer(document, addSupportContact(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SUPPORT_CONTACT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeSupportContact operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveSupportContactInputSchema());

    const updatedDocument = reducer(document, removeSupportContact(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SUPPORT_CONTACT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setQuitline operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetQuitlineInputSchema());

    const updatedDocument = reducer(document, setQuitline(input));

    expect(isQuitJourneyDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_QUITLINE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
