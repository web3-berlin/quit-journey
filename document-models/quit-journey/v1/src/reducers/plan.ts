import type { QuitJourneyPlanOperations } from "document-models/quit-journey/v1";
import {
  EmptyMotivationError,
  InvalidQuitPlanError,
  MotivationNotFoundError,
} from "../../gen/plan/error.js";

export const quitJourneyPlanOperations: QuitJourneyPlanOperations = {
  setQuitPlanOperation(state, action) {
    const i = action.input;
    if (i.unitsPerDay <= 0 || i.unitsPerPack <= 0 || i.packPrice < 0) {
      throw new InvalidQuitPlanError(
        "unitsPerDay and unitsPerPack must be positive and packPrice must not be negative",
      );
    }
    state.plan = {
      quitDateTime: i.quitDateTime,
      productType: i.productType,
      unitsPerDay: i.unitsPerDay,
      unitsPerPack: i.unitsPerPack,
      packPrice: i.packPrice,
      currency: i.currency,
      yearsSmoked: i.yearsSmoked ?? null,
    };
  },
  setDisplayNameOperation(state, action) {
    state.displayName = action.input.displayName || null;
  },
  addMotivationOperation(state, action) {
    const text = action.input.text.trim();
    if (!text) {
      throw new EmptyMotivationError("Motivation text must not be empty");
    }
    state.motivations.push({
      id: action.input.id,
      text,
      imageUrl: action.input.imageUrl || null,
    });
  },
  removeMotivationOperation(state, action) {
    const index = state.motivations.findIndex((m) => m.id === action.input.id);
    if (index === -1) {
      throw new MotivationNotFoundError(
        `Motivation ${action.input.id} not found`,
      );
    }
    state.motivations.splice(index, 1);
  },
  togglePrepTaskOperation(state, action) {
    const key = action.input.taskKey;
    const has = state.prepTasksDone.includes(key);
    if (action.input.done && !has) {
      state.prepTasksDone.push(key);
    } else if (!action.input.done && has) {
      state.prepTasksDone = state.prepTasksDone.filter((k) => k !== key);
    }
  },
};
