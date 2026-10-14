import type { QuitJourneySupportOperations } from "document-models/quit-journey/v1";
import {
  EmptyContactNameError,
  SupportContactNotFoundError,
} from "../../gen/support/error.js";

export const quitJourneySupportOperations: QuitJourneySupportOperations = {
  addSupportContactOperation(state, action) {
    const name = action.input.name.trim();
    if (!name) {
      throw new EmptyContactNameError("Contact name must not be empty");
    }
    state.supportContacts.push({
      id: action.input.id,
      name,
      phone: action.input.phone || null,
      relation: action.input.relation || null,
    });
  },
  removeSupportContactOperation(state, action) {
    const index = state.supportContacts.findIndex(
      (c) => c.id === action.input.id,
    );
    if (index === -1) {
      throw new SupportContactNotFoundError(
        `Contact ${action.input.id} not found`,
      );
    }
    state.supportContacts.splice(index, 1);
  },
  setQuitlineOperation(state, action) {
    state.quitlinePhone = action.input.phone || null;
  },
};
