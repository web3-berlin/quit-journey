import type { QuitJourneyAidsOperations } from "document-models/quit-journey/v1";
import {
  AidForUseNotFoundError,
  QuitAidNotFoundError,
} from "../../gen/aids/error.js";

export const quitJourneyAidsOperations: QuitJourneyAidsOperations = {
  addQuitAidOperation(state, action) {
    const i = action.input;
    state.aids.push({
      id: i.id,
      type: i.type,
      name: i.name || null,
      dosage: i.dosage || null,
      startedAt: i.startedAt,
      endedAt: null,
    });
  },
  endQuitAidOperation(state, action) {
    const aid = state.aids.find((a) => a.id === action.input.id);
    if (!aid) {
      throw new QuitAidNotFoundError(`Quit aid ${action.input.id} not found`);
    }
    aid.endedAt = action.input.endedAt;
  },
  logAidUseOperation(state, action) {
    const i = action.input;
    if (!state.aids.some((a) => a.id === i.aidId)) {
      throw new AidForUseNotFoundError(`Quit aid ${i.aidId} not found`);
    }
    state.aidUses.push({
      id: i.id,
      aidId: i.aidId,
      timestamp: i.timestamp,
      note: i.note || null,
      beforeDrinking: i.beforeDrinking ?? null,
    });
  },
};
