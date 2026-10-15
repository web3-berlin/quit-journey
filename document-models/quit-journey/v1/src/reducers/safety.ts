import type { QuitJourneySafetyOperations } from "document-models/quit-journey/v1";
import {
  DrugCheckNotFoundError,
  ExclusionNotFoundError,
  InvalidExclusionError,
  InvalidNaloxoneExpiryError,
  InvalidRiskyPlaceError,
  InvalidSafetyCheckEndError,
  InvalidSafetyDurationError,
  NaloxoneKitNotFoundError,
  NaloxoneKitToRemoveNotFoundError,
  RiskyPlaceNotFoundError,
  SafetyCheckAlreadyActiveError,
  SafetyCheckNotFoundError,
} from "../../gen/safety/error.js";

export const quitJourneySafetyOperations: QuitJourneySafetyOperations = {
  addNaloxoneKitOperation(state, action) {
    const i = action.input;
    if (i.expiresOn && !/^\d{4}-\d{2}-\d{2}$/.test(i.expiresOn)) {
      throw new InvalidNaloxoneExpiryError(
        "Expiry date must be a calendar date in YYYY-MM-DD format",
      );
    }
    (state.naloxoneKits ??= []).push({
      id: i.id,
      kind: i.kind,
      location: i.location?.trim() || null,
      expiresOn: i.expiresOn || null,
      addedAt: i.addedAt,
      usedAt: null,
    });
  },
  markNaloxoneUsedOperation(state, action) {
    const kit = (state.naloxoneKits ?? []).find(
      (k) => k.id === action.input.id,
    );
    if (!kit) {
      throw new NaloxoneKitNotFoundError(
        `Naloxone kit ${action.input.id} not found`,
      );
    }
    kit.usedAt = action.input.usedAt;
  },
  removeNaloxoneKitOperation(state, action) {
    const index = (state.naloxoneKits ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new NaloxoneKitToRemoveNotFoundError(
        `Naloxone kit ${action.input.id} not found`,
      );
    }
    state.naloxoneKits?.splice(index, 1);
  },
  logDrugCheckOperation(state, action) {
    const i = action.input;
    (state.drugChecks ??= []).push({
      id: i.id,
      checkedAt: i.checkedAt,
      expectedSubstance: i.expectedSubstance?.trim() || null,
      testType: i.testType,
      result: i.result,
      actions: i.actions ?? [],
      note: i.note || null,
    });
  },
  deleteDrugCheckOperation(state, action) {
    const index = (state.drugChecks ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new DrugCheckNotFoundError(
        `Drug check ${action.input.id} not found`,
      );
    }
    state.drugChecks?.splice(index, 1);
  },
  addExclusionOperation(state, action) {
    const i = action.input;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(i.startDate) ||
      (i.endDate != null &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(i.endDate) || i.endDate < i.startDate))
    ) {
      throw new InvalidExclusionError(
        "Dates must be YYYY-MM-DD and the end date must not be before the start date",
      );
    }
    (state.exclusions ??= []).push({
      id: i.id,
      scheme: i.scheme,
      startDate: i.startDate,
      endDate: i.endDate ?? null,
      note: i.note || null,
    });
  },
  deleteExclusionOperation(state, action) {
    const index = (state.exclusions ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new ExclusionNotFoundError(
        `Exclusion ${action.input.id} not found`,
      );
    }
    state.exclusions?.splice(index, 1);
  },
  startSafetyCheckOperation(state, action) {
    const i = action.input;
    if (
      !Number.isInteger(i.durationMinutes) ||
      i.durationMinutes < 1 ||
      i.durationMinutes > 240
    ) {
      throw new InvalidSafetyDurationError(
        "Duration must be between 1 and 240 minutes",
      );
    }
    if ((state.safetyChecks ?? []).some((c) => c.outcome === "ACTIVE")) {
      throw new SafetyCheckAlreadyActiveError(
        "A safety check is already running",
      );
    }
    (state.safetyChecks ??= []).push({
      id: i.id,
      startedAt: i.startedAt,
      durationMinutes: i.durationMinutes,
      note: i.note || null,
      contactIds: i.contactIds ?? [],
      endedAt: null,
      outcome: "ACTIVE",
    });
  },
  endSafetyCheckOperation(state, action) {
    const check = (state.safetyChecks ?? []).find(
      (c) => c.id === action.input.id,
    );
    if (!check) {
      throw new SafetyCheckNotFoundError(
        `Safety check ${action.input.id} not found`,
      );
    }
    if (check.outcome !== "ACTIVE" || action.input.outcome === "ACTIVE") {
      throw new InvalidSafetyCheckEndError(
        "Only an active check can be ended, and not with outcome ACTIVE",
      );
    }
    check.endedAt = action.input.endedAt;
    check.outcome = action.input.outcome;
  },
  addRiskyPlaceOperation(state, action) {
    const i = action.input;
    const label = i.label.trim();
    if (
      !label ||
      i.lat < -90 ||
      i.lat > 90 ||
      i.lng < -180 ||
      i.lng > 180 ||
      i.radiusM < 25 ||
      i.radiusM > 5000
    ) {
      throw new InvalidRiskyPlaceError(
        "A place needs a name, valid coordinates and a radius of 25-5000 m",
      );
    }
    (state.riskyPlaces ??= []).push({
      id: i.id,
      label,
      lat: i.lat,
      lng: i.lng,
      radiusM: i.radiusM,
      planId: i.planId ?? null,
    });
  },
  deleteRiskyPlaceOperation(state, action) {
    const index = (state.riskyPlaces ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new RiskyPlaceNotFoundError(`Place ${action.input.id} not found`);
    }
    state.riskyPlaces?.splice(index, 1);
  },
};
