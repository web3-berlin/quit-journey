import type { ReactNode } from "react";

export function Meter({ value, tone, label }: { value: number; tone?: "amber"; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={tone === "amber" ? "meter amber" : "meter"} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Small circular progress used on health milestones. */
export function Ring({ value, children, size = 52 }: { value: number; children: ReactNode; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const done = value >= 1;
  return (
    <div style={{ position: "relative", width: size, height: size }} aria-hidden>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill={done ? "var(--leaf-pale)" : "var(--paper)"} stroke="var(--air-deep)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--leaf)" strokeWidth={4} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))}
        />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: size * 0.42 }}>{children}</span>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

/** 1-5 rating picker. */
export function Scale({ label, value, onChange, low, high }: { label: string; value: number | null; onChange: (v: number) => void; low: string; high: string }) {
  return (
    <div>
      <div className="spread"><span className="soft">{label}</span><span className="muted" style={{ fontSize: ".85rem" }}>{low} → {high}</span></div>
      <div className="scale" role="group" aria-label={label} style={{ marginTop: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={value === n} onClick={() => onChange(n)}>{n}</button>
        ))}
      </div>
    </div>
  );
}

export function Chips<K extends string>({ options, selected, onToggle, label }: { options: [K, string][]; selected: K[]; onToggle: (k: K) => void; label: string }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map(([key, text]) => (
        <button key={key} type="button" className="chip" aria-pressed={selected.includes(key)} onClick={() => onToggle(key)}>{text}</button>
      ))}
    </div>
  );
}

export function Select<K extends string>({ value, options, onChange, allowEmpty }: { value: K | ""; options: [K, string][]; onChange: (v: K | "") => void; allowEmpty?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as K | "")}>
      {allowEmpty !== undefined && <option value="">{allowEmpty}</option>}
      {options.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
    </select>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="muted" style={{ padding: "8px 0" }}>{children}</p>;
}
