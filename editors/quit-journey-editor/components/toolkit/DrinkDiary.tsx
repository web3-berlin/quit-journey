import { generateId } from "document-model";
import { actions, COMMON_DRINKS, estimateDrink, type BeverageType } from "document-models/quit-journey";
import { useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import { formatDateTime, formatNumber } from "../../lib/format.js";
import { useLabels } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Field, Select } from "../ui.js";

export function DrinkDiary({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const grams = state.plan?.standardDrinkGrams ?? 10;
  const [beverage, setBeverage] = useState<BeverageType>("BEER");
  const [volume, setVolume] = useState("500");
  const [abv, setAbv] = useState("5");
  const drinks = [...(state.drinks ?? [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const week = snapshot.toolkit.drinkWeek;
  const estimate = Number(volume) > 0 && Number(abv) > 0 ? estimateDrink(Number(volume), Number(abv), grams) : null;
  const bold = (c: ReactNode[]) => <strong>{c}</strong>;

  function log(b: BeverageType, ml: number, pct: number) {
    dispatch(actions.logDrink({ id: generateId(), slipId: generateId(), timestamp: new Date().toISOString(), beverage: b, volumeMl: ml, abvPercent: pct, note: null }));
  }

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.drinks.heading", defaultMessage: "Drink diary" })}</h3>
      <p className="soft">
        {state.plan?.standardDrinkGrams == null
          ? intl.formatMessage(
              {
                id: "toolkit.drinks.introDefault",
                defaultMessage: "Logging each drink is one of the best-supported ways to cut down. Counted in standard drinks of {grams} g alcohol (WHO; change your country under My plan).",
              },
              { grams },
            )
          : intl.formatMessage(
              {
                id: "toolkit.drinks.intro",
                defaultMessage: "Logging each drink is one of the best-supported ways to cut down. Counted in standard drinks of {grams} g alcohol.",
              },
              { grams },
            )}
      </p>
      {week && (
        <p>
          {intl.formatMessage(
            {
              id: "toolkit.drinks.week",
              defaultMessage: "Last 7 days: <b>{drinks} standard drinks</b> on {days, plural, one {# day} other {# days}} ({grams} g alcohol).",
            },
            { b: bold, drinks: formatNumber(week.standardDrinks, 1), days: week.drinkingDays, grams: formatNumber(week.gramsAlcohol) },
          )}
        </p>
      )}
      <div className="chips">
        {COMMON_DRINKS.map((d) => (
          <button key={d.key} type="button" className="chip" onClick={() => log(d.beverage, d.volumeMl, d.abvPercent)}>
            {intl.formatMessage({ id: "toolkit.drinks.quickAdd", defaultMessage: "+ {drink}" }, { drink: tc(cid.drink(d.key), d.label) })}
          </button>
        ))}
      </div>
      <details>
        <summary className="soft" style={{ cursor: "pointer" }}>{intl.formatMessage({ id: "toolkit.drinks.somethingElse", defaultMessage: "Something else" })}</summary>
        <div className="grid2" style={{ marginTop: 8 }}>
          <Field label={intl.formatMessage({ id: "toolkit.drinks.drinkLabel", defaultMessage: "Drink" })}>
            <Select value={beverage} options={L.options("beverage")} onChange={(v) => v && setBeverage(v)} />
          </Field>
          <Field label={intl.formatMessage({ id: "toolkit.drinks.amountLabel", defaultMessage: "Amount (ml)" })}>
            <input type="number" min="1" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </Field>
          <Field label={intl.formatMessage({ id: "toolkit.drinks.strengthLabel", defaultMessage: "Strength (% ABV)" })}>
            <input type="number" min="0.5" step="0.1" value={abv} onChange={(e) => setAbv(e.target.value)} />
          </Field>
        </div>
        {estimate && (
          <p className="soft">
            {intl.formatMessage(
              { id: "toolkit.drinks.estimate", defaultMessage: "= {drinks} standard drinks ({grams} g)" },
              { drinks: formatNumber(estimate.standardDrinks, 1), grams: formatNumber(estimate.gramsAlcohol, 1) },
            )}
          </p>
        )}
        <button type="button" className="btn ghost small" disabled={!estimate} onClick={() => log(beverage, Number(volume), Number(abv))}>
          {intl.formatMessage({ id: "toolkit.drinks.log", defaultMessage: "Log drink" })}
        </button>
      </details>
      {drinks.length > 0 && (
        <ul className="list">
          {drinks.slice(0, 8).map((d) => (
            <li key={d.id}>
              <span>
                {intl.formatMessage(
                  { id: "toolkit.drinks.entry", defaultMessage: "{beverage} {volume} ml, {abv}% — <b>{drinks}</b>" },
                  { b: bold, beverage: L.label("beverage", d.beverage), volume: formatNumber(d.volumeMl), abv: formatNumber(d.abvPercent, 2), drinks: formatNumber(d.standardDrinks, 1) },
                )}
                <br /><span className="muted">{formatDateTime(d.timestamp)}</span>
              </span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteDrink({ id: d.id }))}>
                {intl.formatMessage({ id: "toolkit.drinks.delete", defaultMessage: "Delete" })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
