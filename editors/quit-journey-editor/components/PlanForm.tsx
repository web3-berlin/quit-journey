import { actions, substanceProfile, SUBSTANCE_GROUPS, type ProductType, type QuitPlan, type RecoveryGoal } from "document-models/quit-journey";
import { useState } from "react";
import { capitalize as cap, fromLocalInput, singular, toLocalInput } from "../lib/format.js";
import { PRODUCT_LABELS } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { SafetyNotes } from "./SafetyNotes.js";
import { Field, Select } from "./ui.js";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "JPY", "INR", "BRL"];

export function PlanForm({ plan, dispatch, now, onSaved }: { plan: QuitPlan | null | undefined; dispatch: Dispatch; now: number; onSaved?: () => void }) {
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
  const [error, setError] = useState<string | null>(null);

  const profile = substanceProfile(product);
  const unit = unitLabel.trim() || profile.unit;
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
      setError(`Enter a start date, how many ${unit} a day (above 0) and what it costs (0 if free).`);
      return;
    }
    if (dailyLimit !== null && !(dailyLimit > 0 && dailyLimit < unitsPerDay)) {
      setError(`Set a daily limit above 0 and below your current ${unitsPerDay} ${unit} a day.`);
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
    }));
    onSaved?.();
  }

  return (
    <div className="stack">
      <Field label="What are you quitting?">
        <select value={product} onChange={(e) => choose(e.target.value as ProductType)}>
          {SUBSTANCE_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.keys.map((k) => <option key={k} value={k}>{PRODUCT_LABELS[k]}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>

      <SafetyNotes notes={profile.safety.filter((n) => n.level === "critical")} />

      <div className="chips" role="group" aria-label="Goal">
        <button type="button" className="chip" aria-pressed={goal === "ABSTINENCE"} onClick={() => setGoal("ABSTINENCE")}>Quit completely</button>
        <button type="button" className="chip" aria-pressed={goal === "REDUCTION"} onClick={() => setGoal("REDUCTION")}>Cut down first</button>
      </div>
      {goal === "REDUCTION" && (
        <p className="soft">
          Cutting down is a real goal, not a failure. Days at or under your limit count as wins; use the Today screen to log what you use.
          {profile.dangerousWithdrawal && " With this substance, a doctor-guided taper is the safest way to come down."}
        </p>
      )}

      <div className="grid2">
        {product === "OTHER" && (
          <Field label="What is it?">
            <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Ketamine, shopping" />
          </Field>
        )}
        <Field label="Start date and time (past or future)">
          <input type="datetime-local" value={quitAt} onChange={(e) => setQuitAt(e.target.value)} />
        </Field>
        <Field label="Count it in (optional)">
          <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder={profile.unit} />
        </Field>
        <Field label={`${cap(unit)} per day, before quitting`}>
          <input type="number" min="0.5" step="0.5" value={perDay} onChange={(e) => setPerDay(e.target.value)} />
        </Field>
        {goal === "REDUCTION" && (
          <Field label={`Daily limit (${unit})`}>
            <input type="number" min="0.5" step="0.5" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </Field>
        )}
        {!behaviour && (
          <Field label={`${cap(unit)} per ${profile.purchase}`}>
            <input type="number" min="1" step="1" value={perPack} onChange={(e) => setPerPack(e.target.value)} />
          </Field>
        )}
        <Field label={behaviour ? `Money spent per ${singular(unit)} (0 if free)` : `Price per ${profile.purchase}`}>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Currency">
          <Select value={currency} options={CURRENCIES.map((c) => [c, c] as [string, string])} onChange={(v) => v && setCurrency(v)} />
        </Field>
        <Field label="Years using (optional)">
          <input type="number" min="0" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" className="btn" onClick={save}>{plan ? "Save plan" : "Start my journey"}</button>
    </div>
  );
}
