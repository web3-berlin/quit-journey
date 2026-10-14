import type { QuitJourneySlipsOperations } from "document-models/quit-journey/v1";
import {
  InvalidRestartDatesError,
  InvalidSlipUnitsError,
  NoActiveQuitPlanError,
  SlipNotFoundError,
} from "../../gen/slips/error.js";

export const quitJourneySlipsOperations: QuitJourneySlipsOperations = {
  logSlipOperation(state, action) {
    const i = action.input;
    if (i.units <= 0) {
      throw new InvalidSlipUnitsError("Units smoked must be positive");
    }
    state.slips.push({
      id: i.id,
      timestamp: i.timestamp,
      units: i.units,
      trigger: i.trigger ?? null,
      note: i.note || null,
    });
  },
  deleteSlipOperation(state, action) {
    const index = state.slips.findIndex((s) => s.id === action.input.id);
    if (index === -1) {
      throw new SlipNotFoundError(`Slip ${action.input.id} not found`);
    }
    state.slips.splice(index, 1);
  },
  restartJourneyOperation(state, action) {
    const i = action.input;
    if (!state.plan) {
      throw new NoActiveQuitPlanError("There is no quit plan to restart");
    }
    const previousQuit = Date.parse(state.plan.quitDateTime);
    if (
      Date.parse(i.endedAt) < previousQuit ||
      Date.parse(i.newQuitDateTime) < Date.parse(i.endedAt)
    ) {
      throw new InvalidRestartDatesError(
        "endedAt must be after the current quit date and the new quit date must not be before endedAt",
      );
    }
    state.pastAttempts.push({
      id: i.attemptId,
      quitDateTime: state.plan.quitDateTime,
      endedAt: i.endedAt,
      reason: i.reason || null,
    });
    state.plan.quitDateTime = i.newQuitDateTime;
  },
};
