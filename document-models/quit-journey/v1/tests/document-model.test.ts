/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsQuitJourneyDocument,
  assertIsQuitJourneyState,
  initialGlobalState,
  initialLocalState,
  isQuitJourneyDocument,
  isQuitJourneyState,
  quitJourneyDocumentType,
  utils,
} from "document-models/quit-journey/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("QuitJourney Document Model", () => {
  it("should create a new QuitJourney document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(quitJourneyDocumentType);
  });

  it("should create a new QuitJourney document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isQuitJourneyDocument(document)).toBe(true);
    expect(isQuitJourneyState(document.state)).toBe(true);
  });
  it("should reject a document that is not a QuitJourney document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsQuitJourneyDocument(wrongDocumentType)).toThrow();
      expect(isQuitJourneyDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isQuitJourneyState(wrongState.state)).toBe(false);
    expect(assertIsQuitJourneyState(wrongState.state)).toThrow();
    expect(isQuitJourneyDocument(wrongState)).toBe(false);
    expect(assertIsQuitJourneyDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isQuitJourneyState(wrongInitialState.state)).toBe(false);
    expect(assertIsQuitJourneyState(wrongInitialState.state)).toThrow();
    expect(isQuitJourneyDocument(wrongInitialState)).toBe(false);
    expect(assertIsQuitJourneyDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isQuitJourneyDocument(missingIdInHeader)).toBe(false);
    expect(assertIsQuitJourneyDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isQuitJourneyDocument(missingNameInHeader)).toBe(false);
    expect(assertIsQuitJourneyDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isQuitJourneyDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsQuitJourneyDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isQuitJourneyDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsQuitJourneyDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
