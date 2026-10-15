import type { QuitJourneyMedicationOperations } from "document-models/quit-journey/v1";
import {
  InvalidMedicationPlanError,
  InvalidTakeHomeError,
  MedicationAidNotFoundError,
  MedicationPlanNotFoundError,
  TakeHomeAidNotFoundError,
} from "../../gen/medication/error.js";

export const quitJourneyMedicationOperations: QuitJourneyMedicationOperations =
  {
    setMedicationPlanOperation(state, action) {
      const i = action.input;
      if (!state.aids.some((a) => a.id === i.aidId)) {
        throw new MedicationAidNotFoundError(`Quit aid ${i.aidId} not found`);
      }
      const ordered = i.steps.every(
        (s, n) => n === 0 || s.fromDay > i.steps[n - 1].fromDay,
      );
      const valid = i.steps.every(
        (s) =>
          Number.isInteger(s.fromDay) &&
          s.fromDay >= 1 &&
          s.dose.trim() !== "" &&
          Number.isInteger(s.timesPerDay) &&
          s.timesPerDay >= 1,
      );
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(i.startDate) ||
        i.steps.length === 0 ||
        i.steps[0].fromDay !== 1 ||
        !ordered ||
        !valid
      ) {
        throw new InvalidMedicationPlanError(
          "A plan needs a YYYY-MM-DD start date and steps starting on day 1 in increasing day order, each with a dose and at least one time per day",
        );
      }
      const plans = (state.medicationPlans ??= []).filter(
        (p) => p.aidId !== i.aidId,
      );
      plans.push({
        id: i.id,
        aidId: i.aidId,
        source: i.source,
        startDate: i.startDate,
        steps: i.steps.map((s) => ({
          id: s.id,
          fromDay: s.fromDay,
          dose: s.dose.trim(),
          timesPerDay: s.timesPerDay,
        })),
        note: i.note || null,
      });
      state.medicationPlans = plans;
    },
    clearMedicationPlanOperation(state, action) {
      const plans = state.medicationPlans ?? [];
      if (!plans.some((p) => p.aidId === action.input.aidId)) {
        throw new MedicationPlanNotFoundError(
          `No plan for quit aid ${action.input.aidId}`,
        );
      }
      state.medicationPlans = plans.filter(
        (p) => p.aidId !== action.input.aidId,
      );
    },
    recordTakeHomeOperation(state, action) {
      const i = action.input;
      if (!state.aids.some((a) => a.id === i.aidId)) {
        throw new TakeHomeAidNotFoundError(`Quit aid ${i.aidId} not found`);
      }
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(i.pickedUpOn) ||
        !Number.isInteger(i.doses) ||
        i.doses < 1 ||
        i.doses > 31
      ) {
        throw new InvalidTakeHomeError(
          "Pick-up date must be YYYY-MM-DD and doses 1-31",
        );
      }
      (state.takeHomes ??= []).push({
        id: i.id,
        aidId: i.aidId,
        pickedUpOn: i.pickedUpOn,
        doses: i.doses,
      });
    },
  };
