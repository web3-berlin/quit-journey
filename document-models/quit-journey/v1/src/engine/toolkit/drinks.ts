import type { QuitJourneyState } from "document-models/quit-journey/v1";
import { localDateKey, shiftDateKey } from "../time.js";
import { round1 } from "./dates.js";
import type { DrinkEstimate, DrinkPreset, DrinkWeek, StandardDrinkDefinition } from "./types.js";

/** Grams of pure alcohol in one "standard drink" by country (Kalinowski & Humphreys, Addiction 2016, unless noted). */
export const STANDARD_DRINKS: StandardDrinkDefinition[] = [
  { country: "WHO", grams: 10, source: "WHO AUDIT manual (Babor et al. 2001)" },
  { country: "United Kingdom", grams: 8, source: "UK unit = 10 ml / 8 g pure alcohol (NHS)" },
  { country: "United States", grams: 14, source: "NIAAA" },
  { country: "Canada", grams: 13.45, source: "Canada's Guidance on Alcohol and Health" },
  { country: "Australia", grams: 10, source: "NHMRC" },
  { country: "New Zealand", grams: 10, source: "Kalinowski & Humphreys 2016" },
  { country: "Ireland", grams: 10, source: "HSE" },
  { country: "Germany", grams: 10, source: "BZgA/BIÖG Standardglas ≈ 10 g (10-12 g)" },
  { country: "Austria", grams: 20, source: "Kalinowski & Humphreys 2016" },
  { country: "Switzerland", grams: 10, source: "BAG Standardglas 10-12 g" },
  { country: "Netherlands", grams: 10, source: "Kalinowski & Humphreys 2016" },
  { country: "France", grams: 10, source: "Santé publique France" },
  { country: "Japan", grams: 20, source: "MHLW drink unit ≈ 20 g (Kalinowski & Humphreys 2016: 19.75 g)" },
];

/** Same formula and rounding as the LOG_DRINK reducer (ethanol 0.789 g/ml). */
export function estimateDrink(volumeMl: number, abvPercent: number, gramsPerStandard = 10): DrinkEstimate {
  const gramsAlcohol = Math.round(volumeMl * (abvPercent / 100) * 0.789 * 10) / 10;
  const standardDrinks = Math.round((gramsAlcohol / gramsPerStandard) * 10) / 10;
  return { gramsAlcohol, standardDrinks };
}

export const COMMON_DRINKS: DrinkPreset[] = [
  { key: "pint-beer", label: "Pint of beer (568 ml, 4.5%)", beverage: "BEER", volumeMl: 568, abvPercent: 4.5 },
  { key: "bottle-beer", label: "Bottle of beer (330 ml, 5%)", beverage: "BEER", volumeMl: 330, abvPercent: 5 },
  { key: "can-beer", label: "Large can of beer (500 ml, 5%)", beverage: "BEER", volumeMl: 500, abvPercent: 5 },
  { key: "cider-pint", label: "Pint of cider (568 ml, 5%)", beverage: "CIDER", volumeMl: 568, abvPercent: 5 },
  { key: "wine-glass", label: "Glass of wine (175 ml, 12.5%)", beverage: "WINE", volumeMl: 175, abvPercent: 12.5 },
  { key: "wine-small", label: "Small glass of wine (125 ml, 12.5%)", beverage: "WINE", volumeMl: 125, abvPercent: 12.5 },
  { key: "wine-bottle", label: "Bottle of wine (750 ml, 12.5%)", beverage: "WINE", volumeMl: 750, abvPercent: 12.5 },
  { key: "spirit-single", label: "Single spirit (25 ml, 40%)", beverage: "SPIRITS", volumeMl: 25, abvPercent: 40 },
  { key: "spirit-double", label: "Double spirit (50 ml, 40%)", beverage: "SPIRITS", volumeMl: 50, abvPercent: 40 },
  // ≈ 2 WHO standard drinks (20 g): 200 ml at 12.5% ≈ 19.7 g.
  { key: "cocktail", label: "Cocktail (about 2 standard drinks)", beverage: "COCKTAIL", volumeMl: 200, abvPercent: 12.5 },
];

/** Drinks logged on the last 7 local calendar days, today included. */
export function drinkWeek(state: QuitJourneyState, now: number): DrinkWeek {
  const today = localDateKey(now);
  const from = shiftDateKey(today, -6);
  const days = new Set<string>();
  let standardDrinks = 0;
  let gramsAlcohol = 0;
  for (const d of state.drinks ?? []) {
    const key = localDateKey(Date.parse(d.timestamp));
    if (key < from || key > today) continue;
    days.add(key);
    standardDrinks += d.standardDrinks;
    gramsAlcohol += d.gramsAlcohol;
  }
  return { standardDrinks: round1(standardDrinks), gramsAlcohol: round1(gramsAlcohol), drinkingDays: days.size };
}
