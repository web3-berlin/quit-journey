/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  QuitJourneyAction,
  QuitJourneyDocument,
} from "document-models/quit-journey/v1";
import {
  assertIsQuitJourneyDocument,
  isQuitJourneyDocument,
} from "./gen/document-schema.js";

/** Hook to get a QuitJourney document by its id */
export function useQuitJourneyDocumentById(
  documentId: string | null | undefined,
):
  | [QuitJourneyDocument, DocumentDispatch<QuitJourneyAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isQuitJourneyDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected QuitJourney document */
export function useSelectedQuitJourneyDocument(): [
  QuitJourneyDocument,
  DocumentDispatch<QuitJourneyAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsQuitJourneyDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all QuitJourney documents in the selected drive */
export function useQuitJourneyDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isQuitJourneyDocument);
}

/** Hook to get all QuitJourney documents in the selected folder */
export function useQuitJourneyDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isQuitJourneyDocument);
}
