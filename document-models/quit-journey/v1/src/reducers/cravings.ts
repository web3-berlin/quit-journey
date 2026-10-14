import type { QuitJourneyCravingsOperations } from "document-models/quit-journey/v1";
import {
  CravingNotFoundError,
  InvalidCravingDurationError,
  InvalidCravingIntensityError,
} from "../../gen/cravings/error.js";

export const quitJourneyCravingsOperations: QuitJourneyCravingsOperations = {
  logCravingOperation(state, action) {
    const i = action.input;
    if (!Number.isInteger(i.intensity) || i.intensity < 1 || i.intensity > 5) {
      throw new InvalidCravingIntensityError(
        "Intensity must be an integer between 1 and 5",
      );
    }
    if (i.durationMinutes != null && i.durationMinutes < 0) {
      throw new InvalidCravingDurationError("Duration must not be negative");
    }
    state.cravings.push({
      id: i.id,
      timestamp: i.timestamp,
      intensity: i.intensity,
      trigger: i.trigger,
      strategy: i.strategy ?? null,
      outcome: i.outcome,
      durationMinutes: i.durationMinutes ?? null,
      note: i.note || null,
    });
  },
  deleteCravingOperation(state, action) {
    const index = state.cravings.findIndex((c) => c.id === action.input.id);
    if (index === -1) {
      throw new CravingNotFoundError(`Craving ${action.input.id} not found`);
    }
    state.cravings.splice(index, 1);
  },
};
