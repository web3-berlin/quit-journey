import { actions, type ProductType, type QuitPlan } from "document-models/quit-journey";
import { useState } from "react";
import { fromLocalInput, toLocalInput } from "../lib/format.js";
import { entries, PRODUCT_LABELS } from "../lib/labels.js";
import type { Dispatch } from "../lib/types.js";
import { Field, Select } from "./ui.js";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN", "JPY", "INR", "BRL"];

export function PlanForm({ plan, dispatch, now, onSaved }: { plan: QuitPlan | null | undefined; dispatch: Dispatch; now: number; onSaved?: () => void }) {
  const [quitAt, setQuitAt] = useState(toLocalInput(plan?.quitDateTime ?? now));
  const [product, setProduct] = useState<ProductType>(plan?.productType ?? "CIGARETTES");
  const [perDay, setPerDay] = useState(String(plan?.unitsPerDay ?? 15));
  const [perPack, setPerPack] = useState(String(plan?.unitsPerPack ?? 20));
  const [price, setPrice] = useState(String(plan?.packPrice ?? 8.5));
  const [currency, setCurrency] = useState(plan?.currency ?? "EUR");
  const [years, setYears] = useState(plan?.yearsSmoked != null ? String(plan.yearsSmoked) : "");
  const [error, setError] = useState<string | null>(null);

  const unitWord = product === "VAPE" ? "pods" : "cigarettes";

  function save() {
    const unitsPerDay = Number(perDay);
    const unitsPerPack = Math.round(Number(perPack));
    const packPrice = Number(price);
    if (!quitAt || !(unitsPerDay > 0) || !(unitsPerPack > 0) || !(packPrice >= 0)) {
      setError("Enter a quit date, a daily amount above 0, a pack size above 0 and a price.");
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
    }));
    onSaved?.();
  }

  return (
    <div className="stack">
      <div className="grid2">
        <Field label="Quit date and time (past or future)">
          <input type="datetime-local" value={quitAt} onChange={(e) => setQuitAt(e.target.value)} />
        </Field>
        <Field label="What did you smoke?">
          <Select value={product} options={entries(PRODUCT_LABELS)} onChange={(v) => v && setProduct(v)} />
        </Field>
        <Field label={`${unitWord[0].toUpperCase()}${unitWord.slice(1)} per day`}>
          <input type="number" min="0.5" step="0.5" value={perDay} onChange={(e) => setPerDay(e.target.value)} />
        </Field>
        <Field label={`${unitWord[0].toUpperCase()}${unitWord.slice(1)} per pack`}>
          <input type="number" min="1" step="1" value={perPack} onChange={(e) => setPerPack(e.target.value)} />
        </Field>
        <Field label="Price per pack">
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Currency">
          <Select value={currency} options={CURRENCIES.map((c) => [c, c] as [string, string])} onChange={(v) => v && setCurrency(v)} />
        </Field>
        <Field label="Years smoked (optional)">
          <input type="number" min="0" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" className="btn" onClick={save}>{plan ? "Save plan" : "Start my journey"}</button>
    </div>
  );
}
