import type { JourneySnapshot, QuitJourneyAction, QuitJourneyLocalState, QuitJourneyState } from "document-models/quit-journey";
import type { HostCapabilities } from "./host.js";

/** Minimal dispatcher the UI needs; Connect's DocumentDispatch and the mobile store both satisfy it. */
export type Dispatch = (action: QuitJourneyAction) => void;

/** Props shared by every tab: the raw state, the derived snapshot and the dispatcher. */
export interface TabProps {
  state: QuitJourneyState;
  /** Device-private state (safety checks, risky places); empty in hosts without local scope. */
  local: QuitJourneyLocalState;
  snapshot: JourneySnapshot;
  dispatch: Dispatch;
  host: HostCapabilities;
}
