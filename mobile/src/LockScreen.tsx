import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { styles } from "../../editors/quit-journey-editor/styles.js";
import { useLocaleAttrs } from "./MobileIntl.js";
import { lockoutRemaining, verifyPin } from "./privacy.js";

/**
 * Full-screen PIN prompt shown on launch and after more than a minute in the background.
 * Rendered outside QuitJourneyApp, so wrap it in MobileIntlProvider.
 */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const intl = useIntl();
  const attrs = useLocaleAttrs();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  const tooMany = (ms: number) =>
    intl.formatMessage(
      { id: "mobile.lock.tooManyTries", defaultMessage: "Too many tries. Wait {seconds, plural, one {# second} other {# seconds}}." },
      { seconds: Math.ceil(ms / 1000) },
    );

  async function submit() {
    if (busy || !pin) return;
    const wait = lockoutRemaining();
    if (wait > 0) {
      setError(tooMany(wait));
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
    setError(after > 0 ? tooMany(after) : intl.formatMessage({ id: "mobile.lock.wrongPin", defaultMessage: "That PIN isn't right." }));
    input.current?.focus();
  }

  return (
    <div className="qj lock-screen" {...attrs}>
      <style>{styles}</style>
      <form className="lock-card stack" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <h2>{intl.formatMessage({ id: "mobile.lock.heading", defaultMessage: "Enter your PIN" })}</h2>
        <label className="field">
          <span className="visually-hidden">{intl.formatMessage({ id: "mobile.lock.pinLabel", defaultMessage: "PIN" })}</span>
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
        <button type="submit" className="btn" disabled={busy || pin.length < 4}>{intl.formatMessage({ id: "mobile.lock.unlock", defaultMessage: "Unlock" })}</button>
        <p className="muted">
          {intl.formatMessage({ id: "mobile.lock.forgot", defaultMessage: "Forgot it? Clearing the app's storage in Android settings removes the PIN, and every journey on this phone with it." })}
        </p>
      </form>
    </div>
  );
}
