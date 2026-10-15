import { generateId } from "document-model";
import { actions, COMMON_DRINKS, estimateDrink, type BeverageType } from "document-models/quit-journey";
import { useState } from "react";
import { formatDateTime, formatNumber } from "../../lib/format.js";
import { BEVERAGE_LABELS, entries } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Field, Select } from "../ui.js";

export function DrinkDiary({ state, snapshot, dispatch }: TabProps) {
  const grams = state.plan?.standardDrinkGrams ?? 10;
  const [beverage, setBeverage] = useState<BeverageType>("BEER");
  const [volume, setVolume] = useState("500");
  const [abv, setAbv] = useState("5");
  const drinks = [...(state.drinks ?? [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const week = snapshot.toolkit.drinkWeek;
  const estimate = Number(volume) > 0 && Number(abv) > 0 ? estimateDrink(Number(volume), Number(abv), grams) : null;

  function log(b: BeverageType, ml: number, pct: number) {
    dispatch(actions.logDrink({ id: generateId(), slipId: generateId(), timestamp: new Date().toISOString(), beverage: b, volumeMl: ml, abvPercent: pct, note: null }));
  }

  return (
    <section className="stack">
      <h3>Drink diary</h3>
      <p className="soft">
        Logging each drink is one of the best-supported ways to cut down. Counted in standard drinks of {grams} g alcohol
        {state.plan?.standardDrinkGrams == null && " (WHO; change your country under My plan)"}.
      </p>
      {week && (
        <p>Last 7 days: <strong>{formatNumber(week.standardDrinks, 1)} standard drinks</strong> on {week.drinkingDays} day{week.drinkingDays === 1 ? "" : "s"} ({formatNumber(week.gramsAlcohol)} g alcohol).</p>
      )}
      <div className="chips">
        {COMMON_DRINKS.map((d) => (
          <button key={d.label} type="button" className="chip" onClick={() => log(d.beverage, d.volumeMl, d.abvPercent)}>+ {d.label}</button>
        ))}
      </div>
      <details>
        <summary className="soft" style={{ cursor: "pointer" }}>Something else</summary>
        <div className="grid2" style={{ marginTop: 8 }}>
          <Field label="Drink"><Select value={beverage} options={entries(BEVERAGE_LABELS)} onChange={(v) => v && setBeverage(v)} /></Field>
          <Field label="Amount (ml)"><input type="number" min="1" value={volume} onChange={(e) => setVolume(e.target.value)} /></Field>
          <Field label="Strength (% ABV)"><input type="number" min="0.5" step="0.1" value={abv} onChange={(e) => setAbv(e.target.value)} /></Field>
        </div>
        {estimate && <p className="soft">= {formatNumber(estimate.standardDrinks, 1)} standard drinks ({formatNumber(estimate.gramsAlcohol, 1)} g)</p>}
        <button type="button" className="btn ghost small" disabled={!estimate} onClick={() => log(beverage, Number(volume), Number(abv))}>Log drink</button>
      </details>
      {drinks.length > 0 && (
        <ul className="list">
          {drinks.slice(0, 8).map((d) => (
            <li key={d.id}>
              <span>{BEVERAGE_LABELS[d.beverage]} {d.volumeMl} ml, {d.abvPercent}% — <strong>{formatNumber(d.standardDrinks, 1)}</strong><br /><span className="muted">{formatDateTime(d.timestamp)}</span></span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteDrink({ id: d.id }))}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
