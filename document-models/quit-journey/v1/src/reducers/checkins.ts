import type { QuitJourneyCheckinsOperations } from "document-models/quit-journey/v1";
import {
  CheckinNotFoundError,
  DuplicateCheckinDateError,
  InvalidCheckinDateError,
  InvalidCheckinRatingError,
  InvalidWeightError,
} from "../../gen/checkins/error.js";

export const quitJourneyCheckinsOperations: QuitJourneyCheckinsOperations = {
  dailyCheckInOperation(state, action) {
    const i = action.input;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date)) {
      throw new InvalidCheckinDateError(
        "Check-in date must be a calendar date in YYYY-MM-DD format",
      );
    }
    if (state.checkIns.some((c) => c.date === i.date)) {
      throw new DuplicateCheckinDateError(
        `A check-in for ${i.date} already exists`,
      );
    }
    const ratings = [i.mood, i.cravingLevel, i.energy, i.sleepQuality].filter(
      (r) => r != null,
    );
    if (ratings.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {
      throw new InvalidCheckinRatingError(
        "Ratings must be integers between 1 and 5",
      );
    }
    if (i.weightKg != null && i.weightKg <= 0) {
      throw new InvalidWeightError("Weight must be positive");
    }
    state.checkIns.push({
      id: i.id,
      date: i.date,
      mood: i.mood,
      cravingLevel: i.cravingLevel,
      energy: i.energy ?? null,
      sleepQuality: i.sleepQuality ?? null,
      weightKg: i.weightKg ?? null,
      symptoms: i.symptoms ?? [],
      note: i.note || null,
    });
  },
  deleteCheckInOperation(state, action) {
    const index = state.checkIns.findIndex((c) => c.id === action.input.id);
    if (index === -1) {
      throw new CheckinNotFoundError(`Check-in ${action.input.id} not found`);
    }
    state.checkIns.splice(index, 1);
  },
};
