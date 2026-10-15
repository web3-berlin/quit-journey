import { actions, STANDARD_DRINKS, substanceProfile, SUBSTANCE_GROUPS, type ProductType, type QuitPlan, type RecoveryGoal } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl, type IntlShape } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { capitalize as cap, fromLocalInput, singular, toLocalInput } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { SafetyNotes } from "./SafetyNotes.js";
import { Field, Select } from "./ui.js";

type FormError = { kind: "basic" } | { kind: "limit"; unitsPerDay: number };

/** Picker group headings from SUBSTANCE_GROUPS, keyed by their English label. */
function groupLabel(intl: IntlShape, label: string): string {
  switch (label) {
    case "Nicotine": return intl.formatMessage({ id: "form.substanceGroup.nicotine", defaultMessage: "Nicotine" });
    case "Alcohol & drugs": return intl.formatMessage({ id: "form.substanceGroup.alcohol-drugs", defaultMessage: "Alcohol & drugs" });
    case "Behaviours": return intl.formatMessage({ id: "form.substanceGroup.behaviours", defaultMessage: "Behaviours" });
    case "Everyday": return intl.formatMessage({ id: "form.substanceGroup.everyday", defaultMessage: "Everyday" });
    default: return label;
  }
}

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "JPY", "INR", "BRL"];

