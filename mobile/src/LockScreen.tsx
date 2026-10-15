import { useEffect, useRef, useState } from "react";
import { styles } from "../../editors/quit-journey-editor/styles.js";
import { lockoutRemaining, verifyPin } from "./privacy.js";

/** Full-screen PIN prompt shown on launch and after more than a minute in the background. */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  async function submit() {
    if (busy || !pin) return;
    const wait = lockoutRemaining();
    if (wait > 0) {
      setError(`Too many tries. Wait ${Math.ceil(wait / 1000)} seconds.`);
      return;
    }
    setBusy(true);
    const ok = await verifyPin(pin);
    setBusy(false);
    if (ok) {
      onUnlock();
      return;
    }
    setPin("");
    const after = lockoutRemaining();
    setError(after > 0 ? `Too many tries. Wait ${Math.ceil(after / 1000)} seconds.` : "That PIN isn't right.");
    input.current?.focus();
  }

  return (
    <div className="qj lock-screen">
      <style>{styles}</style>
      <form className="lock-card stack" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <h2>Enter your PIN</h2>
        <label className="field">
          <span className="visually-hidden">PIN</span>
          <input
            ref={input}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            aria-invalid={error ? true : undefined}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(null); }}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={busy || pin.length < 4}>Unlock</button>
        <p className="muted">Forgot it? Clearing the app's storage in Android settings removes the PIN, and every journey on this phone with it.</p>
      </form>
    </div>
  );
}
