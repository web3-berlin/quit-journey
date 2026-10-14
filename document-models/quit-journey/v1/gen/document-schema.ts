/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { quitJourneyDocumentType } from "./document-type.js";
import { QuitJourneyStateSchema } from "./schema/zod.js";
import type { QuitJourneyDocument, QuitJourneyPHState } from "./types.js";

/** Schema for validating the header object of a QuitJourney document */
export const QuitJourneyDocumentHeaderSchema = BaseDocumentHeaderSchema.extend({
  documentType: z.literal(quitJourneyDocumentType),
});

/** Schema for validating the state object of a QuitJourney document */
export const QuitJourneyPHStateSchema = BaseDocumentStateSchema.extend({
  global: QuitJourneyStateSchema(),
});

export const QuitJourneyDocumentSchema = z.object({
  header: QuitJourneyDocumentHeaderSchema,
  state: QuitJourneyPHStateSchema,
  initialState: QuitJourneyPHStateSchema,
});

/** Simple helper function to check if a state object is a QuitJourney document state object */
export function isQuitJourneyState(
  state: unknown,
): state is QuitJourneyPHState {
  return QuitJourneyPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a QuitJourney document state object */
export function assertIsQuitJourneyState(
  state: unknown,
): asserts state is QuitJourneyPHState {
  QuitJourneyPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a QuitJourney document */
export function isQuitJourneyDocument(
  document: unknown,
): document is QuitJourneyDocument {
  return QuitJourneyDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a QuitJourney document */
export function assertIsQuitJourneyDocument(
  document: unknown,
): asserts document is QuitJourneyDocument {
  QuitJourneyDocumentSchema.parse(document);
}
