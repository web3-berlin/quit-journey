import type { QuitJourneyTrackingOperations } from "document-models/quit-journey/v1";
import {
  DrinkNotFoundError,
  GamblingLossNotFoundError,
  InvalidDrinkError,
  InvalidGamblingLossError,
  InvalidScreenTimeError,
} from "../../gen/tracking/error.js";

export const quitJourneyTrackingOperations: QuitJourneyTrackingOperations = {
  logDrinkOperation(state, action) {
    const i = action.input;
    if (
      i.volumeMl <= 0 ||
      i.volumeMl > 5000 ||
      i.abvPercent <= 0 ||
      i.abvPercent > 100
    ) {
      throw new InvalidDrinkError(
        "Volume must be 1-5000 ml and ABV between 0 and 100 %",
      );
    }
    // Ethanol density 0.789 g/ml; standard-drink size defaults to the WHO's 10 g.
    const gramsAlcohol =
      Math.round(i.volumeMl * (i.abvPercent / 100) * 0.789 * 10) / 10;
    const standardDrinks =
      Math.round((gramsAlcohol / (state.plan?.standardDrinkGrams ?? 10)) * 10) /
      10;
    (state.drinks ??= []).push({
      id: i.id,
      timestamp: i.timestamp,
      beverage: i.beverage,
      volumeMl: i.volumeMl,
      abvPercent: i.abvPercent,
      gramsAlcohol,
      standardDrinks,
      slipId: i.slipId,
    });
    state.slips.push({
      id: i.slipId,
      timestamp: i.timestamp,
      units: standardDrinks,
      trigger: null,
      note: i.note || null,
    });
  },
  deleteDrinkOperation(state, action) {
    const drinks = state.drinks ?? [];
    const drink = drinks.find((d) => d.id === action.input.id);
    if (!drink) {
      throw new DrinkNotFoundError(`Drink ${action.input.id} not found`);
    }
    state.drinks = drinks.filter((d) => d.id !== drink.id);
    state.slips = state.slips.filter((s) => s.id !== drink.slipId);
  },
  logScreenTimeOperation(state, action) {
    const i = action.input;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(i.date) ||
      !Number.isInteger(i.minutes) ||
      i.minutes < 0 ||
      i.minutes > 1440
    ) {
      throw new InvalidScreenTimeError(
        "Date must be YYYY-MM-DD and minutes 0-1440",
      );
    }
    const list = (state.screenTime ??= []);
    const existing = list.find((e) => e.date === i.date);
    if (existing) {
      existing.minutes = i.minutes;
    } else {
      list.push({ id: i.id, date: i.date, minutes: i.minutes });
    }
  },
  logGamblingLossOperation(state, action) {
    const i = action.input;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date) || i.amount <= 0) {
      throw new InvalidGamblingLossError(
        "Date must be YYYY-MM-DD and the amount above 0",
      );
    }
    (state.gamblingLosses ??= []).push({
      id: i.id,
      date: i.date,
      amount: i.amount,
      note: i.note || null,
    });
  },
  deleteGamblingLossOperation(state, action) {
    const index = (state.gamblingLosses ?? []).findIndex(
      (x) => x.id === action.input.id,
    );
    if (index === -1) {
      throw new GamblingLossNotFoundError(`Loss ${action.input.id} not found`);
    }
    state.gamblingLosses?.splice(index, 1);
  },
};
