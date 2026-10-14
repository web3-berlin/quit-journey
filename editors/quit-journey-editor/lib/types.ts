import type { JourneySnapshot, QuitJourneyAction, QuitJourneyState } from "document-models/quit-journey";

/** Minimal dispatcher the UI needs; Connect's DocumentDispatch and the mobile store both satisfy it. */
export type Dispatch = (action: QuitJourneyAction) => void;

/** Props shared by every tab: the raw state, the derived snapshot and the dispatcher. */
export interface TabProps {
  state: QuitJourneyState;
  snapshot: JourneySnapshot;
  dispatch: Dispatch;
}