export function PlanForm({ plan, dispatch, now, onSaved }: { plan: QuitPlan | null | undefined; dispatch: Dispatch; now: number; onSaved?: () => void }) {
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const [quitAt, setQuitAt] = useState(toLocalInput(plan?.quitDateTime ?? now));
  const [product, setProduct] = useState<ProductType>(plan?.productType ?? "CIGARETTES");
  const [customName, setCustomName] = useState(plan?.customName ?? "");
  const [unitLabel, setUnitLabel] = useState(plan?.unitLabel ?? "");
  const [goal, setGoal] = useState<RecoveryGoal>(plan?.goal ?? "ABSTINENCE");
  const [limit, setLimit] = useState(plan?.dailyLimit != null ? String(plan.dailyLimit) : "");
  const [perDay, setPerDay] = useState(String(plan?.unitsPerDay ?? 15));
  const [perPack, setPerPack] = useState(String(plan?.unitsPerPack ?? 20));
  const [price, setPrice] = useState(String(plan?.packPrice ?? 8.5));
  const [currency, setCurrency] = useState(plan?.currency ?? "EUR");
  const [years, setYears] = useState(plan?.yearsSmoked != null ? String(plan.yearsSmoked) : "");
  const [drinkGrams, setDrinkGrams] = useState(plan?.standardDrinkGrams != null ? String(plan.standardDrinkGrams) : "");
  const [error, setError] = useState<FormError | null>(null);

  const profile = substanceProfile(product);
  const defaultUnit = tc(cid.substance(product, "unit"), profile.unit);
  const unit = unitLabel.trim() || defaultUnit;
  const purchase = tc(cid.substance(product, "purchase"), profile.purchase);
  // singular() only knows English plurals; other languages keep the unit as written.
  const oneUnit = intl.locale.startsWith("en") ? singular(unit) : unit;
  const behaviour = profile.category === "BEHAVIOR";

  function choose(next: ProductType) {
    setProduct(next);
    // A fresh plan gets sensible starting numbers for behaviours, which are measured per session or hour.
    if (!plan && substanceProfile(next).category === "BEHAVIOR") {
      setPerDay("2");
      setPerPack("1");
      setPrice(next === "GAMBLING" ? "40" : "0");
    }
  }

  function save() {
    const unitsPerDay = Number(perDay);
    const unitsPerPack = behaviour ? 1 : Math.round(Number(perPack));
    const packPrice = Number(price);
    const dailyLimit = goal === "REDUCTION" ? Number(limit) : null;
    if (!quitAt || !(unitsPerDay > 0) || !(unitsPerPack > 0) || !(packPrice >= 0)) {
      setError({ kind: "basic" });
      return;
    }
    if (dailyLimit !== null && !(dailyLimit > 0 && dailyLimit < unitsPerDay)) {
      setError({ kind: "limit", unitsPerDay });
      return;
    }
    setError(null);
    dispatch(actions.setQuitPlan({
      quitDateTime: fromLocalInput(quitAt),
      productType: product,
      unitsPerDay,
      unitsPerPack,
      packPrice,
      currency,
      yearsSmoked: years ? Number(years) : null,
      customName: customName.trim() || null,
      unitLabel: unitLabel.trim() || null,
      goal,
      dailyLimit,
      standardDrinkGrams: product === "ALCOHOL" && drinkGrams ? Number(drinkGrams) : null,
    }));
    onSaved?.();
  }

  return (
    <div className="stack">
      <Field label={intl.formatMessage({ id: "plan.form.product", defaultMessage: "What are you quitting?" })}>
        <select value={product} onChange={(e) => choose(e.target.value as ProductType)}>
          {SUBSTANCE_GROUPS.map((g) => (
            <optgroup key={g.label} label={groupLabel(intl, g.label)}>
              {g.keys.map((k) => <option key={k} value={k}>{L.label("product", k)}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>

      <SafetyNotes notes={profile.safety.filter((n) => n.level === "critical")} />

      <div className="chips" role="group" aria-label={intl.formatMessage({ id: "plan.form.goal", defaultMessage: "Goal" })}>
        <button type="button" className="chip" aria-pressed={goal === "ABSTINENCE"} onClick={() => setGoal("ABSTINENCE")}>{intl.formatMessage({ id: "plan.form.goal.abstinence", defaultMessage: "Quit completely" })}</button>
        <button type="button" className="chip" aria-pressed={goal === "REDUCTION"} onClick={() => setGoal("REDUCTION")}>{intl.formatMessage({ id: "plan.form.goal.reduction", defaultMessage: "Cut down first" })}</button>
      </div>
      {goal === "REDUCTION" && (
        <p className="soft">
          {intl.formatMessage({ id: "plan.form.reductionIntro", defaultMessage: "Cutting down is a real goal, not a failure. Days at or under your limit count as wins; use the Today screen to log what you use." })}
          {profile.dangerousWithdrawal && <>{" "}{intl.formatMessage({ id: "plan.form.taperNote", defaultMessage: "With this substance, a doctor-guided taper is the safest way to come down." })}</>}
        </p>
      )}

      <div className="grid2">
        {product === "OTHER" && (
          <Field label={intl.formatMessage({ id: "plan.form.customName", defaultMessage: "What is it?" })}>
            <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder={intl.formatMessage({ id: "plan.form.customName.placeholder", defaultMessage: "e.g. Ketamine, shopping" })} />
          </Field>
        )}
        <Field label={intl.formatMessage({ id: "plan.form.startDate", defaultMessage: "Start date and time (past or future)" })}>
          <input type="datetime-local" value={quitAt} onChange={(e) => setQuitAt(e.target.value)} />
        </Field>
        <Field label={intl.formatMessage({ id: "plan.form.unitLabel", defaultMessage: "Count it in (optional)" })}>
          <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder={defaultUnit} />
        </Field>
        <Field label={intl.formatMessage({ id: "plan.form.perDay", defaultMessage: "{Unit} per day, before quitting" }, { Unit: cap(unit) })}>
          <input type="number" min="0.5" step="0.5" value={perDay} onChange={(e) => setPerDay(e.target.value)} />
        </Field>
        {goal === "REDUCTION" && (
          <Field label={intl.formatMessage({ id: "plan.form.dailyLimit", defaultMessage: "Daily limit ({unit})" }, { unit })}>
            <input type="number" min="0.5" step="0.5" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </Field>
        )}
        {!behaviour && (
          <Field label={intl.formatMessage({ id: "plan.form.perPurchase", defaultMessage: "{Unit} per {purchase}" }, { Unit: cap(unit), purchase })}>
            <input type="number" min="1" step="1" value={perPack} onChange={(e) => setPerPack(e.target.value)} />
          </Field>
        )}
        <Field label={behaviour
          ? intl.formatMessage({ id: "plan.form.moneyPerUnit", defaultMessage: "Money spent per {unit} (0 if free)" }, { unit: oneUnit })
          : intl.formatMessage({ id: "plan.form.pricePerPurchase", defaultMessage: "Price per {purchase}" }, { purchase })}>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label={intl.formatMessage({ id: "plan.form.currency", defaultMessage: "Currency" })}>
          <Select value={currency} options={CURRENCIES.map((c) => [c, c] as [string, string])} onChange={(v) => v && setCurrency(v)} />
        </Field>
        {product === "ALCOHOL" && (
          <Field label={intl.formatMessage({ id: "plan.form.standardDrink", defaultMessage: "Standard drink in your country" })}>
            <select value={drinkGrams} onChange={(e) => setDrinkGrams(e.target.value)}>
              <option value="">{intl.formatMessage({ id: "plan.form.standardDrink.who", defaultMessage: "WHO standard (10 g)" })}</option>
              {STANDARD_DRINKS.map((d) => <option key={d.country} value={String(d.grams)}>{d.country} ({d.grams} g)</option>)}
            </select>
          </Field>
        )}
        <Field label={intl.formatMessage({ id: "plan.form.years", defaultMessage: "Years using (optional)" })}>
          <input type="number" min="0" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>
      {error && (
        <p className="error" role="alert">
          {error.kind === "basic"
            ? intl.formatMessage({ id: "plan.form.error.basic", defaultMessage: "Enter a start date, how many {unit} a day (above 0) and what it costs (0 if free)." }, { unit })
            : intl.formatMessage({ id: "plan.form.error.limit", defaultMessage: "Set a daily limit above 0 and below your current {unitsPerDay} {unit} a day." }, { unitsPerDay: error.unitsPerDay, unit })}
        </p>
      )}
      <button type="button" className="btn" onClick={save}>{plan
        ? intl.formatMessage({ id: "plan.form.save", defaultMessage: "Save plan" })
        : intl.formatMessage({ id: "plan.form.start", defaultMessage: "Start my journey" })}</button>
    </div>
  );
}
