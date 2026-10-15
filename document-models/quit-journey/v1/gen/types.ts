/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { QuitJourneyAction } from "./actions.js";
import type {
  QuitJourneyState as QuitJourneyGlobalState,
  QuitJourneyLocalState,
} from "./schema/types.js";

type QuitJourneyPHState = PHBaseState & {
  global: QuitJourneyGlobalState;
  local: QuitJourneyLocalState;
};
type QuitJourneyDocument = PHDocument<QuitJourneyPHState>;

export * from "./schema/types.js";

export type {
  QuitJourneyAction,
  QuitJourneyDocument,
  QuitJourneyGlobalState,
  QuitJourneyLocalState,
  QuitJourneyPHState,
};
